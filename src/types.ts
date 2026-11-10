export type ThemePresetId = 'monograph' | 'obsidian' | 'alabaster' | 'travertine';
export type LayoutModeId =
  | 'architectural-grid'
  | 'avant-kinetic'
  | 'broadsheet-journal'
  | 'couture-salon'
  | 'editorial-split'
  | 'monograph-column'
  | 'bento-showcase';

export type FontPairingId = 'bricolage' | 'syne' | 'fraunces' | 'bodoni' | 'oswald';

export interface ProfileConfig {
  displayName: string;
  handle: string;
  discipline: string;
  location: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  themePreset: ThemePresetId;
  layoutMode: LayoutModeId;
  fontPairing?: FontPairingId;
  darkMode: boolean;
  showMarquee: boolean;
  marqueeText: string;
  editionLabel: string;
  availabilityText: string;
  contactEmail: string;
}

export type SocialPlatform =
  | 'instagram'
  | 'x'
  | 'youtube'
  | 'spotify'
  | 'linkedin'
  | 'github'
  | 'substack'
  | 'website';

export interface SocialProfile {
  id: string;
  platform: SocialPlatform;
  label: string;
  handle: string;
  url: string;
  enabled: boolean;
  clicks: number;
}

export type BlockType = 'featured_link' | 'media_embed' | 'editorial_note';
export type MediaEmbedKind = 'audio_studio' | 'youtube' | 'spotify' | 'vimeo' | 'external_embed';

export interface ContentBlock {
  id: string;
  type: BlockType;
  title: string;
  subtitle: string;
  category: string;
  publishedDate: string;
  url: string;
  thumbnailUrl?: string;
  featuredSpan: 'full' | 'half';
  mediaKind?: MediaEmbedKind;
  mediaEmbedUrl?: string;
  durationLabel?: string;
  composerCredits?: string;
  enabled: boolean;
  clicks: number;
}

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  type: 'page_view' | 'link_click' | 'social_click' | 'media_play';
  targetId?: string;
  targetTitle?: string;
  referrer: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  region: string;
}

export type AnalyticsWidgetId =
  | 'kpi_summary'
  | 'traffic_timeline'
  | 'top_links'
  | 'referrer_sources'
  | 'device_distribution'
  | 'event_stream';

export interface AnalyticsWidgetConfig {
  id: AnalyticsWidgetId;
  title: string;
  subtitle: string;
  colSpan: 1 | 2;
  visible: boolean;
}

export interface CustomDomainRecord {
  id: string;
  domain: string;
  isPrimary: boolean;
  createdAt: string;
  lastCheckedAt: string | null;
  expectedRecordType: 'CNAME' | 'A';
  expectedTarget: string;
  txtVerificationName: string;
  txtVerificationValue: string;
  dnsStatus: 'verified' | 'pending_dns' | 'unverified';
  resolvedA: string[];
  resolvedAAAA: string[];
  resolvedCname: string[];
  resolvedTxt: string[];
  resolvedNs: string[];
  dnsLookupLatencyMs: number | null;
  sslStatus: 'active' | 'missing' | 'expired';
  sslIssuer: string | null;
  sslSubject: string | null;
  sslValidFrom: string | null;
  sslValidTo: string | null;
  sslProtocol: string | null;
  sslFingerprint: string | null;
  diagnosticMessage: string;
}

export interface RedirectRule {
  id: string;
  sourcePath: string;
  destinationUrl: string;
  statusCode: 301 | 302;
  preserveQuery: boolean;
  enabled: boolean;
  hits: number;
}

export interface DiagnosticReportItem {
  id: string;
  checkedAt: string;
  targetType: 'link' | 'social' | 'media' | 'domain' | 'redirect';
  targetId: string;
  targetName: string;
  targetUrl: string;
  status: 'healthy' | 'issue_detected' | 'auto_resolved';
  httpStatusCode: number | null;
  latencyMs: number;
  detail: string;
  resolutionNote?: string;
}

export interface AppState {
  profile: ProfileConfig;
  socials: SocialProfile[];
  blocks: ContentBlock[];
  analyticsWidgets: AnalyticsWidgetConfig[];
  events: AnalyticsEvent[];
  domains: CustomDomainRecord[];
  redirects: RedirectRule[];
  diagnostics: DiagnosticReportItem[];
  lastDiagnosticRunAt: string | null;
}
