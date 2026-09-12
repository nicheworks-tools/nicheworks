# Tool Specification — FileType Sniffer

- Slug: `filetype-sniffer`
- Public URL: `https://nicheworks.app/tools/filetype-sniffer/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Inspect a file's leading signature bytes in the browser to estimate its actual file format and help users notice extension/signature mismatches without opening or executing the file.

## Current functional contract

- Accept an arbitrary local file through file selection or drag-and-drop.
- Read only the leading 4096 bytes for implemented Magic Number/signature detection.
- Estimate supported formats including common documents, images, audio/video, archives, executables, and ZIP-container-based formats.
- Compare the detected type with the visible filename/extension and surface relevant mismatch/container warnings.
- Produce a human-readable summary and JSON representation that can be copied.
- Provide reset behavior and separate Japanese/English tool pages.

## Inputs

- Local file.
- Analyze/reset/copy actions.

## Outputs

- Estimated file type/signature summary.
- Extension/signature or container warnings where applicable.
- JSON result and copied summary/JSON.

## State and persistence

Selected file metadata/signature bytes and the analysis result are current-page state. The tool does not store uploaded files or analysis history as part of the current contract.

## Privacy and network behavior

The selected file is not intentionally uploaded by the detection workflow; only its leading bytes are read locally in the browser. Suite-wide analytics and advertising resources may load independently.

## Language mode

`separate JA/EN pages`

The canonical root is Japanese and `/en/` provides the English tool page.

## Layout class

`mobile-oriented`

The file drop/select → analyze → result flow is compact and naturally stacks on narrow screens.

## Limits and non-goals

- File-type estimation is signature-based and cannot guarantee complete/correct identification of every format or damaged file.
- The tool is not antivirus, malware detection, sandboxing, or an execution-safety checker.
- Extension/signature mismatch is a warning signal, not proof of malicious intent.
- Some Office, APK, JAR, EPUB, and related formats use ZIP containers and can require deeper inspection than the leading signature alone.

## Acceptance criteria

- [ ] Selecting a supported file reads only the implemented leading-byte window and produces a signature-based estimate without executing the file.
- [ ] A visible extension/signature mismatch or container case can be surfaced in the result/warning path when recognized.
- [ ] Summary and JSON copy actions reflect the current analysis and reset clears current working state.
- [ ] Japanese and English pages retain equivalent core detection behavior and the non-antivirus warning.

## Implementation evidence

- `tools/filetype-sniffer/index.html`
- `tools/filetype-sniffer/en/`
- `tools/filetype-sniffer/app.js`
- `tools/filetype-sniffer/usage.html`
