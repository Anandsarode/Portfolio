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
} from 'lucide-react';
import type {
  ProfileConfig,
  ThemePresetId,
  LayoutModeId,
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

const THEME_OPTIONS: Array<{
  id: ThemePresetId;
  name: string;
  desc: string;
  swatchBg: string;
  swatchSurface: string;
  swatchAccent: string;
}> = [
  {
    id: 'alabaster',
    name: 'Warm Alabaster & Cinnabar',
    desc: 'Warm stone neutral canvas paired with deep espresso ink and terracotta highlights.',
    swatchBg: '#FAF8F5',
    swatchSurface: '#F3EFEA',
    swatchAccent: '#C84B31',
  },
  {
    id: 'monograph',
    name: 'Swiss Monograph Paper',
    desc: 'Crisp gallery white canvas with high-contrast monochrome ink and cobalt accents.',
    swatchBg: '#FFFFFF',
    swatchSurface: '#F7F7F5',
    swatchAccent: '#1D4ED8',
  },
  {
    id: 'travertine',
    name: 'Roman Travertine & Umber',
    desc: 'Rich limestone paper field inspired by architectural exhibition catalogues.',
    swatchBg: '#F2ECE1',
    swatchSurface: '#E8E0D2',
    swatchAccent: '#9E3B24',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Nocturne',
    desc: 'Deep architectural slate surface with warm parchment typography for evening viewing.',
    swatchBg: '#0C0C0E',
    swatchSurface: '#151519',
    swatchAccent: '#D96B43',
  },
];

const LAYOUT_OPTIONS: Array<{
  id: LayoutModeId;
  name: string;
  desc: string;
}> = [
  {
    id: 'editorial-split',
    name: 'Editorial Split Hero + 2-Column Grid',
    desc: 'Asymmetric magazine header pairing oversized serif typography with a vertical cover frame.',
  },
  {
    id: 'monograph-column',
    name: 'Monograph Single-Column Stack',
    desc: 'Focused full-width linear reading flow ideal for essays, publications, and music.',
  },
  {
    id: 'bento-showcase',
    name: 'Curated Bento Showcase',
    desc: 'Panoramic header banner above a modular 2-column Bento grid of featured works.',
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E6E1DA] dark:border-[#26262B]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6E6A63] dark:text-[#9E988E] mb-1">
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
            <h1 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#181615] dark:text-[#F4F1EA]">
              Daily Link, Embed & Domain Health Check
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => triggerDiagnostic(false)}
              disabled={isRunningCheck}
              className="px-4 py-2 text-xs font-medium border border-[#D8D2C9] dark:border-[#323238] bg-white dark:bg-[#16161A] text-[#181615] dark:text-[#F4F1EA] rounded-lg hover:bg-[#F3EFEA] dark:hover:bg-[#222228] disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningCheck ? 'animate-spin' : ''}`} />
              <span>{isRunningCheck ? 'Scanning Endpoints...' : 'Run Daily Health Scan'}</span>
            </button>

            <button
              type="button"
              onClick={() => triggerDiagnostic(true)}
              disabled={isRunningCheck}
              className="px-4 py-2 text-xs font-medium bg-[#181615] dark:bg-[#F4F1EA] text-[#FAF8F5] dark:text-[#0C0C0E] rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Scan & Auto-Resolve Issues</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-xl p-5">
            <div className="text-xs text-[#6E6A63] dark:text-[#9E988E]">
              Verified Healthy Endpoints
            </div>
            <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[#15803D]">
              {healthyCount}
            </div>
            <div className="mt-1 text-xs text-[#6E6A63]">
              Links, social profiles, and embeds responding cleanly
            </div>
          </div>

          <div className="border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-xl p-5">
            <div className="text-xs text-[#6E6A63] dark:text-[#9E988E]">
              Auto-Resolved Configurations
            </div>
            <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[#181615] dark:text-[#F4F1EA]">
              {resolvedCount}
            </div>
            <div className="mt-1 text-xs text-[#6E6A63]">
              Protocol prefixes, embed URLs, and redirect paths normalized
            </div>
          </div>

          <div className="border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-xl p-5">
            <div className="text-xs text-[#6E6A63] dark:text-[#9E988E]">
              Actionable Warnings
            </div>
            <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[#B45309]">
              {issueCount}
            </div>
            <div className="mt-1 text-xs text-[#6E6A63]">
              Unreachable URLs or pending domain DNS records
            </div>
          </div>
        </div>

        {/* Detailed Audit Table */}
        <div className="border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-xl overflow-hidden">
          {diagnostics.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="font-editorial text-2xl font-semibold text-[#181615] dark:text-[#F4F1EA]">
                Ready to Execute Daily Link & Domain Verification
              </div>
              <p className="text-xs text-[#6E6A63] dark:text-[#9E988E] max-w-md mx-auto">
                Click "Scan & Auto-Resolve Issues" to perform live HTTP HEAD/GET reachability probes across all links, social handles, media embeds, redirect rules, and custom domains.
              </p>
              <button
                type="button"
                onClick={() => triggerDiagnostic(true)}
                disabled={isRunningCheck}
                className="mt-2 px-4 py-2 text-xs font-medium bg-[#181615] dark:bg-[#F4F1EA] text-[#FAF8F5] dark:text-[#0C0C0E] rounded-lg hover:opacity-90 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Run First Health Audit Now</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E6E1DA] dark:border-[#26262B] bg-[#FAF8F5] dark:bg-[#121215] text-[#6E6A63]">
                    <th className="py-3 px-4 font-medium">Component / Block</th>
                    <th className="py-3 px-4 font-medium">Target Endpoint</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium text-right">HTTP / Latency</th>
                    <th className="py-3 px-4 font-medium">Diagnostic & Resolution Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6] dark:divide-[#222228]">
                  {diagnostics.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#1C1C22]">
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#181615] dark:text-[#F4F1EA]">
                          {item.targetName}
                        </div>
                        <div className="text-[11px] text-[#6E6A63] capitalize">
                          {item.targetType}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#6E6A63] truncate max-w-[240px]">
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
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#181615] dark:text-[#F4F1EA]">
                        {item.httpStatusCode ? `HTTP ${item.httpStatusCode}` : 'DNS'} · {item.latencyMs}ms
                      </td>
                      <td className="py-3 px-4 text-[#4A4640] dark:text-[#B8B3A8]">
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E6E1DA] dark:border-[#26262B]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6E6A63] dark:text-[#9E988E] mb-1">
            <span>Editorial Design System</span>
            <span aria-hidden="true">·</span>
            <span>Typography, Palette & Identity</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#181615] dark:text-[#F4F1EA]">
            Appearance, Palette & Profile Identity
          </h1>
        </div>

        {savedToast && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#15803D]">
            <Check className="w-4 h-4" />
            <span>Appearance & Profile Saved</span>
          </div>
        )}
      </div>

      {/* Curated Editorial Theme Presets */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#181615] dark:text-[#F4F1EA]">
          <Palette className="w-4 h-4" />
          <span>01. Editorial Color Palette Preset</span>
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
                    ? 'border-[#C84B31] ring-1 ring-[#C84B31]/30 bg-white dark:bg-[#1C1C22]'
                    : 'border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] hover:border-[#BDB6AA]'
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
                <div className="font-editorial text-lg font-semibold text-[#181615] dark:text-[#F4F1EA]">
                  {opt.name}
                </div>
                <p className="text-xs text-[#6E6A63] dark:text-[#9E988E] mt-1">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spatial Layout Architecture */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#181615] dark:text-[#F4F1EA]">
          <Layout className="w-4 h-4" />
          <span>02. Spatial Layout Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LAYOUT_OPTIONS.map((lay) => {
            const isSelected = profile.layoutMode === lay.id;
            return (
              <button
                key={lay.id}
                type="button"
                onClick={() => {
                  setFormState((prev) => ({ ...prev, layoutMode: lay.id }));
                  onUpdateProfile({ layoutMode: lay.id });
                }}
                className={`text-left p-5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#C84B31] ring-1 ring-[#C84B31]/30 bg-white dark:bg-[#1C1C22]'
                    : 'border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] hover:border-[#BDB6AA]'
                }`}
              >
                <div className="font-editorial text-lg font-semibold text-[#181615] dark:text-[#F4F1EA]">
                  {lay.name}
                </div>
                <p className="text-xs text-[#6E6A63] dark:text-[#9E988E] mt-1">
                  {lay.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Identity & Biography Form */}
      <form
        onSubmit={handleSaveProfile}
        className="border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#EFECE6] dark:border-[#222228]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#181615] dark:text-[#F4F1EA]">
            <User className="w-4 h-4" />
            <span>03. Creator Identity, Bio & Editorial Ribbon</span>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium bg-[#181615] dark:bg-[#F4F1EA] text-[#FAF8F5] dark:text-[#0C0C0E] rounded-lg hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Identity Changes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formState.displayName}
              onChange={(e) => setFormState({ ...formState, displayName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
              Username Handle
            </label>
            <input
              type="text"
              value={formState.handle}
              onChange={(e) => setFormState({ ...formState, handle: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
              Discipline / Title
            </label>
            <input
              type="text"
              value={formState.discipline}
              onChange={(e) => setFormState({ ...formState, discipline: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
              Location
            </label>
            <input
              type="text"
              value={formState.location}
              onChange={(e) => setFormState({ ...formState, location: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
              Availability Note
            </label>
            <input
              type="text"
              value={formState.availabilityText}
              onChange={(e) => setFormState({ ...formState, availabilityText: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
              Direct Inquiry Email
            </label>
            <input
              type="email"
              value={formState.contactEmail}
              onChange={(e) => setFormState({ ...formState, contactEmail: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
            Editorial Biography
          </label>
          <textarea
            rows={3}
            value={formState.bio}
            onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2 border-t border-[#EFECE6] dark:border-[#222228]">
          <div className="md:col-span-3 flex items-center gap-2">
            <input
              id="marquee-toggle"
              type="checkbox"
              checked={formState.showMarquee}
              onChange={(e) => setFormState({ ...formState, showMarquee: e.target.checked })}
              className="rounded border-[#D8D2C9]"
            />
            <label htmlFor="marquee-toggle" className="text-xs font-medium text-[#181615] dark:text-[#F4F1EA]">
              Display Marquee Section Divider
            </label>
          </div>
          <div className="md:col-span-9">
            <input
              type="text"
              value={formState.marqueeText}
              onChange={(e) => setFormState({ ...formState, marqueeText: e.target.value })}
              placeholder="Marquee ribbon text..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
