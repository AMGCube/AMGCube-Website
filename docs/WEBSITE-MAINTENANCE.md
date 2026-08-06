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
