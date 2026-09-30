---
date: '2026-09-29T18:39:42+07:00'
draft: false
title: 'Complete Guide: Building an Engineering Blog with Hugo, PaperMod & Cloudflare Pages'
description: 'Step-by-step guide to building a zero-cost personal engineering blog using Hugo, PaperMod theme, Cloudflare Pages, and Giscus comments. Estimated setup time: 2–3 hours.'
summary: 'Step-by-step guide to building a zero-cost personal engineering blog using Hugo, PaperMod theme, Cloudflare Pages, and Giscus comments. Estimated setup time: 2–3 hours.'
tags: ["hugo", "blog", "cloudflare", "giscus", "guide"]
ShowToc: true
TocOpen: true
---

> Estimated setup time: **2–3 hours** | Updated: 2026-09

This guide synthesizes the entire workflow for setting up a $0 static engineering blog with automated CI/CD builds on Cloudflare Pages and secure discussions powered by GitHub Discussions.

## 1. Project Evidence & Live Demo

| Metric / Item | Evidence | Technical Specification |
|---|---|---|
| **Live Site (Demo)** | [`glory-hinody.pages.dev`](https://glory-hinody.pages.dev/) | Production website, page load latency < 500ms |
| **Repository (GitHub)** | [`github.com/vinh-gogo/glory-hinody`](https://github.com/vinh-gogo/glory-hinody) | Open-source, PaperMod managed as Git submodule |
| **Comments (Discussions)** | [`github.com/vinh-gogo/glory-hinody/discussions`](https://github.com/vinh-gogo/glory-hinody/discussions) | Bi-directional sync via Giscus API with automated anti-spam |
| **CI/CD Automation** | Cloudflare Pages Git Integration | Triggers `hugo --gc --minify` automatically on each `git push` |

---

## 2. Architecture & Workflow Overview

You author Markdown locally, run `git push` to GitHub, and Cloudflare Pages automatically compiles and deploys the static assets globally across edge nodes:

```mermaid
flowchart LR
    A["Write Article (.md)"] --> B["git push"]
    B --> C["GitHub Repository"]
    C --> D["Cloudflare Pages (auto build)"]
    D --> E["Global Edge Deployment"]
    E --> F["Comments / Likes (Giscus)"]
```

## Phase 0: Prerequisites (15 mins)

1. Create free accounts on **GitHub** and **Cloudflare**.
2. Install **Git** and the **Hugo Extended** binary (Windows: `winget install Hugo.Hugo.Extended`; macOS: `brew install hugo`).
3. Set up an editor (e.g. VS Code).
4. Verify installations by executing `hugo version` and `git --version` in terminal.

## Phase 1: Local Setup (30 mins)

```bash
hugo new site myblog
cd myblog
git init
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

Create `hugo.yaml` at the project root:

```yaml
baseURL: "https://myblog.pages.dev/"
defaultContentLanguage: en
title: "My Engineering Blog"
theme: PaperMod

params:
  description: "Technical logbook and software engineering notes"
  defaultTheme: auto
  ShowReadingTime: true
  ShowShareButtons: true
  comments: true
  ShareButtons: ["linkedin", "x", "telegram", "facebook"]

menu:
  main:
    - { name: "POSTS", url: "/posts/", weight: 1 }
    - { name: "ABOUT", url: "/about/", weight: 2 }
```

Create your first post and test the local server:

```bash
hugo new posts/first-post.md
# Edit markdown, change draft: true to draft: false
hugo server
```

Preview at `http://localhost:1313`.

## Phase 2: Publishing to GitHub (10 mins)

1. Create a **public** repository on GitHub (public visibility is required for Giscus to authenticate discussions).
2. Create `.gitignore`:

```gitignore
public/
resources/_gen/
.hugo_build.lock
```

3. Push source code:

```bash
git add .
git commit -m "Initialize engineering blog"
git branch -M main
git remote add origin https://github.com/USERNAME/myblog.git
git push -u origin main
```

## Phase 3: Setting Up Giscus (20 mins)

1. Navigate to repository → **Settings → General → Features** → check **Discussions**.
2. Install Giscus App at `github.com/apps/giscus`, targeting `myblog`.
3. In repository **Discussions**, create an **Announcements** category (ensures only admins and Giscus can spawn threads).
4. Navigate to `giscus.app`, input repository details, and select:
   - Mapping: **pathname**
   - Category: Announcements
   - Enable reactions
5. Copy the generated snippet into `layouts/partials/comments.html`.

## Phase 4: Deploying to Cloudflare Pages (20 mins)

1. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, select `myblog`.
2. Configure build settings:
   - Build command: `hugo --gc --minify`
   - Output directory: `public`
3. Add the `HUGO_VERSION` environment variable matching your local binary (e.g. `0.167.0`).
4. Trigger deployment. The site will publish to `https://myblog.pages.dev`.

## Troubleshooting Common Gotchas

| Symptom | Probable Cause |
|---|---|
| Blank page or missing CSS | Missing `HUGO_VERSION` env variable, or uninitialized submodule |
| Comments fail to load | Repository is private, Giscus app not installed, or invalid category ID |
| Mismatched comment threads | `data-mapping` not configured to `pathname`, or URL slug was altered |
| New post omitted | `draft: true` remaining in frontmatter, or `date` set in the future |

---

## References

```
[01] Hugo Team. (2024). The World's Fastest Framework for Building Websites.
     Hugo Official Documentation (gohugo.io).
[02] Aditya Telange. (2024). PaperMod Theme Documentation and Feature Specifications.
     GitHub Wiki (github.com/adityatelange/hugo-PaperMod).
[03] Cloudflare. (2024). Cloudflare Pages: Fast, Secure and Free JAMstack Hosting.
[04] Giscus Project. (2024). A Comment System Powered by GitHub Discussions.
```

---

## Related Technical Logs

- [OpenVideoLab: Multimodal AI Video Generation on 16GB GPUs](/en/posts/openvideolab-video-diffusion/)
- [GraphRAG: Fusing Neo4j and Qdrant to Mitigate Hallucination](/en/posts/graph-rag-neo4j-qdrant/)
