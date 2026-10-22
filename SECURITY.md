# Security

## Reporting a vulnerability
Please open a private security advisory on GitHub (Security tab → Report a vulnerability) rather than a public issue.

## Design notes
- **API key handling.** Direct mode keeps the Gemini key in memory only (optionally `sessionStorage` for one tab, opt-in). It is sent to Google in the `x-goog-api-key` header, never in a URL, and never written to `localStorage`. Because this is a static site, anyone with access to the tab can read a key typed into it: use a restricted, low-quota key, or deploy the proxy in `proxy/` so no key ever reaches the browser.
- **Prompt injection.** Untrusted text is delimited in the prompt and the system instruction says to treat it as data. A heuristic filter blocks common attacks, but the primary defence is that model output is schema-validated, length-capped and tag-stripped before it touches the UI, and all budget maths and dates are computed in code.
- **XSS.** React escapes all text; there is no `dangerouslySetInnerHTML`. Production builds ship a strict Content-Security-Policy (`script-src 'self'`).
- **Supply chain.** No third-party scripts load at runtime (Tailwind is compiled at build time). Dependabot and `npm audit` run in CI.
- **Limits.** `frame-ancestors` and other response headers cannot be set from a `<meta>` tag; set them at your host or CDN if you need them.
