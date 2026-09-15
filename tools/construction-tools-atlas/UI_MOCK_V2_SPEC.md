# Construction Tools Atlas — UI Mock v2 implementation contract

Status: **authoritative UI source of truth**
Effective: 2026-09-15

This contract records the accepted `construction-tools-atlas-ui-mock-v2` behavior and visual structure. It supersedes the historical Notion-style one-column design direction. Existing v2.3 capabilities (semantic search, favorites, JA / EN / Both, canonical deep links, share, canonical image registry) remain functional requirements and must be presented through this UI.

## 1. Responsive structure

### Desktop (`>= 900px`)
- Persistent master-detail workspace.
- Left results pane: approximately 43%.
- Right detail pane: approximately 57%.
- Selecting a result updates the right pane without replacing the result list.

### Mobile (`< 900px`)
- Results remain the primary surface.
- Selecting a result opens the canonical detail surface as a bottom sheet with backdrop.
- Deep-linked entries auto-open the same canonical detail surface.

## 2. Visual language

- Light / white application surface; the former dark-purple visual system is not the target design.
- Quiet neutral borders, restrained shadows, rounded cards, compact metadata.
- Header contains NicheWorks identity, atlas title/subtitle, JA / EN / Both segmented language control, and Favorites.
- Search is presented as a distinct search card rather than a loose collection of legacy controls.

## 3. Search and filters

The search card contains:
- text search,
- semantic interpretation chips when interpretation signals exist,
- action filters,
- type filters: All / Tools / Materials / Tasks / Terms,
- access to the full filter sheet.

Visual autocomplete and search results use canonical entry IDs and canonical representative images. User-entered free text must not become an affiliate destination.

## 4. Result rows

Each result row should support:
- canonical representative image when reviewed imagery exists,
- primary and secondary term names,
- short summary,
- taxonomy chips,
- favorite control,
- selected state.

A missing reviewed image is represented explicitly; mock/demo SVG assets are never production evidence.

## 5. Detail information architecture

Legacy Meaning / Examples / Aliases / Meta tabs are not the target primary IA. Detail content is read vertically in the right pane / mobile sheet.

The surface contains, where data exists:
1. title and secondary-language name / aliases,
2. taxonomy,
3. favorite and share actions,
4. canonical hero image,
5. `これは何？ / What is it?`,
6. use / notes / key points,
7. examples,
8. aliases and classification metadata,
9. related / commonly-used-with content,
10. Amazon commerce handoff for explicitly maintained eligible canonicals,
11. canonical deep-link/share behavior.

JA, EN and Both presentation must remain available. The same canonical record is shown in every language mode.

## 6. Amazon affiliate contract

Amazon is a commerce handoff, not dictionary evidence.

- Reuse `/assets/amazon-affiliate.js` and the NicheWorks Amazon affiliate contract.
- Use only HTTPS Amazon destinations accepted by the shared helper.
- Tracking ID is configured/maintained by NicheWorks; the currently validated ID is `nicheworks09-22`.
- Affiliate destinations are selected from maintained canonical mappings only.
- Never construct an Amazon destination from arbitrary search-box text.
- No claims about recommendation, official status, compatibility, price, availability, rating, or cheapest offer.
- Do not copy live Amazon product images/prices/ratings into the dictionary surface.
- Amazon UI remains hidden when the selected canonical has no approved mapping.
- The CTA explicitly names Amazon and uses the shared disclosure and sponsored-link semantics.
- Analytics remain coarse affiliate click metadata only; query terms and canonical names are not emitted as analytics parameters.

## 7. Required preserved v2.3 behavior

Mock parity must not regress:
- semantic search,
- favorites,
- JA / EN / Both,
- canonical `?entry=<id>` deep links,
- browser back behavior,
- share/copy canonical URL,
- canonical image registry priority,
- local/browser-side search behavior,
- existing data/audit contracts.

## 8. Acceptance gate

A UI change is not complete merely because the PC layout is two-pane. Completion requires visual and structural parity with this contract, responsive behavior, preserved v2.3 functionality, and passing Construction Tools Atlas audits.
