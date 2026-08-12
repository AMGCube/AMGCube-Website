# Project Progress Image Processor

**用途仅限于：AMGCUBE 项目详情页上显示的施工进度照片（construction progress photos）。**

把工地照片处理成进度图区块需要的规格。**本地工具，与网站构建完全无关**，不会被发布。

## 当前输出规格

| 项目 | 值 |
|---|---|
| 格式 | WebP |
| 尺寸 | 1600 × 1200 px |
| 方向与比例 | 横图 landscape 4:3 |
| 目标大小 | ≤ 300 KB |

## ⚠️ 不要用这个工具处理

**Do not use this tool for project cover images, thumbnails, homepage images,
renders or plans.**

不要用于项目封面图、列表缩略图、首页图片、效果图或平面图。

这些图片在网站上使用**不同的比例**，用这个工具处理会把画面裁错：

| 用途 | 网站显示比例 | 本工具输出 |
|---|---|---|
| 施工进度图 | **4:3** | ✅ 4:3 — 正确 |
| 项目封面 / 缩略图 | 16:10（卡片）＋ 16:9（首页） | ❌ 会裁错 |
| 详情页 Hero | 16:9（桌面）/ 4:3（移动） | ❌ 会裁错 |
| 平面图 / 效果图 | 目前网站未显示 | ❌ 不适用 |

这些规格以后如果需要，应该另建工具或另加参数，不要直接套用本工具。

---

## 工作流程

```text
OneDrive
  → 挑选照片
  → 把原图复制到 incoming/
  → npm run process-progress-images
  → 打开 processed/ 逐张看一遍
  → 选出满意的
  → 重命名后放进对应项目的 progress/ 目录
```

命令在**仓库根目录**运行：

```bash
npm run process-progress-images
```

第一次使用前需要先装依赖（只需一次）：

```bash
npm install
```

---

## 输出规格（完整）

规格来自对线上网站的图片审计——进度图在页面上被固定裁成 4:3，移动端最宽约 735 CSS px，
2 倍屏需要约 1470 px，所以 1600 px 长边留有余量。

| 项目 | 值 |
|---|---|
| 格式 | WebP |
| 方向 | 横图 |
| 比例 | 4:3 |
| 尺寸 | 1600 × 1200 px |
| 理想大小 | 150–250 KB |
| 硬上限 | 300 KB |
| 质量范围 | WebP quality 58–92（自动选择） |

压缩不是固定一档。脚本从 quality 82 开始，超过 300 KB 就每次降 6 档重试，最低降到 58 就不再降了——
**宁可文件大一点，也不会把照片压坏**。反过来，如果 82 档出来还不到 150 KB，说明还有余量，
脚本会往上试到最高 92，把余量花在画质上。

终端里会显示每张图最终用了哪一档。

---

## 支持的输入格式

| 格式 | 状态 |
|---|---|
| JPG / JPEG | 支持 |
| PNG | 支持 |
| WebP | 支持 |
| HEIC / HEIF | **支持，但仅限 macOS** — 见下方说明 |

其他格式会被忽略，并在终端末尾列出。

### HEIC 支持说明

iPhone 拍的 HEIC 用的是 HEVC 编码。`sharp` 自带的 libvips 出于专利授权原因**不包含 HEVC 解码**，
所以它读不了 iPhone 的 HEIC（能读 AVIF 编码的 `.heic`，但那种很少见）。

处理方式：脚本先让 sharp 试一次，失败就自动改用 macOS 自带的 `sips` 命令解码，
再交回 sharp 继续处理。`sips` 是 macOS 系统自带的，不需要额外安装，这条路径在本机是可靠的。

终端里会标注 `(decoded via sips)`。

**在 Windows 或 Linux 上，HEIC 会失败**并给出明确提示，不会静默出错。那种情况下先手动转成 JPG 再放进
`incoming/`。这是有意的取舍——与其装一套脆弱的依赖，不如把限制说清楚。

---

## 原图会怎么样？

**完全不动。**

脚本只读 `incoming/`，从不写入、改名或删除里面的任何文件。处理失败时原图也留在原地。

输出一律写到 `processed/`。**不会覆盖已有文件**：如果 `IMG_4821.webp` 已经存在，
新的会存成 `IMG_4821-1.webp`，并在终端提示。

文件名保持原样，只换扩展名：

```text
IMG_4821.HEIC  →  IMG_4821.webp
```

业务名称（比如 `2026-08-14-slab-poured.webp`）在放进项目 `progress/` 目录时再手动命名。

### 会被清除的信息

输出图片**不含任何 EXIF 元数据**，包括 **GPS 定位**、设备型号、拍摄时间。
这是有意的——工地照片常带客户住址的 GPS 坐标，不应该发到公网上。

拍摄方向（EXIF orientation）会在裁切**之前**先被应用，所以竖着拍的照片不会变成横躺的。

---

## 裁切警告的含义

网站的进度图槽位是写死的 4:3 + `object-fit: cover`，所以**任何不是 4:3 的照片都会被裁掉一部分**。
脚本会算出裁掉了多少，并分成三档：

| 提示 | 含义 | 要不要管 |
|---|---|---|
| `no crop needed` | 源图正好 4:3 | 不用 |
| `minimal crop` | 裁掉不到 5% | 不用 |
| `moderate crop` | 裁掉 5–15% | 扫一眼即可 |
| `substantial crop` | **裁掉超过 15%** | **必须看输出图** |
| `portrait source` | **竖图** | **必须看输出图** |

竖图是最需要注意的：一张 3:4 的竖图裁成 4:3 会丢掉大约 44% 的高度，通常上下两头都没了。
脚本**不会**因此拒绝处理——它照样生成输出，让你自己看效果。如果确实不能用，回去重拍横图。

**拍照建议**：横拍，主体放在画面中间偏下，四周留一点余量。

---

## 清理目录

三个目录里的照片都不会进 Git（见仓库根目录 `.gitignore`），可以随时删。

```bash
# 清空 incoming（确认已经处理完了）
rm -f tools/project-progress-image-processor/incoming/*.{jpg,jpeg,png,webp,heic,heif,JPG,JPEG,PNG,WEBP,HEIC,HEIF}

# 清空 processed（确认需要的已经复制到项目目录了）
rm -f tools/project-progress-image-processor/processed/*.webp

# 清空 rejected 的诊断记录
rm -f tools/project-progress-image-processor/rejected/*.txt
```

**注意**：这些命令特意只删指定扩展名，不用 `rm -rf`，也不会删掉 `.gitkeep`。
`.gitkeep` 用来保证空目录仍然在仓库里，请不要删。

清空 `processed/` 之前先确认想要的图片已经复制走了——**这一步没有回收站**。

---

## 终端输出示例

```text
AMGCube project image processor
Output standard: 1600 × 1200 WebP, 4:3 landscape, target ≤ 300 KB

✓ IMG_4821.HEIC
  Original: 4032 × 3024 | 3.8 MB | HEIF (decoded via sips)
  Output:   1600 × 1200 | 218 KB | WebP quality 82 → IMG_4821.webp
  Crop:     4:3 | no crop needed

⚠ IMG_4822.JPG
  Original: 3024 × 4032 | 4.1 MB | JPEG
  Output:   1600 × 1200 | 236 KB | WebP quality 82 → IMG_4822.webp
  Crop:     4:3 | substantial crop — 44% of top/bottom removed
  Warning:  portrait source (0.75:1) — 44% of the image height is discarded by
            the 4:3 crop. Manual review strongly recommended.

Processed: 2
Warnings:  1
Failed:    0
```

处理失败不会中断整批——脚本会报错、在 `rejected/` 写一份诊断记录（**只有文字说明，不复制照片**），
然后继续处理下一张。

---

## 与网站的关系

这个目录被 `_config.yml` 的 `exclude` 排除在 Jekyll 构建之外，`node_modules/` 和 `package.json`
也一样。运行这个工具不会影响 `bundle exec jekyll serve` 或 GitHub Pages 的构建。

依赖只有一个：[`sharp`](https://sharp.pixelplumbing.com/)。
