# UI Mock v2 PR note

This change set implements the first production parity wave for the accepted Construction Tools Atlas UI Mock v2.

It intentionally keeps semantic search, bilingual presentation, favorites, canonical deep links/share, and the canonical image registry intact while replacing the former dark/legacy presentation layer with the accepted light master-detail design.

The Amazon surface is a canonical commerce handoff. It reuses the shared NicheWorks Amazon helper, is hidden without an explicitly maintained canonical mapping, and never forwards arbitrary search-box text.

The six initial mappings correspond to the active q017 canonicals prepared by Image Wave 3A. Their reviewed raster images remain in the separate Wave 3A branch until that branch passes PR integration CI and merges.
