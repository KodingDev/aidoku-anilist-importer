# aidoku-anilist-importer

A Cloudflare Worker for importing manga from Aidoku into Anilist.

## Secrets

These must be defined or the worker will not run.
You can create an Anilist application [here](https://anilist.co/settings/developer).

```sh
# Application secrets
wrangler secret put ANILIST_APP_ID
wrangler secret put ANILIST_APP_SECRET

# Customizable API key for update request
wrangler secret put API_KEY
```

## Endpoints

 * `POST /` - Update Anilist using the Aidoku backup in the request body.
 * `GET /login` - Redirect to Anilist login page.
 * `GET /callback` - OAuth2 callback to define the user's Anilist account.

## iOS Shortcut

You can install the required iOS shortcut using the link below.
This will require appropriate configuration.

[Shortcut](https://www.icloud.com/shortcuts/7d303b108d9f4479bad3f1befc40c932)