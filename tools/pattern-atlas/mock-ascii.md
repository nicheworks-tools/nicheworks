# Pattern Atlas ASCII UI Mock

Status: pre-HTML mock
Scope: Pattern Atlas v0.1

## UI principle

Do not use a permanent desktop 3-column layout.
Use a restrained NicheWorks-native layout with search, filters, card grid, and separate detail/edit/export flow.

---

## Desktop: list / search

```txt
+--------------------------------------------------------------------------------+
| Pattern Atlas                                                                  |
| 世界の模様を、意味から探して、色を変えて、素材として使う。                     |
+--------------------------------------------------------------------------------+

[ ad-top ]

Pattern Atlas is a visual dictionary and export tool for world patterns.

Search
+-------------------------------------------------------------------------------+
| e.g. seigaiha, arabesque, wave, textile, geometric                             |
+-------------------------------------------------------------------------------+

Filters
[ Region: All v ] [ Culture: All v ] [ Category: All v ] [ Use: All v ] [ Caution: All v ] [ Reset ]

Results: 80 patterns

+------------------+  +------------------+  +------------------+  +------------------+
| [ SVG preview ]  |  | [ SVG preview ]  |  | [ SVG preview ]  |  | [ SVG preview ]  |
| Seigaiha         |  | Shippo           |  | Arabesque        |  | Celtic Knot      |
| Japan / Wave     |  | Japan / Geometry |  | Islamic / Floral |  | Europe / Knot    |
| low caution      |  | low caution      |  | medium caution   |  | medium caution   |
| [Detail] [Edit]  |  | [Detail] [Edit]  |  | [Detail] [Edit]  |  | [Detail] [Edit]  |
+------------------+  +------------------+  +------------------+  +------------------+

+------------------+  +------------------+  +------------------+  +------------------+
| [ SVG preview ]  |  | [ SVG preview ]  |  | [ SVG preview ]  |  | [ SVG preview ]  |
| Kente-inspired   |  | Batik Parang     |  | Meander          |  | Paisley          |
| Ghana / Textile  |  | Indonesia        |  | Greece / Border  |  | Persia / Floral  |
| high caution     |  | medium caution   |  | low caution      |  | low caution      |
| [Detail] [Edit]  |  | [Detail] [Edit]  |  | [Detail] [Edit]  |  | [Detail] [Edit]  |
+------------------+  +------------------+  +------------------+  +------------------+

[ FAQ ]
[ Related tools ]
[ Donate ]
[ Footer ]
```

---

## Desktop: detail / edit / export

```txt
[ Back to list ]

+--------------------------------------+-----------------------------------------+
|                                      | Seigaiha / 青海波                       |
|           [ large SVG preview ]      | Japan / Japanese / Wave / Geometric     |
|                                      | Caution: low                            |
|                                      |                                         |
|                                      | Meaning                                 |
|                                      | Calm waves, continuity, peace, fortune. |
|                                      |                                         |
|                                      | Context                                 |
|                                      | Modern SVG reconstruction inspired by   |
|                                      | a traditional Japanese pattern.         |
+--------------------------------------+-----------------------------------------+

Color editor
[ Background #ffffff ] [ Primary #1f4e79 ] [ Accent #8fbcd4 ] [ Reset ]
[ Default ] [ Monochrome ] [ Muted ] [ Traditional ] [ Dark ] [ Light ]

Preview
[ Single ] [ 2x2 ] [ 4x4 ] [ Website background ] [ Poster ] [ Fabric ] [ Card ]

+--------------------------------------------------------------------------------+
|                            [ selected preview area ]                            |
+--------------------------------------------------------------------------------+

Export
Format: [ SVG ] [ PNG ] [ CSS ]
Size:   [ 512 ] [ 1024 ]
Tile:   [ Single ] [ 2x2 ]
Background: [ Solid ] [ Transparent ]

Usage notice
This is a modern reconstruction inspired by a traditional pattern, not an official historical reproduction.

[ Preview export ] [ Download ] [ Copy CSS ]
```

This is a two-section detail view, not a permanent three-column app shell.

---

## Mobile: list / search

```txt
Pattern Atlas
世界の模様を、意味から探して、色を変えて、素材として使う。

[ ad-top ]

Search
+-------------------------------+
| seigaiha, wave, textile       |
+-------------------------------+

[ Show filters ]

Results: 80 patterns

+-------------------------------+
| [ SVG preview ]               |
| Seigaiha                      |
| Japan / Wave / Geometric      |
| low caution                   |
| [Detail] [Edit]               |
+-------------------------------+

+-------------------------------+
| [ SVG preview ]               |
| Arabesque                     |
| Islamic / Floral              |
| medium caution                |
| [Detail] [Edit]               |
+-------------------------------+
```

---

## Mobile: detail / edit / export

```txt
[ Back ]

[ large SVG preview ]

Seigaiha / 青海波
Japan / Japanese / Wave / Geometric
Caution: low

Meaning
Calm waves, continuity, peace, fortune.

Context
Modern SVG reconstruction inspired by a traditional Japanese pattern.

Color editor
Background
[ #ffffff ]
Primary
[ #1f4e79 ]
Accent
[ #8fbcd4 ]
[ Reset ]

Palette
[ Default ]
[ Monochrome ]
[ Muted ]
[ Traditional ]

Preview
[ Single ]
[ 2x2 ]
[ Website background ]

[ selected preview area ]

Export
[ SVG ]
[ PNG ]
[ CSS ]

Size
[ 512 ]
[ 1024 ]

Notice
This is a modern reconstruction, not an official historical reproduction.

[ Download ]
```

---

## Layout prohibitions

```txt
Do not create:
left filters + center list + right detail/edit
```

Do not use oversized decorative panels, strong shadows, bright gradients, or UI Atlas-style visual language.
