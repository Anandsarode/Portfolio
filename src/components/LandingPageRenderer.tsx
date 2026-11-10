import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUpRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Globe,
  Mail,
  ExternalLink,
  Share2,
  Check,
  Film,
  BookOpen,
} from 'lucide-react';
import type {
  ProfileConfig,
  SocialProfile,
  ContentBlock,
  ThemePresetId,
  FontPairingId,
  LayoutModeId,
} from '../types';

interface LandingPageRendererProps {
  profile: ProfileConfig;
  socials: SocialProfile[];
  blocks: ContentBlock[];
  primaryDomain?: string;
  isPreview?: boolean;
  onRecordEvent: (
    type: 'page_view' | 'link_click' | 'social_click' | 'media_play',
    targetId?: string,
    targetTitle?: string
  ) => void;
  onQuickSwitchDesign?: (updates: Partial<ProfileConfig>) => void;
}

const THEME_STYLES: Record<
  ThemePresetId,
  {
    canvas: string;
    surface: string;
    surfaceHover: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accentBg: string;
    accentText: string;
    buttonPrimary: string;
  }
> = {
  monograph: {
    canvas: 'bg-[#F6F6F3] text-[#111215]',
    surface: 'bg-[#FFFFFF]',
    surfaceHover: 'hover:bg-[#EFEFEA]',
    border: 'border-[#DCDCD4]',
    textPrimary: 'text-[#111215]',
    textSecondary: 'text-[#3F4147]',
    textMuted: 'text-[#6E717A]',
    accentBg: 'bg-[#1D4ED8]',
    accentText: 'text-[#1D4ED8]',
    buttonPrimary: 'bg-[#111215] text-[#FFFFFF] hover:bg-[#272930]',
  },
  obsidian: {
    canvas: 'bg-[#0B0C0E] text-[#F3F4F6]',
    surface: 'bg-[#131519]',
    surfaceHover: 'hover:bg-[#1B1E24]',
    border: 'border-[#262932]',
    textPrimary: 'text-[#F3F4F6]',
    textSecondary: 'text-[#B2B6C2]',
    textMuted: 'text-[#787D8C]',
    accentBg: 'bg-[#3B82F6]',
    accentText: 'text-[#60A5FA]',
    buttonPrimary: 'bg-[#F3F4F6] text-[#0B0C0E] hover:bg-[#E2E4E9]',
  },
  alabaster: {
    canvas: 'bg-[#FAF7F2] text-[#181615]',
    surface: 'bg-[#F2EDE4]',
    surfaceHover: 'hover:bg-[#EAE3D7]',
    border: 'border-[#E0D8CC]',
    textPrimary: 'text-[#181615]',
    textSecondary: 'text-[#4A4640]',
    textMuted: 'text-[#787269]',
    accentBg: 'bg-[#C84B31]',
    accentText: 'text-[#C84B31]',
    buttonPrimary: 'bg-[#181615] text-[#FAF7F2] hover:bg-[#2E2A28]',
  },
  travertine: {
    canvas: 'bg-[#EFECE6] text-[#191816]',
    surface: 'bg-[#E5E0D7]',
    surfaceHover: 'hover:bg-[#DBD4C8]',
    border: 'border-[#CFC7B9]',
    textPrimary: 'text-[#191816]',
    textSecondary: 'text-[#49453F]',
    textMuted: 'text-[#756E65]',
    accentBg: 'bg-[#0F766E]',
    accentText: 'text-[#0F766E]',
    buttonPrimary: 'bg-[#191816] text-[#EFECE6] hover:bg-[#2E2B27]',
  },
};

const FONT_CLASS_MAP: Record<FontPairingId, string> = {
  bricolage: 'font-pair-bricolage',
  syne: 'font-pair-syne',
  fraunces: 'font-pair-fraunces',
  bodoni: 'font-pair-bodoni',
  oswald: 'font-pair-oswald',
};

function SocialPlatformSvg({ platform }: { platform: SocialProfile['platform'] }) {
  switch (platform) {
    case 'instagram':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'x':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="2" y="4" width="20" height="16" rx="4" />
          <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" />
        </svg>
      );
    case 'spotify':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14.5c2.5-1 5.5-1 8 0" strokeLinecap="round" />
          <path d="M7 11.5c3-1.2 7-1.2 10 0" strokeLinecap="round" />
          <path d="M8.5 17.2c2-0.7 4.5-0.7 6.5 0" strokeLinecap="round" />
        </svg>
      );
    case 'github':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    default:
      return <Globe className="w-4 h-4" />;
  }
}

function SafeImage({
  src,
  alt,
  className,
  fallbackTitle,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#E4E4DC] via-[#D6D6CC] to-[#C8C8BC] text-[#3F4147] p-6 text-center ${className || ''}`}
      >
        <BookOpen className="w-6 h-6 mb-2 opacity-60" />
        {fallbackTitle && (
          <span className="page-display text-sm line-clamp-2 max-w-[20ch]">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

// Real Web Audio Studio Composition Player
function StudioAudioPlayer({
  block,
  theme,
  onPlayStart,
}: {
  block: ContentBlock;
  theme: (typeof THEME_STYLES)['monograph'];
  onPlayStart: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeNoteHz, setActiveNoteHz] = useState<number>(220);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef<number>(0);

  const chordNotes = [220.0, 261.63, 329.63, 392.0, 440.0, 293.66, 329.63, 196.0];

  const stopAudio = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const triggerWarmTone = (ctx: AudioContext, dest: AudioNode, freq: number) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(freq * 0.5, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);

    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.12, now + 0.35);
    noteGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.4);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(dest);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 2.5);
    subOsc.stop(now + 2.5);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    onPlayStart();
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.value = isMuted ? 0 : 0.7;
    masterGain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = masterGain;
    setIsPlaying(true);

    const initialFreq = chordNotes[stepRef.current % chordNotes.length];
    setActiveNoteHz(initialFreq);
    triggerWarmTone(ctx, masterGain, initialFreq);

    timerRef.current = window.setInterval(() => {
      stepRef.current += 1;
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2.5));
      if (audioCtxRef.current && gainNodeRef.current) {
        const freq = chordNotes[stepRef.current % chordNotes.length];
        setActiveNoteHz(freq);
        triggerWarmTone(audioCtxRef.current, gainNodeRef.current, freq);
      }
    }, 1400);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        nextMuted ? 0 : 0.7,
        audioCtxRef.current.currentTime
      );
    }
  };

  const bars = [28, 52, 74, 42, 88, 64, 35, 78, 92, 50, 68, 44, 82, 58, 38, 72, 60, 48, 84, 54, 40, 66, 76, 45];

  return (
    <div className={`border ${theme.border} ${theme.surface} p-5 transition-colors`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-20 h-20 overflow-hidden shrink-0 border border-black/10">
          <SafeImage
            src={block.thumbnailUrl}
            alt={block.title}
            fallbackTitle={block.title}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause composition' : 'Play composition'}
            className="absolute inset-0 bg-black/45 hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-2 text-xs ${theme.textMuted} mb-1`}>
            <span>{block.category}</span>
            <span aria-hidden="true">·</span>
            <span>{block.publishedDate}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {isPlaying ? `${activeNoteHz.toFixed(1)} Hz` : block.durationLabel || '04:18'}
            </span>
          </div>

          <h3 className={`page-display text-xl font-bold tracking-tight ${theme.textPrimary} truncate`}>
            {block.title}
          </h3>
          <p className={`text-sm ${theme.textSecondary} line-clamp-1 mt-0.5`}>
            {block.subtitle}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className={`px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${theme.buttonPrimary}`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Master</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Listen In-Page</span>
                </>
              )}
            </button>

            <div
              className="flex-1 flex items-end gap-1 h-7 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                setProgress(pct);
                if (!isPlaying) togglePlay();
              }}
              title="Click to scrub studio session"
            >
              {bars.map((height, idx) => {
                const barPct = (idx / bars.length) * 100;
                const active = isPlaying
                  ? (idx + stepRef.current) % 3 === 0 || barPct <= progress
                  : barPct <= progress;
                return (
                  <div
                    key={idx}
                    style={{
                      height: `${
                        isPlaying
                          ? Math.max(20, (height + ((idx * stepRef.current * 13) % 35)) % 100)
                          : height
                      }%`,
                    }}
                    className={`flex-1 transition-all duration-150 ${
                      active ? theme.accentBg : 'bg-current opacity-20'
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              className={`p-1.5 border ${theme.border} ${theme.textSecondary} hover:opacity-80 cursor-pointer`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {block.url && (
              <a
                href={block.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onPlayStart()}
                className={`text-xs font-medium flex items-center gap-1 ${theme.textSecondary} hover:underline whitespace-nowrap shrink-0`}
              >
                <span>Stream</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const LandingPageRenderer: React.FC<LandingPageRendererProps> = ({
  profile,
  socials,
  blocks,
  primaryDomain,
  isPreview = false,
  onRecordEvent,
  onQuickSwitchDesign,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);

  const effectivePreset: ThemePresetId = profile.darkMode ? 'obsidian' : profile.themePreset;
  const theme = THEME_STYLES[effectivePreset] || THEME_STYLES.monograph;
  const fontClass = FONT_CLASS_MAP[profile.fontPairing || 'bricolage'] || 'font-pair-bricolage';

  // Normalize legacy layoutMode values to our 4 distinct page designs
  const activeDesign: LayoutModeId =
    profile.layoutMode === 'editorial-split'
      ? 'architectural-grid'
      : profile.layoutMode === 'monograph-column'
      ? 'broadsheet-journal'
      : profile.layoutMode === 'bento-showcase'
      ? 'avant-kinetic'
      : profile.layoutMode || 'architectural-grid';

  const activeSocials = socials.filter((s) => s.enabled);
  const activeBlocks = blocks.filter((b) => b.enabled);

  const handleShareLink = () => {
    const shareUrl = primaryDomain ? `https://${primaryDomain}` : window.location.origin;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const renderMediaBlock = (block: ContentBlock, idx: number) => {
    if (block.mediaKind === 'audio_studio') {
      return (
        <StudioAudioPlayer
          key={block.id}
          block={block}
          theme={theme}
          onPlayStart={() => onRecordEvent('media_play', block.id, block.title)}
        />
      );
    }

    return (
      <div
        key={block.id}
        className={`border ${theme.border} ${theme.surface} overflow-hidden`}
      >
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className={`flex items-center gap-2 text-xs ${theme.textMuted} mb-1`}>
              <span className="font-mono tabular-nums">0{idx + 1}</span>
              <span aria-hidden="true">·</span>
              <Film className="w-3.5 h-3.5" />
              <span>{block.category}</span>
              <span aria-hidden="true">·</span>
              <span>{block.publishedDate}</span>
            </div>
            <h3 className={`page-display text-xl font-bold tracking-tight ${theme.textPrimary}`}>
              {block.title}
            </h3>
            <p className={`text-sm ${theme.textSecondary} mt-0.5`}>{block.subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {block.mediaEmbedUrl && (
              <button
                type="button"
                onClick={() => {
                  const next = expandedVideoId === block.id ? null : block.id;
                  setExpandedVideoId(next);
                  if (next) {
                    onRecordEvent('media_play', block.id, block.title);
                  }
                }}
                className={`px-3.5 py-2 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${theme.buttonPrimary}`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{expandedVideoId === block.id ? 'Close Player' : 'Play Embed'}</span>
              </button>
            )}
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onRecordEvent('link_click', block.id, block.title)}
              className={`px-3.5 py-2 border ${theme.border} text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 ${theme.textPrimary} hover:opacity-80`}
            >
              <span>Open</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {expandedVideoId === block.id && block.mediaEmbedUrl && (
          <div className={`border-t ${theme.border} bg-black aspect-video w-full`}>
            <iframe
              src={block.mediaEmbedUrl}
              title={block.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-full w-full transition-colors duration-200 page-font-scope ${fontClass} ${theme.canvas}`}>
      {/* Quick Design & Font Switcher Strip when callback provided */}
      {onQuickSwitchDesign && (
        <div className={`border-b ${theme.border} ${theme.surface} px-6 py-2.5`}>
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`font-mono text-[11px] mr-1 ${theme.textMuted}`}>Page Design:</span>
              {(
                [
                  { id: 'architectural-grid', label: '01. Architectural Grid', font: 'bricolage' },
                  { id: 'avant-kinetic', label: '02. Avant-Garde Kinetic', font: 'syne' },
                  { id: 'broadsheet-journal', label: '03. Broadsheet Journal', font: 'fraunces' },
                  { id: 'couture-salon', label: '04. Couture Lookbook', font: 'bodoni' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    onQuickSwitchDesign({
                      layoutMode: preset.id,
                      fontPairing: preset.font,
                    })
                  }
                  className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeDesign === preset.id
                      ? theme.buttonPrimary
                      : `border ${theme.border} ${theme.textSecondary} hover:opacity-80`
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`font-mono text-[11px] ${theme.textMuted}`}>Font Family:</span>
              {(
                [
                  { id: 'bricolage', label: 'Bricolage + DM Sans' },
                  { id: 'syne', label: 'Syne + Urbanist' },
                  { id: 'fraunces', label: 'Fraunces + Public' },
                  { id: 'bodoni', label: 'Bodoni + DM Sans' },
                  { id: 'oswald', label: 'Oswald + Public' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onQuickSwitchDesign({ fontPairing: f.id })}
                  className={`px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    (profile.fontPairing || 'bricolage') === f.id
                      ? theme.buttonPrimary
                      : `border ${theme.border} ${theme.textSecondary}`
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Metadata Bar */}
      <div className={`border-b ${theme.border} px-6 py-3`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className={`flex items-center gap-2 font-mono ${theme.textMuted}`}>
            <span className={theme.textPrimary}>{profile.editionLabel}</span>
            <span aria-hidden="true">/</span>
            <span>{profile.location}</span>
            {primaryDomain && (
              <>
                <span aria-hidden="true">/</span>
                <span className="tabular-nums">{primaryDomain}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {profile.contactEmail && (
              <a
                href={`mailto:${profile.contactEmail}`}
                onClick={() =>
                  onRecordEvent('link_click', 'contact-email', `Email (${profile.contactEmail})`)
                }
                className={`flex items-center gap-1.5 font-medium ${theme.textSecondary} hover:underline whitespace-nowrap shrink-0`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Direct Inquiry</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleShareLink}
              className={`flex items-center gap-1.5 font-medium ${theme.textSecondary} hover:underline whitespace-nowrap shrink-0 cursor-pointer`}
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share URL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          DESIGN 01: ARCHITECTURAL SWISS GRID (Bricolage Grotesque + Blueprint Grid)
         ===================================================================== */}
      {activeDesign === 'architectural-grid' && (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          {/* Exposed Blueprint Grid Header */}
          <div className={`border ${theme.border} ${theme.surface} grid grid-cols-1 lg:grid-cols-12`}>
            {/* Portrait Column */}
            <div className={`lg:col-span-4 border-b lg:border-b-0 lg:border-r ${theme.border} p-6 flex flex-col justify-between`}>
              <div className="aspect-square w-full overflow-hidden border border-black/10 mb-4">
                <SafeImage
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  fallbackTitle={profile.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className={`font-mono text-[11px] ${theme.textMuted}`}>
                  INDEX // @{profile.handle}
                </div>
                <div className={`text-xs font-medium ${theme.textSecondary}`}>
                  {profile.availabilityText}
                </div>
              </div>
            </div>

            {/* Typographic Statement & Gridded Social Matrix */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div className="p-6 sm:p-8 space-y-4">
                <div className={`text-xs font-mono ${theme.accentText}`}>
                  {profile.discipline}
                </div>
                <h1
                  className={`page-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.03] ${theme.textPrimary}`}
                  style={{ textWrap: 'balance' }}
                >
                  {profile.displayName}
                </h1>
                <p className={`text-base sm:text-lg leading-relaxed max-w-[60ch] ${theme.textSecondary}`}>
                  {profile.bio}
                </p>
              </div>

              {activeSocials.length > 0 && (
                <div className={`border-t ${theme.border} grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-y-0 divide-x ${theme.border}`}>
                  {activeSocials.map((soc) => (
                    <a
                      key={soc.id}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        onRecordEvent('social_click', soc.id, `${soc.label} (${soc.handle})`)
                      }
                      className={`p-3.5 flex items-center justify-between gap-2 ${theme.surfaceHover} transition-colors group`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SocialPlatformSvg platform={soc.platform} />
                        <div className="min-w-0">
                          <div className={`text-xs font-semibold ${theme.textPrimary} truncate`}>
                            {soc.label}
                          </div>
                          <div className={`text-[11px] font-mono ${theme.textMuted} truncate`}>
                            {soc.handle}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className={`w-3.5 h-3.5 ${theme.textMuted} group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0`} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Architectural Numbered Blocks Ledger */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b pb-3 border-current/15">
              <h2 className={`page-display text-2xl font-bold tracking-tight ${theme.textPrimary}`}>
                01. Directory of Works, Links & Studio Media
              </h2>
              <span className={`font-mono text-xs tabular-nums ${theme.textMuted}`}>
                [{activeBlocks.length} REGISTERED ENTRIES]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeBlocks.map((block, idx) => {
                const isFull = block.featuredSpan === 'full';
                if (block.type === 'media_embed') {
                  return (
                    <div key={block.id} className={isFull ? 'md:col-span-2' : 'md:col-span-1'}>
                      {renderMediaBlock(block, idx)}
                    </div>
                  );
                }

                return (
                  <a
                    key={block.id}
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onRecordEvent('link_click', block.id, block.title)}
                    className={`group border ${theme.border} ${theme.surface} ${theme.surfaceHover} transition-all duration-150 flex flex-col justify-between ${
                      isFull ? 'md:col-span-2 sm:flex-row' : 'md:col-span-1'
                    }`}
                  >
                    {block.thumbnailUrl && (
                      <div
                        className={
                          isFull
                            ? 'sm:w-72 aspect-[16/10] sm:aspect-auto shrink-0 overflow-hidden border-b sm:border-b-0 sm:border-r border-inherit'
                            : 'w-full aspect-[16/10] overflow-hidden border-b border-inherit'
                        }
                      >
                        <SafeImage
                          src={block.thumbnailUrl}
                          alt={block.title}
                          fallbackTitle={block.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                        />
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className={`flex items-center justify-between gap-2 text-xs font-mono ${theme.textMuted} mb-2`}>
                          <span>
                            0{idx + 1} · {block.category} · {block.publishedDate}
                          </span>
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                        <h3 className={`page-display text-xl sm:text-2xl font-bold tracking-tight ${theme.textPrimary}`}>
                          {block.title}
                        </h3>
                        <p className={`mt-2 text-sm leading-relaxed ${theme.textSecondary}`}>
                          {block.subtitle}
                        </p>
                      </div>

                      <div className={`mt-5 pt-3 border-t ${theme.border} flex items-center justify-between text-xs font-mono ${theme.textMuted}`}>
                        <span className="truncate max-w-[260px]">
                          {block.url.replace(/^https?:\/\/(www\.)?/, '')}
                        </span>
                        <span className={`font-sans font-semibold ${theme.accentText} flex items-center gap-1`}>
                          Open Entry <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DESIGN 02: AVANT-GARDE KINETIC SHOWCASE (Syne + Urbanist)
         ===================================================================== */}
      {activeDesign === 'avant-kinetic' && (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
          {/* Panoramic Cover Banner with Overlapping Portrait & Bold Syne Display */}
          <div className="space-y-6">
            <div className={`relative h-56 sm:h-72 rounded-3xl overflow-hidden border ${theme.border}`}>
              <SafeImage
                src={profile.coverUrl}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex items-end p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shrink-0">
                      <SafeImage
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-white/80">
                        {profile.discipline} · @{profile.handle}
                      </div>
                      <h1 className="page-display text-3xl sm:text-5xl font-extrabold tracking-tight mt-1">
                        {profile.displayName}
                      </h1>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-white/85">
                    {profile.availabilityText}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <p className={`lg:col-span-7 text-base sm:text-lg leading-relaxed ${theme.textSecondary}`}>
                {profile.bio}
              </p>
              <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-2">
                {activeSocials.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      onRecordEvent('social_click', soc.id, `${soc.label} (${soc.handle})`)
                    }
                    className={`px-3.5 py-2 rounded-xl border ${theme.border} ${theme.surface} ${theme.surfaceHover} text-xs font-semibold flex items-center gap-2 transition-transform hover:-translate-y-0.5`}
                  >
                    <SocialPlatformSvg platform={soc.platform} />
                    <span>{soc.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Kinetic Link Rows */}
          <div className="space-y-4">
            {activeBlocks.map((block, idx) => {
              if (block.type === 'media_embed') {
                return (
                  <div key={block.id} className="rounded-2xl overflow-hidden">
                    {renderMediaBlock(block, idx)}
                  </div>
                );
              }

              return (
                <a
                  key={block.id}
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onRecordEvent('link_click', block.id, block.title)}
                  className={`group block rounded-2xl border ${theme.border} ${theme.surface} ${theme.surfaceHover} p-5 sm:p-6 transition-all duration-150`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-5 min-w-0">
                      {block.thumbnailUrl && (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0">
                          <SafeImage
                            src={block.thumbnailUrl}
                            alt={block.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className={`text-xs font-mono ${theme.textMuted} mb-1`}>
                          0{idx + 1} / {block.category} · {block.publishedDate}
                        </div>
                        <h3 className={`page-display text-xl sm:text-2xl font-bold tracking-tight ${theme.textPrimary}`}>
                          {block.title}
                        </h3>
                        <p className={`text-sm ${theme.textSecondary} mt-1 line-clamp-2`}>
                          {block.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-1 ${theme.buttonPrimary}`}>
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          DESIGN 03: THE EDITORIAL BROADSHEET (Fraunces + Public Sans)
         ===================================================================== */}
      {activeDesign === 'broadsheet-journal' && (
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
          {/* Newspaper / Periodical Masthead */}
          <div className={`border-y-2 ${theme.border} py-8 text-center space-y-4`}>
            <div className={`text-xs font-mono tracking-widest ${theme.textMuted}`}>
              {profile.discipline} · {profile.location} · @{profile.handle}
            </div>
            <h1 className={`page-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight ${theme.textPrimary}`}>
              {profile.displayName}
            </h1>
            <p className={`max-w-2xl mx-auto text-base sm:text-lg leading-relaxed ${theme.textSecondary}`}>
              {profile.bio}
            </p>
            <div className={`pt-4 flex flex-wrap items-center justify-center gap-4 text-xs ${theme.textSecondary}`}>
              {activeSocials.map((soc, idx) => (
                <React.Fragment key={soc.id}>
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <a
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      onRecordEvent('social_click', soc.id, `${soc.label} (${soc.handle})`)
                    }
                    className="inline-flex items-center gap-1.5 font-medium hover:underline"
                  >
                    <SocialPlatformSvg platform={soc.platform} />
                    <span>{soc.label}</span>
                  </a>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Broadsheet 2-Column Dispatch Layout */}
          <div className="space-y-8">
            {activeBlocks.map((block, idx) => {
              if (block.type === 'media_embed') {
                return <div key={block.id}>{renderMediaBlock(block, idx)}</div>;
              }

              return (
                <a
                  key={block.id}
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onRecordEvent('link_click', block.id, block.title)}
                  className={`group grid grid-cols-1 md:grid-cols-12 gap-6 pb-8 border-b ${theme.border} items-center`}
                >
                  <div className="md:col-span-7 space-y-2.5">
                    <div className={`text-xs font-mono ${theme.textMuted}`}>
                      Dispatch No. 0{idx + 1} · {block.category} · {block.publishedDate}
                    </div>
                    <h3 className={`page-display text-2xl sm:text-3xl font-bold leading-snug group-hover:underline ${theme.textPrimary}`}>
                      {block.title}
                    </h3>
                    <p className={`text-sm sm:text-base leading-relaxed ${theme.textSecondary}`}>
                      {block.subtitle}
                    </p>
                    <div className={`pt-2 inline-flex items-center gap-1.5 text-xs font-semibold ${theme.accentText}`}>
                      <span>Read Full Dispatch</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {block.thumbnailUrl && (
                    <div className="md:col-span-5 aspect-[16/10] overflow-hidden border border-black/10">
                      <SafeImage
                        src={block.thumbnailUrl}
                        alt={block.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      />
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          DESIGN 04: HAUTE COUTURE LOOKBOOK (Bodoni Moda + DM Sans)
         ===================================================================== */}
      {activeDesign === 'couture-salon' && (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
          {/* Centered Arch Medallion Portrait & Lookbook Header */}
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-5">
            <div className={`w-32 h-40 rounded-t-full overflow-hidden border ${theme.border} p-1.5 ${theme.surface}`}>
              <SafeImage
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-full h-full object-cover rounded-t-full"
              />
            </div>

            <div className={`text-xs tracking-widest uppercase ${theme.textMuted}`}>
              {profile.discipline}
            </div>

            <h1 className={`page-display text-4xl sm:text-6xl font-bold tracking-tight ${theme.textPrimary}`}>
              {profile.displayName}
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed ${theme.textSecondary}`}>
              {profile.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {activeSocials.map((soc) => (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    onRecordEvent('social_click', soc.id, `${soc.label} (${soc.handle})`)
                  }
                  className={`px-3.5 py-1.5 border ${theme.border} ${theme.surface} ${theme.surfaceHover} text-xs font-medium flex items-center gap-2`}
                >
                  <SocialPlatformSvg platform={soc.platform} />
                  <span>{soc.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Lookbook Exhibition Plates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeBlocks.map((block, idx) => {
              const isFull = block.featuredSpan === 'full';
              if (block.type === 'media_embed') {
                return (
                  <div key={block.id} className={isFull ? 'md:col-span-2' : 'md:col-span-1'}>
                    {renderMediaBlock(block, idx)}
                  </div>
                );
              }

              return (
                <a
                  key={block.id}
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onRecordEvent('link_click', block.id, block.title)}
                  className={`group border ${theme.border} ${theme.surface} p-6 flex flex-col justify-between transition-all ${
                    isFull ? 'md:col-span-2' : 'md:col-span-1'
                  }`}
                >
                  {block.thumbnailUrl && (
                    <div className="aspect-[16/9] w-full overflow-hidden mb-5">
                      <SafeImage
                        src={block.thumbnailUrl}
                        alt={block.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      />
                    </div>
                  )}
                  <div className="text-center max-w-xl mx-auto space-y-2">
                    <div className={`text-xs ${theme.textMuted}`}>
                      Plate 0{idx + 1} · {block.category} · {block.publishedDate}
                    </div>
                    <h3 className={`page-display text-2xl sm:text-3xl font-bold ${theme.textPrimary}`}>
                      {block.title}
                    </h3>
                    <p className={`text-sm ${theme.textSecondary}`}>{block.subtitle}</p>
                    <div className={`pt-3 inline-flex items-center gap-1 text-xs font-medium ${theme.textPrimary} underline underline-offset-4`}>
                      <span>View Plate</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Marquee Ribbon */}
      {profile.showMarquee && profile.marqueeText && (
        <div className={`border-y ${theme.border} py-2.5 overflow-hidden select-none`}>
          <div className={`animate-marquee text-xs font-mono tracking-wide ${theme.textMuted}`}>
            <span className="mx-6">{profile.marqueeText}</span>
            <span aria-hidden="true">·</span>
            <span className="mx-6">{profile.marqueeText}</span>
            <span aria-hidden="true">·</span>
            <span className="mx-6">{profile.marqueeText}</span>
            <span aria-hidden="true">·</span>
            <span className="mx-6">{profile.marqueeText}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`border-t ${theme.border} px-6 py-8`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className={theme.textMuted}>
            © {new Date().getFullYear()} {profile.displayName}. All rights reserved.
          </div>
          <div className={`flex items-center gap-3 font-mono ${theme.textMuted}`}>
            <span>Atelier Link Studio</span>
            {primaryDomain && (
              <>
                <span aria-hidden="true">/</span>
                <span>{primaryDomain}</span>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
