export interface PostTypeSummary {
  postType: string;
  total: number;
  byStatus: Record<string, number>;
  sampleSlugs: string[];
}

export interface MetaKeySummary {
  metaKey: string;
  count: number;
  postTypes: Record<string, number>;
}

export interface TaxonomySummary {
  taxonomy: string;
  terms: number;
}

export interface PluginSummary {
  name: string;
  path: string;
}

export interface ThemeSummary {
  name: string;
  path: string;
}

export interface MediaByExt {
  count: number;
  bytes: number;
}

export interface MediaSummary {
  totalFiles: number;
  totalBytes: number;
  byExt: Record<string, MediaByExt>;
}

export interface WPStructureReport {
  generatedAt: string;
  tablePrefix: string;
  postTypes: PostTypeSummary[];
  metaKeys: MetaKeySummary[];
  taxonomies: TaxonomySummary[];
  plugins: PluginSummary[];
  themes: ThemeSummary[];
  media: MediaSummary | null;
}
