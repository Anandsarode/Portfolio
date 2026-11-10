import React, { useState, useEffect, useCallback } from 'react';
import type {
  AppState,
  ProfileConfig,
  ContentBlock,
  SocialProfile,
  AnalyticsWidgetConfig,
  RedirectRule,
} from './types';
import { LandingPageRenderer } from './components/LandingPageRenderer';
import { PageBuilderView } from './components/PageBuilderView';
import { AnalyticsView } from './components/AnalyticsView';
import { DomainManagerView } from './components/DomainManagerView';
import { AppearanceAndHealthView } from './components/AppearanceAndHealthView';

type StudioTab = 'builder' | 'analytics' | 'domains' | 'appearance' | 'health';

export default function App() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>('builder');
  const [isLivePageView, setIsLivePageView] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const data: AppState = await res.json();
      setAppState(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load workspace state.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Keep dark mode class synced on <html>
  useEffect(() => {
    if (!appState) return;
    document.documentElement.classList.toggle('dark', Boolean(appState.profile.darkMode));
  }, [appState?.profile.darkMode]);

  const handleRecordEvent = useCallback(
    async (
      type: 'page_view' | 'link_click' | 'social_click' | 'media_play',
      targetId?: string,
      targetTitle?: string
    ) => {
      try {
        const isMobile = window.innerWidth < 768;
        const res = await fetch('/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            targetId,
            targetTitle,
            referrer: document.referrer ? new URL(document.referrer).hostname : 'Direct',
            device: isMobile ? 'Mobile' : 'Desktop',
            region: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Global',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAppState((prev) =>
            prev
              ? {
                  ...prev,
                  events: [data.event, ...prev.events],
                  blocks: data.blocks || prev.blocks,
                  socials: data.socials || prev.socials,
                }
              : prev
          );
        }
      } catch {
        // Non-blocking telemetry
      }
    },
    []
  );

  const handleUpdateProfile = async (updates: Partial<ProfileConfig>) => {
    if (!appState) return;
    const optimistic = { ...appState.profile, ...updates };
    setAppState({ ...appState, profile: optimistic });
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setAppState((prev) => (prev ? { ...prev, profile: data.profile } : prev));
    }
  };

  const handleUpdateBlocks = async (nextBlocks: ContentBlock[]) => {
    if (!appState) return;
    setAppState({ ...appState, blocks: nextBlocks });
    const res = await fetch('/api/blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks: nextBlocks }),
    });
    if (res.ok) {
      const data = await res.json();
      setAppState((prev) => (prev ? { ...prev, blocks: data.blocks } : prev));
    }
  };

  const handleUpdateSocials = async (nextSocials: SocialProfile[]) => {
    if (!appState) return;
    setAppState({ ...appState, socials: nextSocials });
    const res = await fetch('/api/socials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ socials: nextSocials }),
    });
    if (res.ok) {
      const data = await res.json();
      setAppState((prev) => (prev ? { ...prev, socials: data.socials } : prev));
    }
  };

  const handleUpdateWidgetLayout = async (nextWidgets: AnalyticsWidgetConfig[]) => {
    if (!appState) return;
    setAppState({ ...appState, analyticsWidgets: nextWidgets });
    const res = await fetch('/api/analytics/layout', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analyticsWidgets: nextWidgets }),
    });
    if (res.ok) {
      const data = await res.json();
      setAppState((prev) =>
        prev ? { ...prev, analyticsWidgets: data.analyticsWidgets } : prev
      );
    }
  };

  const handleAddDomain = async (domainName: string) => {
    const res = await fetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: domainName }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to add domain.');
    }
    setAppState((prev) => (prev ? { ...prev, domains: data.domains } : prev));
  };

  const handleVerifyDomain = async (id: string) => {
    const res = await fetch(`/api/domains/${id}/verify`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setAppState((prev) => (prev ? { ...prev, domains: data.domains } : prev));
    }
  };

  const handleSetPrimaryDomain = async (id: string) => {
    const res = await fetch(`/api/domains/${id}/primary`, { method: 'PUT' });
    if (res.ok) {
      const data = await res.json();
      setAppState((prev) => (prev ? { ...prev, domains: data.domains } : prev));
    }
  };

  const handleDeleteDomain = async (id: string) => {
    const res = await fetch(`/api/domains/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const data = await res.json();
      setAppState((prev) => (prev ? { ...prev, domains: data.domains } : prev));
    }
  };

  const handleUpdateRedirects = async (nextRedirects: RedirectRule[]) => {
    if (!appState) return;
    setAppState({ ...appState, redirects: nextRedirects });
    const res = await fetch('/api/redirects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ redirects: nextRedirects }),
    });
    if (res.ok) {
      const data = await res.json();
      setAppState((prev) => (prev ? { ...prev, redirects: data.redirects } : prev));
    }
  };

  const handleRunDiagnostics = async (autoResolve: boolean) => {
    const res = await fetch('/api/diagnostics/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoResolve }),
    });
    if (res.ok) {
      const data = await res.json();
      setAppState((prev) =>
        prev
          ? {
              ...prev,
              diagnostics: data.diagnostics,
              lastDiagnosticRunAt: data.lastDiagnosticRunAt,
              blocks: data.blocks || prev.blocks,
              socials: data.socials || prev.socials,
              redirects: data.redirects || prev.redirects,
              domains: data.domains || prev.domains,
            }
          : prev
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0C0E] text-[#181615] dark:text-[#F4F1EA] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4">
          <div className="h-7 w-48 bg-[#E6E1DA] dark:bg-[#222228] rounded animate-pulse" />
          <div className="h-32 w-full bg-[#EFECE6] dark:bg-[#16161A] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError || !appState) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0C0E] text-[#181615] dark:text-[#F4F1EA] flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-xl p-6 space-y-4">
          <h1 className="font-editorial text-2xl font-semibold">Workspace Connection Notice</h1>
          <p className="text-xs text-[#6E6A63]">{loadError}</p>
          <button
            type="button"
            onClick={fetchState}
            className="px-4 py-2 text-xs font-medium bg-[#181615] text-white rounded-lg cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const primaryDomain = appState.domains.find((d) => d.isPrimary)?.domain;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F3] dark:bg-[#0B0C0E] text-[#111215] dark:text-[#F3F4F6] transition-colors">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-[#DCDCD4] dark:border-[#262932] bg-[#F6F6F3]/95 dark:bg-[#0B0C0E]/95 backdrop-blur-xs sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#studio"
          onClick={(e) => {
            e.preventDefault();
            setIsLivePageView(false);
            setActiveTab('builder');
          }}
          className="font-editorial text-xl sm:text-2xl font-extrabold tracking-tight text-[#111215] dark:text-[#F3F4F6] whitespace-nowrap shrink-0"
        >
          Atelier Link
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium text-[#6E717A] dark:text-[#9CA3AF] overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setIsLivePageView(false);
              setActiveTab('builder');
            }}
            className={`hover:text-[#111215] dark:hover:text-[#F3F4F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              !isLivePageView && activeTab === 'builder'
                ? 'text-[#111215] dark:text-[#F3F4F6] underline underline-offset-8 decoration-[#1D4ED8] decoration-2'
                : ''
            }`}
          >
            Page Builder
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLivePageView(false);
              setActiveTab('analytics');
            }}
            className={`hover:text-[#111215] dark:hover:text-[#F3F4F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              !isLivePageView && activeTab === 'analytics'
                ? 'text-[#111215] dark:text-[#F3F4F6] underline underline-offset-8 decoration-[#1D4ED8] decoration-2'
                : ''
            }`}
          >
            Analytics
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLivePageView(false);
              setActiveTab('domains');
            }}
            className={`hover:text-[#111215] dark:hover:text-[#F3F4F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              !isLivePageView && activeTab === 'domains'
                ? 'text-[#111215] dark:text-[#F3F4F6] underline underline-offset-8 decoration-[#1D4ED8] decoration-2'
                : ''
            }`}
          >
            Domains
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLivePageView(false);
              setActiveTab('appearance');
            }}
            className={`hover:text-[#111215] dark:hover:text-[#F3F4F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              !isLivePageView && activeTab === 'appearance'
                ? 'text-[#111215] dark:text-[#F3F4F6] underline underline-offset-8 decoration-[#1D4ED8] decoration-2'
                : ''
            }`}
          >
            Page Designs & Fonts
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLivePageView(false);
              setActiveTab('health');
            }}
            className={`hover:text-[#111215] dark:hover:text-[#F3F4F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              !isLivePageView && activeTab === 'health'
                ? 'text-[#111215] dark:text-[#F3F4F6] underline underline-offset-8 decoration-[#1D4ED8] decoration-2'
                : ''
            }`}
          >
            Health Check
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              const nextLive = !isLivePageView;
              setIsLivePageView(nextLive);
              if (nextLive) {
                handleRecordEvent('page_view', 'landing-page', 'Public Landing Page');
              }
            }}
            className="px-4 py-2 text-xs font-semibold bg-[#111215] dark:bg-[#F3F4F6] text-white dark:text-[#0B0C0E] rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isLivePageView ? 'Return to Studio' : 'View Live Page'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {isLivePageView ? (
          <LandingPageRenderer
            profile={appState.profile}
            socials={appState.socials}
            blocks={appState.blocks}
            primaryDomain={primaryDomain}
            isPreview={false}
            onRecordEvent={handleRecordEvent}
            onQuickSwitchDesign={handleUpdateProfile}
          />
        ) : (
          <>
            {activeTab === 'builder' && (
              <PageBuilderView
                profile={appState.profile}
                socials={appState.socials}
                blocks={appState.blocks}
                primaryDomain={primaryDomain}
                onUpdateProfile={handleUpdateProfile}
                onUpdateBlocks={handleUpdateBlocks}
                onUpdateSocials={handleUpdateSocials}
                onRecordEvent={handleRecordEvent}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                events={appState.events}
                blocks={appState.blocks}
                socials={appState.socials}
                widgets={appState.analyticsWidgets}
                onUpdateWidgetLayout={handleUpdateWidgetLayout}
              />
            )}

            {activeTab === 'domains' && (
              <DomainManagerView
                domains={appState.domains}
                redirects={appState.redirects}
                onAddDomain={handleAddDomain}
                onVerifyDomain={handleVerifyDomain}
                onSetPrimaryDomain={handleSetPrimaryDomain}
                onDeleteDomain={handleDeleteDomain}
                onUpdateRedirects={handleUpdateRedirects}
              />
            )}

            {(activeTab === 'appearance' || activeTab === 'health') && (
              <AppearanceAndHealthView
                mode={activeTab}
                profile={appState.profile}
                diagnostics={appState.diagnostics}
                lastDiagnosticRunAt={appState.lastDiagnosticRunAt}
                onUpdateProfile={handleUpdateProfile}
                onRunDiagnostics={handleRunDiagnostics}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
