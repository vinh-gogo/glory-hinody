# Project Brief — Glory Hinody

## Project Identity
- **Name:** glory-hinody
- **URL:** https://glory-hinody.pages.dev
- **Repo:** https://github.com/vinh-gogo/glory-hinody
- **Owner:** vinh-gogo (lea26462@gmail.com)

## What This Is
Personal technical blog — editorial & logbook style. Tập trung vào AI, LangGraph, engineering discipline. Không generic. Typographical confidence.

## Core Requirements
1. **Static site** — Hugo v0.167.0-extended, theme PaperMod (git submodule)
2. **Bilingual** — VI (default) / EN via Google Translate cookie mechanism
3. **Deployed** on Cloudflare Pages từ branch `main`
4. **Dev branch** `dev` → PR → merge vào `main` → auto-deploy
5. **Security hardened** — multi-layer protection (CSP, SRI, DOM guard, attack path blocks)
6. **Math + Diagrams** — KaTeX, Mermaid (securityLevel: antiscript)
7. **Comments** — Giscus (GitHub Discussions)
8. **Zero warnings** trên `hugo --minify`

## Workflow
```
Code → dev branch → PR → review → merge main → Cloudflare auto-deploy
```

## Constraints
- **Pure static** — không có server-side code, không SQLi/RCE risk
- `markup.goldmark.renderer.unsafe: true` — intentional (KaTeX cần raw HTML), KHÔNG thay đổi
- `'unsafe-inline'` trong CSP script-src — intentional (Google Translate inline onclick)
- Theme PaperMod là git submodule — KHÔNG edit trực tiếp, override qua `layouts/`

## Source of Truth for Scope
Blog cá nhân, solo author, không user-generated content → security focus là XSS/supply-chain/clickjacking, không phải SQLi/auth.
