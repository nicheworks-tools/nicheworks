import fs from "fs";
import path from "path";
import type {
  PluginSummary,
  ThemeSummary,
  MediaSummary,
  MediaByExt
} from "./types.js";

export function scanWpContent(
  wpContentPath: string
): { plugins: PluginSummary[]; themes: ThemeSummary[]; media: MediaSummary | null } {
  const pluginsDir = path.join(wpContentPath, "plugins");
  const themesDir = path.join(wpContentPath, "themes");
  const uploadsDir = path.join(wpContentPath, "uploads");

  const plugins: PluginSummary[] = fs.existsSync(pluginsDir)
    ? fs
        .readdirSync(pluginsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => ({
          name: d.name,
          path: path.join("plugins", d.name)
        }))
    : [];

  const themes: ThemeSummary[] = fs.existsSync(themesDir)
    ? fs
        .readdirSync(themesDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => ({
          name: d.name,
          path: path.join("themes", d.name)
        }))
    : [];

  const media: MediaSummary | null = fs.existsSync(uploadsDir)
    ? scanMedia(uploadsDir)
    : null;

  return { plugins, themes, media };
}

function scanMedia(root: string): MediaSummary {
  let totalFiles = 0;
  let totalBytes = 0;
  const byExt: Record<string, MediaByExt> = {};

  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile()) {
        totalFiles++;
        const stat = fs.statSync(full);
        totalBytes += stat.size;
        const ext = path.extname(e.name).toLowerCase() || "noext";
        if (!byExt[ext]) byExt[ext] = { count: 0, bytes: 0 };
        byExt[ext].count++;
        byExt[ext].bytes += stat.size;
      }
    }
  };

  walk(root);

  return { totalFiles, totalBytes, byExt };
}
