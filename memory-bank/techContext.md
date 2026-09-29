# Tech Context — Glory Hinody

## Core Stack
| Tool | Version | Role |
|---|---|---|
| Hugo | v0.167.0-extended | Static site generator |
| PaperMod | latest (submodule) | Theme |
| Cloudflare Pages | - | Hosting + CDN + Edge headers |
| GitHub | vinh-gogo/glory-hinody | Source control |

## Frontend Libraries (CDN với SRI)
| Library | Version | SRI Hash | Purpose |
|---|---|---|---|
| KaTeX CSS | 0.16.11 | sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+ | Math rendering |
| KaTeX JS | 0.16.11 | sha384-7zkQWkzuo3B5mTepMUcHkMB5jZaolc2xDwL6VFqjFALcbeS9Ggm/Yr2r3Dy4lfFg | Math rendering |
| KaTeX auto-render | 0.16.11 | sha384-43gviWU0YVjaDtb/GhzOouOXtZMP/7XUzwPTstBeZFe/+rCMvRwr4yROQP43s0Xk | Math auto-detect |
| Mermaid | 11 | sha384-EOXBFmc3gx5mb+vn0vPvvGqACToJD24hhacX5Yx+8NUUQrHIle/Qi5Bg9o3zKwW2 | Diagrams |
| Google Translate | element.js | N/A (no SRI) | Language switching |
| Giscus | latest | N/A | Comments |

## Development Setup
```powershell
# Prerequisites
hugo version          # v0.167.0-extended
gh --version          # GitHub CLI

# Local dev
hugo server           # http://localhost:1313

# Build (check for warnings)
hugo --minify         # Target: 0 warnings, 0 errors

# Deploy flow
git add -A
git commit -m "..."
git push              # → dev branch
gh pr create --base main --head dev ...
# Merge PR → Cloudflare auto-deploys main
```

## Hugo Config (`hugo.yaml`)
```yaml
baseURL: "https://glory-hinody.pages.dev/"
theme: PaperMod
defaultContentLanguage: "vi"

markup:
  goldmark:
    renderer:
      unsafe: true    # ⚠️ INTENTIONAL — KaTeX cần raw HTML. KHÔNG thay đổi.
```

## Git Branches
- `main` → production (Cloudflare Pages deploys từ đây)
- `dev` → development (PR target → main)

## Technical Constraints
1. **`unsafe: true`** trong goldmark renderer — bắt buộc cho KaTeX, không thể thay đổi
2. **`'unsafe-inline'`** trong CSP — bắt buộc cho Google Translate inline handlers
3. **Static only** — không có server, không database, không API endpoints
4. **Git submodule** — `themes/PaperMod` không được edit trực tiếp

## Critical Files (KHÔNG được xoá)
| File | Tại sao quan trọng |
|---|---|
| `static/_headers` | Cloudflare edge security — CSP, HSTS, etc. |
| `static/_redirects` | Block 20+ attack paths |
| `static/js/security-guard.js` | Runtime DOM protection v3 |
| `static/.well-known/security.txt` | RFC 9116 compliance |
| `layouts/partials/templates/opengraph.html` | Override fix deprecated LanguageCode |
| `layouts/rss.xml` | Override fix deprecated LanguageCode |

## Environment
- OS: Windows (amd64)
- Shell: PowerShell
- Hugo binary: extended (supports SCSS)

## Build Health Check
```powershell
hugo --minify 2>&1
# Expected output:
# Pages: 55 | Static files: 33 | Aliases: 19
# Total in ~120ms
# ← ZERO warnings (đặc biệt WARN deprecated)
```
