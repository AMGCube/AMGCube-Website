# AMGCUBE 网站日常维护

本说明只覆盖首页 Hero 和 Projects 的常用维护操作。建议每次在 GitHub 创建独立维护分支，完成检查后再合并到网站发布分支。

当前正式页面包括 Home、Can I Build 及四个子页、Projects、Oxley、Sunnybank Hills、About 和 Contact。内部文档位于 `docs/`，该目录不会输出到 Production。

## 1. 更换首页Hero图片

首页Hero图片保存在`img/`，当前轮播配置在`_data/hero_slides.yml`。

1. 将新图片处理为接近16:9，建议1600×900px。
2. 照片优先使用WebP（约250–450KB）；透明线稿使用透明WebP或压缩PNG。
3. 在GitHub打开`img/`，选择 **Add file → Upload files** 上传图片。
4. 打开`_data/hero_slides.yml`，修改对应项目的`image:`路径，同时更新`alt:`说明。
5. 如果只需要一张Hero图，删除另一整组`image / alt / label`配置；否则网站会自动轮播。
6. Commit后检查首页桌面端和手机端。手机端会适度放大图片，建筑主体应尽量位于画面中央。

直接用原文件名覆盖可以不改代码，但新文件名更容易避免浏览器缓存。

## 2. 新增和维护 Projects 项目

项目数据统一放在 `_projects/`，图片放在 `img/projects/<slug>/`。现有 Oxley 项目因历史 URL 兼容仍保留在 `_posts/2025-02-08-projects-146downding.markdown`；维护 Oxley 时直接更新该文件，不要移动或改动其 permalink。

### 新增项目

1. 参考 `templates/project-template.md` 的字段。
2. 在 `_projects/` 创建以 slug 命名的文件，例如 `suburb-granny-flat.md`。
3. 粘贴模板并填写字段；不要删除开头和正文前的`---`。
4. 在 `img/projects/` 上传同名项目目录，例如 `img/projects/suburb-granny-flat/`。
5. 确认Markdown中的图片路径与GitHub中的文件名完全一致，注意大小写。
6. `date`越新，项目在Projects列表中越靠前。

### 更新施工进度

1. 将新图片上传到项目的`progress/`目录。
2. 打开对应的 `_projects` 项目文件；Oxley 仍更新上述 `_posts` 文件。
3. 按项目文件现有 `progress:` 数据结构，在最上面加入新记录。
4. 保持该项目当前使用的字段格式；每张图片都应填写准确的 `alt`。

### 隐藏项目

将项目文件中的：

```yaml
listed: true
```

改为：

```yaml
listed: false
```

项目会从Projects列表隐藏，但详情页和图片仍然保留。

### 设为首页展示项目

将目标项目设置为：

```yaml
featured: true
```

其他项目应设置为：

```yaml
featured: false
```

**同一时间原则上只应有一个项目设置为`featured: true`。** 如果误设多个，首页会显示`date`最新的项目；如果没有任何featured项目，网站会自动回退到Oxley展示房。

## 3. Sunnybank Hills 项目

数据文件：`_projects/sunnybank-hills-granny-flat.md`
图片目录：`img/projects/sunnybank-hills-granny-flat/`

文件名就是项目slug，必须与图片目录同名。网址由文件内的`permalink:`决定。

### 新增一次施工进度

1. 把照片转成WebP，命名为`YYYY-MM-DD-简短描述.webp`，上传到
   `img/projects/sunnybank-hills-granny-flat/progress/`。
2. 打开`_projects/sunnybank-hills-granny-flat.md`。
3. 在`progress:`下方**最上面**加一条记录（最新的在最前）：

```yaml
  - date: 2026-08-14
    stage: Slab poured
    title: Concrete pour completed
    description: 可选。填写后显示在图片说明下方，不填就不显示。
    images:
      - src: /img/projects/sunnybank-hills-granny-flat/progress/2026-08-14-slab-poured.webp
        alt: Concrete slab being poured at the Sunnybank Hills site
```

4. 如果施工阶段变了，把上方的`current-stage:`一起改掉。

字段说明：

- `date` 必填，格式`YYYY-MM-DD`。图片说明的日期由它自动生成。
- `stage` 必填，施工阶段。
- `title` 选填，该次更新的重点。
- `description` 选填，一到两句说明。
- `images` 必填，至少一张。**一条记录可以放多张图**，每张都需要`src`和`alt`。

图片说明会自动拼成`日期 · stage · title`，不需要手写。

### 项目完工时

1. 加上`completion: YYYY-MM-DD`（工期自动计算）。
2. 把`status-key`改成`completed`，`status-label`和`project-status`改成`Completed`。
3. 删除`current-stage:`。
