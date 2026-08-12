# AMGCUBE 网站日常维护

本说明只覆盖两个常用操作。建议每次在GitHub创建独立维护分支，完成检查后再合并到网站发布分支。

## 1. 更换首页Hero图片

首页Hero图片保存在`img/`，当前轮播配置在`_data/hero_slides.yml`。

1. 将新图片处理为接近16:9，建议1600×900px。
2. 照片优先使用WebP（约250–450KB）；透明线稿使用透明WebP或压缩PNG。
3. 在GitHub打开`img/`，选择 **Add file → Upload files** 上传图片。
4. 打开`_data/hero_slides.yml`，修改对应项目的`image:`路径，同时更新`alt:`说明。
5. 如果只需要一张Hero图，删除另一整组`image / alt / label`配置；否则网站会自动轮播。
6. Commit后检查首页桌面端和手机端。手机端会适度放大图片，建筑主体应尽量位于画面中央。

直接用原文件名覆盖可以不改代码，但新文件名更容易避免浏览器缓存。

## 2. 新增和维护Projects项目

> **过渡说明（2026-08）**
> Sunnybank Hills项目已迁移到新的`_projects/`目录，维护方式见下方「3. Sunnybank Hills项目」。
> Oxley和One Sino Park仍在`_posts/`，继续按本节说明维护。两种方式目前同时有效。

项目文件位于`_posts/`，图片位于`img/projects/`。

### 新增项目

1. 复制`templates/project-template.md`的内容。
2. 在`_posts/`创建新文件，例如`2026-08-06-projects-suburb-granny-flat.md`。
3. 粘贴模板并填写字段；不要删除开头和正文前的`---`。
4. 在`img/projects/`上传独立项目目录，例如`img/projects/suburb-granny-flat/`。
5. 确认Markdown中的图片路径与GitHub中的文件名完全一致，注意大小写。
6. `date`越新，项目在Projects列表中越靠前。

### 更新施工进度

1. 将新图片上传到项目的`progress/`目录。
2. 打开对应的`_posts`项目文件。
3. 在`progress:`下方最上面加入新的`img / text / alt`记录。
4. 横图使用`orientation: landscape`，竖图使用`orientation: portrait`。

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

## 3. Sunnybank Hills项目（新维护方式）

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
