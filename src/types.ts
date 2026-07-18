export interface SiteConfig {
  name: string;
  domain: string;
  url: string;
  description: string;
  email: string;
  telegram: string;
}

export interface HomeContent {
  eyebrow: string;
  title: string;
  description: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  secondaryActionLabel: string;
  secondaryActionHref: string;
}

export interface ContentItem {
  collection: 'blog' | 'cases';
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  updatedDate?: string;
  image?: string;
  imageAlt?: string;
  tags: string[];
  draft: boolean;
  telegram: boolean;
  html: string;
}

export interface CaseItem extends ContentItem {
  collection: 'cases';
  client?: string;
  result: string;
}

export interface BlogItem extends ContentItem {
  collection: 'blog';
}

export interface SiteData {
  site: SiteConfig;
  home: HomeContent;
  blog: BlogItem[];
  cases: CaseItem[];
}

export type RouteKind = 'home' | 'listing' | 'content' | 'page' | 'not-found';
