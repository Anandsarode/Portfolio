import React, { useState } from 'react';
import {
  Check,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  RefreshCw,
  Palette,
  Layout,
  User,
  Type,
} from 'lucide-react';
import type {
  ProfileConfig,
  ThemePresetId,
  LayoutModeId,
  FontPairingId,
  DiagnosticReportItem,
} from '../types';

interface AppearanceAndHealthViewProps {
  mode: 'appearance' | 'health';
  profile: ProfileConfig;
  diagnostics: DiagnosticReportItem[];
  lastDiagnosticRunAt: string | null;
  onUpdateProfile: (updates: Partial<ProfileConfig>) => Promise<void>;
  onRunDiagnostics: (autoResolve: boolean) => Promise<void>;
}

const LAYOUT_OPTIONS: Array<{
  id: LayoutModeId;
  name: string;
  recommendedFont: FontPairingId;
  badge: string;
  desc: string;
}> = [
  {
    id: 'architectural-grid',
    name: '01. Architectural Swiss Grid',
    recommendedFont: 'bricolage',
    badge: 'Blueprint Grid · Bricolage Grotesque',
    desc: 'Exposed structural blueprint cells, numbered index ledger, and a 3-column social matrix.',
  },
  {
    id: 'avant-kinetic',
    name: '02. Avant-Garde Kinetic Showcase',
    recommendedFont: 'syne',
    badge: 'Panoramic Hero · Syne Display',
    desc: 'Panoramic cover banner with overlapping portrait badge and wide interactive link rows.',
  },
  {
    id: 'broadsheet-journal',
    name: '03. The Editorial Broadsheet',
    recommendedFont: 'fraunces',
    badge: 'Periodical Masthead · Fraunces Serif',
    desc: 'Centered periodical masthead with double horizontal rules and 2-column dispatch essays.',
  },
  {
    id: 'couture-salon',
    name: '04. Haute Couture Lookbook',
    recommendedFont: 'bodoni',
    badge: 'Arch Medallion · Bodoni Moda',
    desc: 'Arch-framed portrait medallion and centered gallery exhibition plates with high-contrast type.',
  },
];

const FONT_OPTIONS: Array<{
  id: FontPairingId;
  displayFontName: string;
  bodyFontName: string;
  cssClass: string;
  characterNote: string;
}> = [
  {
    id: 'bricolage',
    displayFontName: 'Bricolage Grotesque',
    bodyFontName: 'DM Sans',
    cssClass: 'font-pair-bricolage',
    characterNote: 'Contemporary neo-grotesque display with crisp architectural geometry.',
  },
  {
    id: 'syne',
    displayFontName: 'Syne ExtraBold',
    bodyFontName: 'Urbanist',
    cssClass: 'font-pair-syne',
    characterNote: 'Art-center display proportions designed for kinetic creative studios.',
  },
  {
    id: 'fraunces',
    displayFontName: 'Fraunces Oldstyle',
    bodyFontName: 'Public Sans',
    cssClass: 'font-pair-fraunces',
    characterNote: 'Expressive Literary & Broadsheet serif with warm organic stroke modulation.',
  },
  {
    id: 'bodoni',
    displayFontName: 'Bodoni Moda',
    bodyFontName: 'DM Sans',
    cssClass: 'font-pair-bodoni',
    characterNote: 'High-fashion Italian hairline serif crafted for luxury lookbooks.',
  },
  {
    id: 'oswald',
    displayFontName: 'Oswald Condensed',
    bodyFontName: 'Public Sans',
    cssClass: 'font-pair-oswald',
    characterNote: 'Tall industrial headline structure with high-density vertical presence.',
  },
];

const THEME_OPTIONS: Array<{
  id: ThemePresetId;
  name: string;
  desc: string;
  swatchBg: string;
  swatchSurface: string;
  swatchAccent: string;
}> = [
  {
    id: 'monograph',
    name: 'Swiss Gallery Paper & Cobalt',
    desc: 'Crisp architectural gallery paper with deep ink borders and electric cobalt accents.',
    swatchBg: '#F6F6F3',
    swatchSurface: '#FFFFFF',
    swatchAccent: '#1D4ED8',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Carbon & Azure',
    desc: 'Deep carbon slate architecture with high-contrast silver typography.',
    swatchBg: '#0B0C0E',
    swatchSurface: '#131519',
    swatchAccent: '#3B82F6',
  },
  {
    id: 'alabaster',
    name: 'Warm Alabaster & Cinnabar',
    desc: 'Warm stone neutral canvas paired with espresso ink and terracotta highlights.',
    swatchBg: '#FAF7F2',
    swatchSurface: '#F2EDE4',
    swatchAccent: '#C84B31',
  },
  {
    id: 'travertine',
    name: 'Limestone & Deep Teal',
    desc: 'Tactile architectural stone field paired with deep mineral teal accents.',
    swatchBg: '#EFECE6',
    swatchSurface: '#E5E0D7',
    swatchAccent: '#0F766E',
  },
];

export const AppearanceAndHealthView: React.FC<AppearanceAndHealthViewProps> = ({
  mode,
  profile,
  diagnostics,
  lastDiagnosticRunAt,
  onUpdateProfile,
  onRunDiagnostics,
}) => {
  const [formState, setFormState] = useState<ProfileConfig>(profile);
  const [savedToast, setSavedToast] = useState(false);
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile(formState);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const triggerDiagnostic = async (autoResolve: boolean) => {
    setIsRunningCheck(true);
    try {
      await onRunDiagnostics(autoResolve);
    } finally {
      setIsRunningCheck(false);
    }
  };

  if (mode === 'health') {
    const healthyCount = diagnostics.filter((d) => d.status === 'healthy').length;
    const resolvedCount = diagnostics.filter((d) => d.status === 'auto_resolved').length;
    const issueCount = diagnostics.filter((d) => d.status === 'issue_detected').length;

    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DCDCD4] dark:border-[#262932]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6E717A] mb-1">
              <span>Automated Quality Assurance</span>
              <span aria-hidden="true">·</span>
              <span>HTTP Endpoint, Embed & DNS Verification</span>
              {lastDiagnosticRunAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Last Run: {new Date(lastDiagnosticRunAt).toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#111215] dark:text-[#F3F4F6]">
              Daily Link, Embed & Domain Health Check
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => triggerDiagnostic(false)}
              disabled={isRunningCheck}
              className="px-4 py-2 text-xs font-medium border border-[#DCDCD4] dark:border-[#323540] bg-white dark:bg-[#131519] text-[#111215] dark:text-[#F3F4F6] rounded-lg hover:bg-[#EFEFEA] disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningCheck ? 'animate-spin' : ''}`} />
              <span>{isRunningCheck ? 'Scanning Endpoints...' : 'Run Daily Health Scan'}</span>
            </button>

            <button
              type="button"
              onClick={() => triggerDiagnostic(true)}
              disabled={isRunningCheck}
              className="px-4 py-2 text-xs font-medium bg-[#111215] dark:bg-[#F3F4F6] text-white dark:text-[#0B0C0E] rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Scan & Auto-Resolve Issues</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border border-[#DCDCD4] dark:border-[#262932] bg-white dark:bg-[#131519] rounded-xl p-5">
            <div className="text-xs text-[#6E717A]">Verified Healthy Endpoints</div>
            <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[#15803D]">
              {healthyCount}
            </div>
            <div className="mt-1 text-xs text-[#6E717A]">
              Links, social profiles, and embeds responding cleanly
            </div>
          </div>

          <div className="border border-[#DCDCD4] dark:border-[#262932] bg-white dark:bg-[#131519] rounded-xl p-5">
            <div className="text-xs text-[#6E717A]">Auto-Resolved Configurations</div>
            <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[#111215] dark:text-[#F3F4F6]">
              {resolvedCount}
            </div>
            <div className="mt-1 text-xs text-[#6E717A]">
              Protocol prefixes, embed URLs, and redirect paths normalized
            </div>
          </div>

          <div className="border border-[#DCDCD4] dark:border-[#262932] bg-white dark:bg-[#131519] rounded-xl p-5">
            <div className="text-xs text-[#6E717A]">Actionable Warnings</div>
            <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[#B45309]">
              {issueCount}
            </div>
            <div className="mt-1 text-xs text-[#6E717A]">
              Unreachable URLs or pending domain DNS records
            </div>
          </div>
        </div>

        <div className="border border-[#DCDCD4] dark:border-[#262932] bg-white dark:bg-[#131519] rounded-xl overflow-hidden">
          {diagnostics.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="font-editorial text-2xl font-bold text-[#111215] dark:text-[#F3F4F6]">
                Ready to Execute Daily Link & Domain Verification
              </div>
              <p className="text-xs text-[#6E717A] max-w-md mx-auto">
                Click "Scan & Auto-Resolve Issues" to perform live HTTP HEAD/GET reachability probes across all links, social handles, media embeds, redirect rules, and custom domains.
              </p>
              <button
                type="button"
                onClick={() => triggerDiagnostic(true)}
                disabled={isRunningCheck}
                className="mt-2 px-4 py-2 text-xs font-medium bg-[#111215] dark:bg-[#F3F4F6] text-white dark:text-[#0B0C0E] rounded-lg hover:opacity-90 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Run First Health Audit Now</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#DCDCD4] dark:border-[#262932] bg-[#F6F6F3] dark:bg-[#0B0C0E] text-[#6E717A]">
                    <th className="py-3 px-4 font-medium">Component / Block</th>
                    <th className="py-3 px-4 font-medium">Target Endpoint</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium text-right">HTTP / Latency</th>
                    <th className="py-3 px-4 font-medium">Diagnostic & Resolution Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEFEA] dark:divide-[#1F222A]">
                  {diagnostics.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F6F6F3] dark:hover:bg-[#181B22]">
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#111215] dark:text-[#F3F4F6]">
                          {item.targetName}
                        </div>
                        <div className="text-[11px] text-[#6E717A] capitalize">
                          {item.targetType}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#6E717A] truncate max-w-[240px]">
                        {item.targetUrl}
                      </td>
                      <td className="py-3 px-4">
                        {item.status === 'healthy' && (
                          <span className="inline-flex items-center gap-1 text-[#15803D] font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified Healthy</span>
                          </span>
                        )}
                        {item.status === 'auto_resolved' && (
                          <span className="inline-flex items-center gap-1 text-[#1D4ED8] font-medium">
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Auto-Resolved</span>
                          </span>
                        )}
                        {item.status === 'issue_detected' && (
                          <span className="inline-flex items-center gap-1 text-[#B45309] font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Needs Attention</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#111215] dark:text-[#F3F4F6]">
                        {item.httpStatusCode ? `HTTP ${item.httpStatusCode}` : 'DNS'} · {item.latencyMs}ms
                      </td>
                      <td className="py-3 px-4 text-[#3F4147] dark:text-[#B2B6C2]">
                        <div>{item.detail}</div>
                        {item.resolutionNote && (
                          <div className="text-[#15803D] font-medium mt-0.5">
                            Resolution: {item.resolutionNote}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DCDCD4] dark:border-[#262932]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6E717A] mb-1">
            <span>Page Design & Typography Studio</span>
            <span aria-hidden="true">·</span>
            <span>4 Page Architectures · 5 Font Systems · 4 Palettes</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#111215] dark:text-[#F3F4F6]">
            Page Designs, Font Systems & Identity
          </h1>
        </div>

        {savedToast && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#15803D]">
            <Check className="w-4 h-4" />
            <span>Design & Typography Saved</span>
          </div>
        )}
      </div>

      {/* 01. Distinct Page Design Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#111215] dark:text-[#F3F4F6]">
          <Layout className="w-4 h-4" />
          <span>01. Select Page Design Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LAYOUT_OPTIONS.map((lay) => {
            const isSelected = profile.layoutMode === lay.id;
            return (
              <button
                key={lay.id}
                type="button"
                onClick={() => {
                  setFormState((prev) => ({
                    ...prev,
                    layoutMode: lay.id,
                    fontPairing: lay.recommendedFont,
                  }));
                  onUpdateProfile({
                    layoutMode: lay.id,
                    fontPairing: lay.recommendedFont,
                  });
                }}
                className={`text-left p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20 bg-white dark:bg-[#181B22]'
                    : 'border-[#DCDCD4] dark:border-[#262932] bg-white dark:bg-[#131519] hover:border-[#9E9E95]'
                }`}
              >
                <div>
                  <div className="text-[11px] font-mono text-[#1D4ED8] dark:text-[#60A5FA] mb-1.5">
                    {lay.badge}
                  </div>
                  <div className="font-editorial text-lg font-bold text-[#111215] dark:text-[#F3F4F6]">
                    {lay.name}
                  </div>
                  <p className="text-xs text-[#6E717A] mt-1.5 leading-relaxed">
                    {lay.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EFEFEA] dark:border-[#22252E] flex items-center justify-between text-xs font-medium">
                  <span className={isSelected ? 'text-[#1D4ED8]' : 'text-[#6E717A]'}>
                    {isSelected ? 'Active Page Design' : 'Apply Design + Font'}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1D4ED8]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 02. Custom Font Pairing Selector */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#111215] dark:text-[#F3F4F6]">
          <Type className="w-4 h-4" />
          <span>02. Select Typography & Font Pairing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {FONT_OPTIONS.map((font) => {
            const isSelected = (profile.fontPairing || 'bricolage') === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => {
                  setFormState((prev) => ({ ...prev, fontPairing: font.id }));
                  onUpdateProfile({ fontPairing: font.id });
                }}
                className={`text-left p-5 rounded-xl border transition-all cursor-pointer page-font-scope ${font.cssClass} ${
                  isSelected
                    ? 'border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20 bg-white dark:bg-[#181B22]'
                    : 'border-[#DCDCD4] dark:border-[#262932] bg-white dark:bg-[#131519] hover:border-[#9E9E95]'
                }`}
              >
                <div className="page-display text-3xl font-bold text-[#111215] dark:text-[#F3F4F6] mb-2">
                  Aa Bb 01
                </div>
                <div className="page-display text-base font-bold text-[#111215] dark:text-[#F3F4F6]">
                  {font.displayFontName}
                </div>
                <div className="text-xs font-mono text-[#6E717A] mt-0.5">
                  + {font.bodyFontName}
                </div>
                <p className="text-xs text-[#6E717A] mt-2 leading-relaxed">
                  {font.characterNote}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 03. Color Palette Preset */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#111215] dark:text-[#F3F4F6]">
          <Palette className="w-4 h-4" />
          <span>03. Surface & Color Palette</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {THEME_OPTIONS.map((opt) => {
            const isSelected =
              profile.themePreset === opt.id &&
              (opt.id === 'obsidian' ? profile.darkMode : !profile.darkMode);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  const isDark = opt.id === 'obsidian';
                  setFormState((prev) => ({
                    ...prev,
                    themePreset: opt.id,
                    darkMode: isDark,
                  }));
                  onUpdateProfile({ themePreset: opt.id, darkMode: isDark });
                }}
                className={`text-left p-5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20 bg-white dark:bg-[#181B22]'
                    : 'border-[#DCDCD4] dark:border-[#262932] bg-white dark:bg-[#131519] hover:border-[#9E9E95]'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-6 h-6 rounded-full border border-black/15"
                    style={{ backgroundColor: opt.swatchBg }}
                  />
                  <span
                    className="w-6 h-6 rounded-full border border-black/15"
                    style={{ backgroundColor: opt.swatchSurface }}
                  />
                  <span
                    className="w-6 h-6 rounded-full border border-black/15"
                    style={{ backgroundColor: opt.swatchAccent }}
                  />
                </div>
                <div className="font-editorial text-lg font-bold text-[#111215] dark:text-[#F3F4F6]">
                  {opt.name}
                </div>
                <p className="text-xs text-[#6E717A] mt-1">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 04. Creator Identity Form */}
      <form
        onSubmit={handleSaveProfile}
        className="border border-[#DCDCD4] dark:border-[#262932] bg-white dark:bg-[#131519] rounded-xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#EFEFEA] dark:border-[#22252E]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#111215] dark:text-[#F3F4F6]">
            <User className="w-4 h-4" />
            <span>04. Creator Identity, Bio & Marquee Ribbon</span>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium bg-[#111215] dark:bg-[#F3F4F6] text-white dark:text-[#0B0C0E] rounded-lg hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Identity Changes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#3F4147] dark:text-[#B2B6C2] mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formState.displayName}
              onChange={(e) => setFormState({ ...formState, displayName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCDCD4] dark:border-[#262932] bg-[#F6F6F3] dark:bg-[#0B0C0E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3F4147] dark:text-[#B2B6C2] mb-1">
              Username Handle
            </label>
            <input
              type="text"
              value={formState.handle}
              onChange={(e) => setFormState({ ...formState, handle: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#DCDCD4] dark:border-[#262932] bg-[#F6F6F3] dark:bg-[#0B0C0E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3F4147] dark:text-[#B2B6C2] mb-1">
              Discipline / Title
            </label>
            <input
              type="text"
              value={formState.discipline}
              onChange={(e) => setFormState({ ...formState, discipline: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCDCD4] dark:border-[#262932] bg-[#F6F6F3] dark:bg-[#0B0C0E]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#3F4147] dark:text-[#B2B6C2] mb-1">
              Location
            </label>
            <input
              type="text"
              value={formState.location}
              onChange={(e) => setFormState({ ...formState, location: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCDCD4] dark:border-[#262932] bg-[#F6F6F3] dark:bg-[#0B0C0E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3F4147] dark:text-[#B2B6C2] mb-1">
              Availability Note
            </label>
            <input
              type="text"
              value={formState.availabilityText}
              onChange={(e) => setFormState({ ...formState, availabilityText: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCDCD4] dark:border-[#262932] bg-[#F6F6F3] dark:bg-[#0B0C0E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3F4147] dark:text-[#B2B6C2] mb-1">
              Direct Inquiry Email
            </label>
            <input
              type="email"
              value={formState.contactEmail}
              onChange={(e) => setFormState({ ...formState, contactEmail: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#DCDCD4] dark:border-[#262932] bg-[#F6F6F3] dark:bg-[#0B0C0E]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#3F4147] dark:text-[#B2B6C2] mb-1">
            Biography
          </label>
          <textarea
            rows={3}
            value={formState.bio}
            onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCDCD4] dark:border-[#262932] bg-[#F6F6F3] dark:bg-[#0B0C0E]"
          />
        </div>
      </form>
    </div>
  );
};
