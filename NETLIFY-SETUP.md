# Updating the Rohit Media Works site — no code needed

Your site now has a **content admin** at:

    https://YOUR-SITE.netlify.app/admin/

Log in there to add films, partners, trailers, press and edit the offer.
Every change you Publish saves to GitHub and Netlify republishes the site
automatically (usually under a minute).

---

## One-time setup (≈3 minutes, only once)

Do this once in your Netlify dashboard so the admin login works:

1. Open your site in **Netlify → Site configuration → Identity** → **Enable Identity**.
2. Still under Identity → **Services → Git Gateway** → **Enable Git Gateway**.
3. Identity → **Invite users** → invite **your own email**.
4. Check your inbox → **Accept the invite** → set a password.

That email + password is your admin login. You can invite teammates the same way.

> Note: the admin is configured for the **`main`** branch. If your repo's
> default branch is `master`, change `branch: main` to `branch: master`
> in `admin/config.yml`.

---

## How to update each section

Go to `/admin`, log in, then pick a section on the left:

- **🔥 Bumper Offer** — edit the headline, price, slots left, deadline, or toggle it off.
- **🎬 Films** — click **Films**, then **Add Film**: poster + title + details. Drag to reorder (first = newest).
- **🎞 AI Originals** — add AI-made titles like *Karma* with a trailer video.
- **🤝 Network / Partners** — add a partner (e.g. an OTT owner): photo, name, role.
- **📰 Press & Journey** — edit the leadership profile and add press clippings.

Fill the form → **Publish** (top right) → done. The live site updates shortly after.

---

## Where the content lives (for reference)

Each section is a simple file in the repo the admin edits for you:

- `content/offer.json` — bumper offer
- `content/films.json` — film catalogue
- `content/ai-originals.json` — AI originals / trailers
- `content/network.json` — partners
- `content/press.json` — press & profile

Images you upload go to `assets/uploads/`.
You never need to touch these directly — the admin does it — but they're here
if you ever want to.
