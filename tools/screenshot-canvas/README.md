# Screenshot Canvas

Browser-only screenshot composition tool. Add PNG/JPEG/WebP images using file picker, drop, or paste; drag to move; resize via lower-right handle; Shift-click to multi-select; arrange horizontally, vertically, in a grid, or overlay; change opacity, layer order, background, canvas dimensions; export PNG. No uploads.

This is separate from Screenshot Stitcher (long vertical image) and Screenshot Collector (web capture).

## Keyboard editing and layers

After importing images, use the **Image layers** buttons to select a specific layer. The focused Canvas supports arrow keys (1px per press), Shift+arrow keys (10px), Delete/Backspace, Escape to deselect, Ctrl/Cmd+Z to undo and Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z to redo. The four corners support proportional resizing; Shift-click on Canvas supports multiple selection. Files are decoded and appended in picker order even if loading completes out of order.

Automated Chromium QA covers pointer/touch-type events, file drop/paste, JPEG/WebP, resized corners and actual export pixels. Native mobile hardware tests are not certified.
