# PR #486 major tools batch 2 status

## Schedule position

- PR #482: completed
- PR #483: completed
- PR #484: completed and merged
- PR #485: completed and merged
- PR #486: current

## Target tools

- manual-finder
- kanji-modernizer
- laundry-code-decode
- unitmaster
- linebreak-doctor
- log-formatter
- color-replace
- redirect-unwrapper
- webp-avif-converter
- screenshot-stitcher
- rename-wizard
- metadata-snap related pages

## Changes in this branch

### linebreak-doctor

Fixed a broken input placeholder attribute.

Before:

```html
<textarea id="input" stable content="Paste text here"></textarea>
```

After:

```html
<textarea id="input" placeholder="Paste text here"></textarea>
```

This restores the visible input hint for the main text area and removes invalid HTML attributes from the tool shell.

## Notes

ManualFinder and Kanji Modernizer were directly inspected first. Their main input/button/result shell structure was present in the fetched range, so this PR keeps the code change limited to the confirmed LineBreak Doctor breakage.

The `url-title-proxy` Cloudflare deployment failure remains out of scope.
