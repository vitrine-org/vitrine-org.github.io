---
title: Publishing
description: Release a pack on GitHub, list it in the Vitrine store, and ship updates.
sidebar:
  order: 9
---

A pack is distributed as a `.vitrine` file attached to a GitHub release. The Vitrine store is a list
of repositories: a scheduled job reads each one's latest release, checks the pack and publishes a
catalogue, which the website's [packs page](/packs/) reads. You publish once with a pull request;
updates are just new releases.

## Before you publish

- **Previews.** The store requires a `preview` image for every widget. Render one from the built
  pack at the widget's default size and reference it in `vitrine.json`:

  ```sh
  npm run build
  vitrine render dist clock --cells 4x2 --out previews/clock.png
  ```

  Previews are published as `.png`; use PNG files.
- **Permissions.** Declare only what the widgets use, and be ready to explain every network host.
  See [Permissions](/docs/reference/permissions/).
- **Rights.** You must be allowed to distribute everything in the pack, fonts and images included.
- **Version.** Bump `version` in `vitrine.json` for every release; it must match the release tag.
- **Ids.** Keep the pack `id` and every widget `id` stable across versions: installed instances,
  their settings and storage refer to them.

Then build the pack:

```sh
npm run pack        # → widgets-1.2.0.vitrine
```

## The .vitrine format

A `.vitrine` file is a ZIP archive (stored or deflated entries) whose root is the pack root:

```
widgets-1.2.0.vitrine
├── vitrine.json                 manifest, entries rewritten by the build
├── widgets/
│   └── clock/
│       └── index.js             bundle the engine runs
├── src/clock/settings.json      settings schema, at its source path
├── previews/clock.png           preview, at its source path
├── assets/fonts/…               fonts listed in "fonts"
├── README.md                    optional
├── LICENSE                      optional
└── icon.png                     optional
```

The engine accepts a pack when:

- `vitrine.json` is at the root, at most 1 MB, and passes the [manifest rules](/docs/reference/manifest/);
- every file the manifest references exists;
- every entry name is a [safe relative path](/docs/reference/manifest/#paths), with no symbolic links
  and no duplicates;
- there are at most 2000 entries and 64 MB uncompressed.

Installing extracts the archive to a temporary folder, validates it, then replaces
`%APPDATA%\Vitrine\packages\<pack id>\`. Any ZIP tool can produce a valid pack, but
`vitrine-widget pack` is the supported path.

## Release on GitHub

1. Use a **public** repository.
2. Create a release tagged `v<version>` (for `1.2.0`: `v1.2.0`).
3. Attach the `.vitrine` file as the release's **only** `.vitrine` asset.

```sh
gh release create v1.2.0 widgets-1.2.0.vitrine --title "1.2.0" --notes "Changes in this version"
```

The store reads the repository's **latest** release as reported by the GitHub API, which excludes
drafts and pre-releases.

## Add your pack to the store

Open a pull request on [vitrine-org/store](https://github.com/vitrine-org/store) that adds
`packs/<pack id>.json`:

```json
{
  "id": "dev.you.widgets",
  "repo": "you/my-widgets",
  "license": "MIT",
  "tags": ["clock", "minimal"]
}
```

| Field | Required | Rules |
| --- | --- | --- |
| `id` | yes | The pack id from `vitrine.json`, with at least three segments (`^[a-z0-9]+(\.[a-z0-9-]+){2,}$`). The file must be named `<id>.json`. |
| `repo` | yes | `owner/name` of the GitHub repository with the releases. |
| `license` | no | SPDX id. Default: the repository's license as detected by GitHub. |
| `tags` | no | Up to 6 words of 2–24 characters: lowercase letters, digits and `-`. Used for search. |

Any other field is rejected. Name, author, description, homepage and widgets are taken from your
`vitrine.json`, so the listing always matches what users install.

## Store checks

The pull request runs the catalogue build, which downloads your latest release and fails when:

- the release does not have exactly one `.vitrine` asset;
- the file is larger than **50 MB** or is not a readable ZIP (stored or deflated entries);
- an entry path is absolute, starts with a drive letter, or contains `..`;
- `vitrine.json` is missing at the root or is not valid JSON;
- the manifest `id` differs from the entry's `id`;
- the manifest `version` differs from the release tag without its leading `v`;
- the manifest has no widgets;
- a widget has no `preview`, or its preview file is missing from the archive.

These checks are lighter than the engine's: run `vitrine install` on your file (or
`vitrine render` against it) before releasing to catch everything else.

## Review

Pull requests are reviewed by hand before merging. Reviewers check that:

- permissions are the minimum the widgets need;
- network hosts are explained;
- you can distribute everything in the pack, including fonts and images.

A pack can be removed from the store if a later release breaks these rules.

## The catalogue

After the merge, the store's workflow publishes:

- `https://vitrine-org.github.io/store/index.json`: every pack with its version, download URL, size,
  SHA-256, minimum engine (`minEngine`, `2.0.0` when absent), license, tags, stars, publication date
  and widgets (name, description, size, interactivity, permissions);
- `https://vitrine-org.github.io/store/previews/<pack id>/<widget id>.png`: the previews, extracted
  from your pack.

Packs are downloaded from your own release, never re-hosted. Packs from `vitrine-org/` repositories
are marked official and listed first; the others follow by name.

## Updates

Publish a new release with a higher version; no pull request is needed. The catalogue is rebuilt
every six hours, on every push to the store and on demand, so a release appears within a few hours.
If the new release fails the checks, the scheduled build fails and the catalogue is not redeployed:
the previous one stays online until a valid release is published (or the entry is removed).

On the user's side, installing a newer `.vitrine` (double-click or `vitrine install`) replaces the
previous version in place; instances, settings and storage are kept. Settings the user never changed
pick up new defaults from your schema. A widget id that disappears from the pack leaves its instances
without a widget, so keep ids stable. Store browsing inside the control panel is in development.
