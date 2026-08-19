# Deploying to Netlify

The site is plain HTML/CSS/JS — there is no build step. `netlify.toml` at the repo
root tells Netlify to publish the `tiktokencapital-site/` folder.

## Option A — connect the GitHub repo (recommended)

1. Sign in at <https://app.netlify.com> and choose **Add new site → Import an existing project**.
2. Pick **GitHub**, authorise Netlify, then select the `TIK-TOKEN-CAPITAL` repository.
3. Netlify reads `netlify.toml`, so leave the build settings as they appear:
   - **Build command:** *(empty)*
   - **Publish directory:** `tiktokencapital-site`
4. Choose the branch to deploy (`main` for production) and click **Deploy site**.

Every push to that branch redeploys automatically. Pushes to other branches produce
preview deploys with their own URLs.

## Option B — drag and drop (no repo connection)

Open <https://app.netlify.com/drop> and drag the **`tiktokencapital-site` folder**
onto the page. Drag the folder itself, not the repo root, or the site will 404.

## Option C — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --dir=tiktokencapital-site          # draft preview URL
netlify deploy --dir=tiktokencapital-site --prod   # production
```

## After the first deploy

**Custom domain.** Site configuration → Domain management → Add a domain →
`tiktokencapital.co`. Netlify will show the DNS records to add at your registrar
(either point the nameservers at Netlify DNS, or add an `A` record to Netlify's
load balancer plus a `CNAME` for `www`). HTTPS is provisioned free via Let's
Encrypt once DNS resolves.

**The enquiry form.** `contact.html` currently has
`data-formspree="REPLACE_ME"`, so the submit button falls back to opening the
visitor's email client. Two ways to make it a real submission:

- *Formspree:* create a form at <https://formspree.io>, then replace `REPLACE_ME`
  in `tiktokencapital-site/contact.html` with your form ID.
- *Netlify Forms:* add `netlify` and `name="interest"` to the `<form>` tag, add a
  hidden `<input type="hidden" name="form-name" value="interest">`, and let the
  form submit normally instead of via `fetch` (`assets/app.js` currently calls
  `preventDefault()` on submit). Submissions then appear in the Netlify dashboard.

**Keeping it out of Google.** The pages carry a "PREVIEW / not for distribution"
banner. If the site should stay unindexed while it is a mock-up, either enable
password protection (Site configuration → Access & security → Visitor access,
paid feature) or add a `robots.txt` in `tiktokencapital-site/` containing:

```
User-agent: *
Disallow: /
```

## What `netlify.toml` sets

- `publish = "tiktokencapital-site"` — the folder served as the site root.
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`.
- Cache rules: HTML always revalidated, CSS/JS cached one hour, images one week.

`404.html` is served automatically by Netlify for unknown paths.
