---
# ---------------------------------------------------------------------------
# Sunnybank Hills Granny Flat — pilot project for the _projects collection
#
# slug           = this filename (sunnybank-hills-granny-flat)
# image folder   = /img/projects/sunnybank-hills-granny-flat/   (same slug)
#
# 新增施工进度时，只需要在下方 progress: 顶部加一条记录，并把图片放进
# img/projects/sunnybank-hills-granny-flat/progress/。页面会自动更新。
# ---------------------------------------------------------------------------

# --- Identity ---------------------------------------------------------------
title: Sunnybank Hills Granny Flat          # 项目正式名称
card-title: Nym Ct, Sunnybank Hills         # 列表卡片与详情页标题
subtitle: Active granny flat project in Sunnybank Hills, Brisbane
layout: project

# 排序依据（列表页按此倒序）
date: 2026-07-25

# 保留原有网址，避免已发布链接和 sitemap 失效。
# 删除这一行则自动变成 /projects/sunnybank-hills-granny-flat/
permalink: /projects/brisbane-granny-flat-project/

listed: true                                # false = 从列表隐藏，详情页保留
featured: false                             # 首页展示项目（同一时间只应有一个）

# --- Location ---------------------------------------------------------------
location: Sunnybank Hills, Brisbane
council: Brisbane

# --- Status -----------------------------------------------------------------
project-status: In Progress
status-label: In Progress
status-key: in-progress                     # in-progress | completed
current-stage: Underground Services         # 当前施工阶段

# --- Specification ----------------------------------------------------------
project-type: Granny flat
floor-area: 80m²
layout-summary: 2 bed · 2 bath
commencement: 2026-07-10
# completion: 2026-12-01                    # 完工后填写，工期会自动计算

# --- Summary ----------------------------------------------------------------
card-description: An active granny flat project in Sunnybank Hills, Brisbane.

# --- Images -----------------------------------------------------------------
thumbnail: /img/projects/sunnybank-hills-granny-flat/thumbnail.webp
hero-image: /img/projects/sunnybank-hills-granny-flat/hero.webp
hero-alt: Front elevation drawing for the Sunnybank Hills granny flat project
og_image: /img/projects/sunnybank-hills-granny-flat/hero.webp

# 平面图与效果图已存在于 img/projects/sunnybank-hills-granny-flat/plans/，
# 但目前没有任何页面区块显示它们。需要展示时再启用，避免出现"填了却不生效"的字段。
# gallery:
#   - src: /img/projects/sunnybank-hills-granny-flat/plans/floor-plan.webp
#     alt: Floor plan for the Sunnybank Hills granny flat
#   - src: /img/projects/sunnybank-hills-granny-flat/plans/front-elevation.webp
#     alt: Front elevation for the Sunnybank Hills granny flat

# --- Progress updates -------------------------------------------------------
# 最新的记录放最上面。字段说明：
#   date        必填 · YYYY-MM-DD
#   stage       必填 · 施工阶段
#   title       选填 · 该次更新的重点
#   description 选填 · 一到两句说明（填写后显示在图片说明下方）
#   images      必填 · 至少一张；每张需要 src 和 alt
progress:
  - date: 2026-07-22
    stage: Stormwater, sewer and water services completed
    title: Council inspection passed
    images:
      - src: /img/projects/sunnybank-hills-granny-flat/progress/2026-07-22-underground-services-council-inspection.webp
        alt: Completed stormwater, sewer and water-service pipework following Council inspection

  - date: 2026-07-18
    stage: Ground piers completed
    title: On-site dimension check
    images:
      - src: /img/projects/sunnybank-hills-granny-flat/progress/2026-07-18-ground-piers-dimension-check.webp
        alt: On-site dimension check after the concrete ground piers were completed

  - date: 2026-07-10
    stage: Construction start
    title: Site levelling
    images:
      - src: /img/projects/sunnybank-hills-granny-flat/progress/2026-07-10-construction-start-site-levelling.webp
        alt: Track loader levelling the site at the start of construction

  - date: 2026-07-03
    stage: Before construction
    images:
      - src: /img/projects/sunnybank-hills-granny-flat/progress/2026-07-03-before-construction.webp
        alt: Backyard site before construction began
---

This granny flat project is located in Sunnybank Hills QLD 4109 and is currently in progress.

The current recorded stage is **underground services**. Further project information and construction updates will be added as the work develops and details become available for publication.
