---
title: "Test"
date: 2025-02-02
categories: ["Test", "Debug"]
layout: post
description: "This is a test article to verify if Jekyll reads posts correctly."
tags: ["jekyll", "debug", "test"]
thumbnail: 1-thumbnail.png
---

# Test Article

This is a **test article** to verify that `_posts` is working correctly.

## ✅ Testing Jekyll Post Rendering

- **Title:** `{{ page.title }}`
- **Date:** `{{ page.date }}`
- **Categories:** `{{ page.categories | join: ", " }}`
- **Tags:** `{{ page.tags | join: ", " }}`
- **Description:** `{{ page.description }}`

---
