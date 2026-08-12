#!/usr/bin/env node
'use strict';

/**
 * AMGCube — project PROGRESS image processor
 *
 * Scope: construction progress photos shown in the progress gallery on project
 * detail pages. Nothing else. Cover images, thumbnails, homepage images, plans
 * and renders are displayed at different ratios and must not go through here.
 *
 * Reads everything in ./incoming, writes 4:3 landscape 1600x1200 WebP files to
 * ./processed, and never touches the originals.
 *
 * The output standard comes from the image audit of the live site: progress
 * photos are displayed in a fixed 4:3 box with `object-fit: cover`, at up to
 * ~735 CSS px wide on mobile. 1600x1200 covers that at 2x with headroom.
 *
 * Run from the repository root:  npm run process-progress-images
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const sharp = require('sharp');

// ---------------------------------------------------------------------------
// Output standard
// ---------------------------------------------------------------------------

const TARGET_WIDTH = 1600;
const TARGET_HEIGHT = 1200;
const TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT; // 4:3

const SIZE_CEILING = 300 * 1024; // hard target
const SIZE_PREFERRED_MIN = 150 * 1024; // below this we try to spend more quality

const QUALITY_START = 82;
const QUALITY_MIN = 58; // never go below this, even if the file stays oversized
const QUALITY_MAX = 92;
const QUALITY_STEP = 6;

// Crop severity thresholds, as a fraction of the original long edge removed.
const CROP_MINIMAL = 0.05;
const CROP_SUBSTANTIAL = 0.15;

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']);
const HEIF_EXTS = new Set(['.heic', '.heif']);

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = __dirname;
const INCOMING = path.join(ROOT, 'incoming');
const PROCESSED = path.join(ROOT, 'processed');
const REJECTED = path.join(ROOT, 'rejected');

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function pct(fraction) {
  return `${Math.round(fraction * 100)}%`;
}

/** Pick an output path that never overwrites an existing file. */
function uniqueOutputPath(dir, baseName) {
  let candidate = path.join(dir, `${baseName}.webp`);
  let n = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${baseName}-${n}.webp`);
    n += 1;
  }
  return candidate;
}

// ---------------------------------------------------------------------------
// Decoding
// ---------------------------------------------------------------------------

/**
 * Return a sharp-readable Buffer for the source file.
 *
 * sharp's prebuilt libvips ships HEIF support for AVIF only — HEIC files from
 * an iPhone are HEVC-coded and cannot be decoded by it. On macOS we hand those
 * to `sips`, which is part of the OS and decodes HEIC natively. Elsewhere the
 * file is reported as unsupported rather than half-working.
 */
async function readSource(filePath, ext) {
  const buffer = fs.readFileSync(filePath);

  if (!HEIF_EXTS.has(ext)) {
    return { buffer, via: 'sharp' };
  }

  // Try sharp first — an AVIF-coded file carrying a .heic extension decodes fine.
  // Force real pixel work, not just a header read, so we know before committing.
  try {
    await sharp(buffer).resize(8, 8, { fit: 'fill' }).raw().toBuffer();
    return { buffer, via: 'sharp' };
  } catch (_) {
    // HEVC-coded HEIC — fall through to sips.
  }

  if (os.platform() !== 'darwin') {
    throw new Error(
      'HEIC/HEIF decoding is unavailable on this platform. Convert to JPEG first, ' +
        'or run this tool on macOS (see README).'
    );
  }

  const tmp = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'amgcube-img-')),
    'converted.png'
  );
  try {
    execFileSync('sips', ['-s', 'format', 'png', filePath, '--out', tmp], {
      stdio: 'pipe',
    });
  } catch (err) {
    throw new Error(`HEIC decode via sips failed: ${err.message.trim()}`);
  }
  const decoded = fs.readFileSync(tmp);
  fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
  return { buffer: decoded, via: 'sips' };
}

// ---------------------------------------------------------------------------
// Crop analysis
// ---------------------------------------------------------------------------

/**
 * Work out what a centre 4:3 cover-crop discards, using post-rotation
 * dimensions (i.e. what the viewer would actually see).
 */
function analyseCrop(width, height) {
  const ratio = width / height;
  const portrait = ratio < 1;

  let axis = 'none';
  let removed = 0;

  if (Math.abs(ratio - TARGET_RATIO) < 0.005) {
    axis = 'none';
    removed = 0;
  } else if (ratio > TARGET_RATIO) {
    axis = 'left/right';
    removed = 1 - TARGET_RATIO / ratio;
  } else {
    axis = 'top/bottom';
    removed = 1 - ratio / TARGET_RATIO;
  }

  let severity = 'none';
  if (removed > 0 && removed < CROP_MINIMAL) severity = 'minimal';
  else if (removed >= CROP_MINIMAL && removed < CROP_SUBSTANTIAL) severity = 'moderate';
  else if (removed >= CROP_SUBSTANTIAL) severity = 'substantial';

  return { ratio, portrait, axis, removed, severity };
}

/** Width of the 4:3 region that survives a centre cover-crop of w x h. */
function croppedWidth(w, h) {
  return w / h > TARGET_RATIO ? h * TARGET_RATIO : w;
}

function cropDescription(crop) {
  if (crop.severity === 'none') return '4:3 | no crop needed';
  return `4:3 | ${crop.severity} crop — ${pct(crop.removed)} of ${crop.axis} removed`;
}

function cropWarnings(crop) {
  const warnings = [];
  if (crop.portrait) {
    warnings.push(
      `portrait source (${crop.ratio.toFixed(2)}:1) — ${pct(crop.removed)} of the ` +
        'image height is discarded by the 4:3 crop. Manual review strongly recommended.'
    );
  } else if (crop.severity === 'substantial') {
    warnings.push(
      `substantial ${crop.axis} crop — ${pct(crop.removed)} of the source is discarded. ` +
        'Check the output before using it.'
    );
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// Encoding
// ---------------------------------------------------------------------------

/**
 * Encode to WebP, searching for the highest quality that still fits the size
 * ceiling. Starts at a visually sound quality, steps down while oversized, and
 * steps up only when there is clearly budget left unused.
 */
async function encodeToBudget(pipeline) {
  const encode = (quality) =>
    pipeline
      .clone()
      .webp({ quality, effort: 5 })
      .toBuffer()
      .then((buffer) => ({ buffer, quality }));

  let attempt = await encode(QUALITY_START);
  let attempts = 1;

  // Too big — step down gradually until it fits or we hit the floor.
  while (attempt.buffer.length > SIZE_CEILING && attempt.quality > QUALITY_MIN) {
    const next = Math.max(QUALITY_MIN, attempt.quality - QUALITY_STEP);
    attempt = await encode(next);
    attempts += 1;
  }

  // Comfortably under the preferred band — spend the headroom on quality.
  if (attempt.quality === QUALITY_START && attempt.buffer.length < SIZE_PREFERRED_MIN) {
    let best = attempt;
    let quality = QUALITY_START;
    while (quality < QUALITY_MAX) {
      quality = Math.min(QUALITY_MAX, quality + QUALITY_STEP);
      const candidate = await encode(quality);
      attempts += 1;
      if (candidate.buffer.length > SIZE_CEILING) break;
      best = candidate;
    }
    attempt = best;
  }

  return {
    buffer: attempt.buffer,
    quality: attempt.quality,
    attempts,
    overCeiling: attempt.buffer.length > SIZE_CEILING,
  };
}

// ---------------------------------------------------------------------------
// Per-file processing
// ---------------------------------------------------------------------------

async function processFile(fileName) {
  const sourcePath = path.join(INCOMING, fileName);
  const ext = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, path.extname(fileName));

  const sourceBytes = fs.statSync(sourcePath).size;
  const { buffer, via } = await readSource(sourcePath, ext);

  // .rotate() with no argument applies the EXIF orientation tag, so the crop
  // below is calculated against the upright image. sharp drops all metadata
  // (including GPS) unless withMetadata() is called — we never call it.
  const pipeline = sharp(buffer, { failOn: 'error' }).rotate();

  const meta = await pipeline.metadata();
  const rotated = await pipeline.clone().toBuffer({ resolveWithObject: true });
  const width = rotated.info.width;
  const height = rotated.info.height;

  const crop = analyseCrop(width, height);

  const resized = pipeline.clone().resize(TARGET_WIDTH, TARGET_HEIGHT, {
    fit: 'cover',
    position: 'centre', // matches the browser's object-fit: cover default
    withoutEnlargement: false,
  });

  const encoded = await encodeToBudget(resized);

  const outputPath = uniqueOutputPath(PROCESSED, baseName);
  fs.writeFileSync(outputPath, encoded.buffer);

  return {
    fileName,
    // When sips did the decoding, meta.format describes the intermediate PNG,
    // not what the user actually handed us.
    sourceFormat: (via === 'sips' ? ext.replace('.', '') : meta.format || ext.replace('.', ''))
      .toUpperCase(),
    decodedVia: via,
    sourceWidth: width,
    sourceHeight: height,
    sourceBytes,
    outputName: path.basename(outputPath),
    outputBytes: encoded.buffer.length,
    quality: encoded.quality,
    attempts: encoded.attempts,
    overCeiling: encoded.overCeiling,
    renamed: path.basename(outputPath) !== `${baseName}.webp`,
    // After cropping, is there actually enough source left to fill 1600x1200?
    upscaled: croppedWidth(width, height) < TARGET_WIDTH,
    croppedWidth: Math.round(croppedWidth(width, height)),
    crop,
  };
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function reportSuccess(r) {
  const warnings = cropWarnings(r.crop);
  if (r.upscaled) {
    warnings.push(
      `low resolution — only ${r.croppedWidth} px of usable width after cropping, ` +
        `enlarged to ${TARGET_WIDTH} px. The result will look soft. Use a larger original if you have one.`
    );
  }
  if (r.overCeiling) {
    warnings.push(
      `could not reach ${formatBytes(SIZE_CEILING)} at the minimum quality of ` +
        `${QUALITY_MIN} — kept the best version at ${formatBytes(r.outputBytes)} ` +
        'rather than degrading it further.'
    );
  }
  if (r.renamed) {
    warnings.push(
      `a file named ${r.fileName.replace(/\.[^.]+$/, '')}.webp already existed — ` +
        `saved as ${r.outputName} instead. Nothing was overwritten.`
    );
  }

  const mark = warnings.length ? `${c.yellow}⚠${c.reset}` : `${c.green}✓${c.reset}`;
  console.log(`${mark} ${c.bold}${r.fileName}${c.reset}`);
  console.log(
    `  Original: ${r.sourceWidth} × ${r.sourceHeight} | ${formatBytes(r.sourceBytes)}` +
      ` | ${r.sourceFormat}${r.decodedVia === 'sips' ? ' (decoded via sips)' : ''}`
  );
  console.log(
    `  Output:   ${TARGET_WIDTH} × ${TARGET_HEIGHT} | ${formatBytes(r.outputBytes)}` +
      ` | WebP quality ${r.quality} → ${r.outputName}`
  );
  console.log(`  Crop:     ${cropDescription(r.crop)}`);
  for (const w of warnings) {
    console.log(`  ${c.yellow}Warning:${c.reset}  ${w}`);
  }
  console.log('');

  return warnings.length > 0;
}

function reportFailure(fileName, err) {
  console.log(`${c.red}✗${c.reset} ${c.bold}${fileName}${c.reset}`);
  console.log(`  ${c.red}Failed:${c.reset}   ${err.message}`);
  console.log(`  ${c.dim}Source left untouched in incoming/${c.reset}`);

  // Only a diagnostic note goes to rejected/ — never the photo itself.
  try {
    const notePath = uniqueDiagnosticPath(fileName);
    fs.writeFileSync(
      notePath,
      [
        `Source file:  incoming/${fileName}`,
        `Failed at:    ${new Date().toISOString()}`,
        `Error:        ${err.message}`,
        '',
        'The original file has NOT been moved, modified or deleted.',
        'This note is a diagnostic reference only.',
        '',
        (err.stack || '').split('\n').slice(0, 8).join('\n'),
      ].join('\n')
    );
    console.log(`  ${c.dim}Diagnostic written to rejected/${path.basename(notePath)}${c.reset}`);
  } catch (writeErr) {
    console.log(`  ${c.dim}Could not write diagnostic: ${writeErr.message}${c.reset}`);
  }
  console.log('');
}

function uniqueDiagnosticPath(fileName) {
  let candidate = path.join(REJECTED, `${fileName}.error.txt`);
  let n = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(REJECTED, `${fileName}.error-${n}.txt`);
    n += 1;
  }
  return candidate;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  for (const dir of [INCOMING, PROCESSED, REJECTED]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const entries = fs
    .readdirSync(INCOMING, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => !name.startsWith('.'))
    .sort((a, b) => a.localeCompare(b));

  const supported = entries.filter((n) => SUPPORTED.has(path.extname(n).toLowerCase()));
  const skipped = entries.filter((n) => !SUPPORTED.has(path.extname(n).toLowerCase()));

  console.log('');
  console.log(`${c.bold}AMGCube project progress image processor${c.reset}`);
  console.log(`${c.dim}Construction progress photos only — not covers, heroes, plans or renders.${c.reset}`);
  console.log(
    `${c.dim}Output standard: ${TARGET_WIDTH} × ${TARGET_HEIGHT} WebP, 4:3 landscape, ` +
      `target ≤ ${formatBytes(SIZE_CEILING)}${c.reset}`
  );
  console.log('');

  if (supported.length === 0) {
    console.log(`${c.dim}Nothing to do — no supported images in incoming/.${c.reset}`);
    if (skipped.length) {
      console.log(`${c.dim}Ignored ${skipped.length} unsupported file(s): ${skipped.join(', ')}${c.reset}`);
    }
    console.log('');
    return 0;
  }

  let processed = 0;
  let warned = 0;
  let failed = 0;

  for (const fileName of supported) {
    try {
      const result = await processFile(fileName);
      processed += 1;
      if (reportSuccess(result)) warned += 1;
    } catch (err) {
      failed += 1;
      reportFailure(fileName, err);
    }
  }

  console.log(`${c.bold}Processed: ${processed}${c.reset}`);
  console.log(`Warnings:  ${warned}`);
  console.log(`Failed:    ${failed}`);
  if (skipped.length) {
    console.log(`Skipped:   ${skipped.length} unsupported (${skipped.join(', ')})`);
  }
  console.log('');
  console.log(`${c.dim}Output in tools/project-progress-image-processor/processed/${c.reset}`);
  console.log(`${c.dim}Originals in incoming/ were not modified.${c.reset}`);
  console.log('');

  return failed > 0 ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(`${c.red}Fatal:${c.reset} ${err.stack || err.message}`);
    process.exit(1);
  });
