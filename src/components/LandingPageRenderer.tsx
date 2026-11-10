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
  Music,
  Film,
  BookOpen,
} from 'lucide-react';
import type {
  ProfileConfig,
  SocialProfile,
  ContentBlock,
  ThemePresetId,
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
  alabaster: {
    canvas: 'bg-[#FAF8F5] text-[#181615]',
    surface: 'bg-[#F3EFEA]',
    surfaceHover: 'hover:bg-[#EBE5DD]',
    border: 'border-[#E4DFD7]',
    textPrimary: 'text-[#181615]',
    textSecondary: 'text-[#4A4640]',
    textMuted: 'text-[#787269]',
    accentBg: 'bg-[#C84B31]',
    accentText: 'text-[#C84B31]',
    buttonPrimary: 'bg-[#181615] text-[#FAF8F5] hover:bg-[#2E2A28]',
  },
  monograph: {
    canvas: 'bg-[#FFFFFF] text-[#111111]',
    surface: 'bg-[#F7F7F5]',
    surfaceHover: 'hover:bg-[#EFEFEC]',
    border: 'border-[#E5E5E0]',
    textPrimary: 'text-[#111111]',
    textSecondary: 'text-[#40403E]',
    textMuted: 'text-[#73736E]',
    accentBg: 'bg-[#1D4ED8]',
    accentText: 'text-[#1D4ED8]',
    buttonPrimary: 'bg-[#111111] text-[#FFFFFF] hover:bg-[#292929]',
  },
  obsidian: {
    canvas: 'bg-[#0C0C0E] text-[#F4F1EA]',
    surface: 'bg-[#151519]',
    surfaceHover: 'hover:bg-[#1D1D22]',
    border: 'border-[#26262C]',
    textPrimary: 'text-[#F4F1EA]',
    textSecondary: 'text-[#B8B3A8]',
    textMuted: 'text-[#7E7970]',
    accentBg: 'bg-[#D96B43]',
    accentText: 'text-[#E07A5F]',
    buttonPrimary: 'bg-[#F4F1EA] text-[#0C0C0E] hover:bg-[#E2DDD2]',
  },
  travertine: {
    canvas: 'bg-[#F2ECE1] text-[#1E1B18]',
    surface: 'bg-[#E8E0D2]',
    surfaceHover: 'hover:bg-[#DFD5C4]',
    border: 'border-[#D5C9B6]',
    textPrimary: 'text-[#1E1B18]',
    textSecondary: 'text-[#4F4840]',
    textMuted: 'text-[#7A7064]',
    accentBg: 'bg-[#9E3B24]',
    accentText: 'text-[#9E3B24]',
    buttonPrimary: 'bg-[#1E1B18] text-[#F2ECE1] hover:bg-[#332E29]',
  },
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
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#E6E0D6] via-[#DCD4C6] to-[#CFC5B4] text-[#4A4640] p-6 text-center ${className || ''}`}
      >
        <BookOpen className="w-6 h-6 mb-2 opacity-60" />
        {fallbackTitle && (
          <span className="font-editorial text-sm italic line-clamp-2 max-w-[20ch]">
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

// Real Web Audio Studio Composition Player for Audio Media Blocks
function StudioAudioPlayer({
  block,
  theme,
  onPlayStart,
}: {
  block: ContentBlock;
  theme: (typeof THEME_STYLES)['alabaster'];
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

  // Warm ambient architectural chord progression (A minor 9 / Dorian intervals in Hz)
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
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.value = isMuted ? 0 : 0.7;
    masterGain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = masterGain;
    setIsPlaying(true);

    // Play initial note immediately
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
      gainNodeRef.current.gain.setValueAtTime(nextMuted ? 0 : 0.7, audioCtxRef.current.currentTime);
    }
  };

  const bars = [28, 52, 74, 42, 88, 64, 35, 78, 92, 50, 68, 44, 82, 58, 38, 72, 60, 48, 84, 54, 40, 66, 76, 45];

  return (
    <div className={`border ${theme.border} ${theme.surface} rounded-xl p-5 transition-colors`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
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

          <h3 className={`font-editorial text-xl font-semibold tracking-tight ${theme.textPrimary} truncate`}>
            {block.title}
          </h3>
          <p className={`text-sm ${theme.textSecondary} line-clamp-1 mt-0.5`}>
            {block.subtitle}
          </p>

          {/* Interactive harmonic bar visualizer */}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${theme.buttonPrimary}`}
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
                      height: `${isPlaying ? Math.max(20, (height + ((idx * stepRef.current * 13) % 35)) % 100) : height}%`,
                    }}
                    className={`flex-1 rounded-sm transition-all duration-150 ${
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
              className={`p-1.5 rounded-lg border ${theme.border} ${theme.textSecondary} hover:opacity-80 cursor-pointer`}
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
                <span>Open Stream</span>
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
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);

  const effectivePreset: ThemePresetId = profile.darkMode ? 'obsidian' : profile.themePreset;
  const theme = THEME_STYLES[effectivePreset] || THEME_STYLES.alabaster;

  const activeSocials = socials.filter((s) => s.enabled);
  const activeBlocks = blocks.filter((b) => b.enabled);

  const handleShareLink = () => {
    const shareUrl = primaryDomain ? `https://${primaryDomain}` : window.location.origin;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className={`min-h-full w-full transition-colors duration-200 ${theme.canvas}`}>
      {/* Subtle Top Editorial Utility Strip inside the Landing Page */}
      <div className={`border-b ${theme.border} px-6 py-3`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className={`flex items-center gap-2 ${theme.textMuted}`}>
            <span className="font-medium text-current">{profile.editionLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.location}</span>
            {primaryDomain && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{primaryDomain}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {profile.contactEmail && (
              <a
                href={`mailto:${profile.contactEmail}`}
                onClick={() => onRecordEvent('link_click', 'contact-email', `Email (${profile.contactEmail})`)}
                className={`flex items-center gap-1.5 ${theme.textSecondary} hover:underline whitespace-nowrap shrink-0`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Direct Inquiry</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleShareLink}
              className={`flex items-center gap-1.5 ${theme.textSecondary} hover:underline whitespace-nowrap shrink-0 cursor-pointer`}
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Page</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Header Section */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-8">
        {profile.layoutMode === 'editorial-split' && !isPreview ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between py-2">
              <div>
                <div className={`flex items-center gap-2 text-xs ${theme.textMuted} mb-4`}>
                  <span>{profile.discipline}</span>
                  <span aria-hidden="true">·</span>
                  <span>{profile.availabilityText}</span>
                </div>

                <h1
                  className={`font-editorial text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.06] ${theme.textPrimary}`}
                  style={{ textWrap: 'balance' }}
                >
                  {profile.displayName}
                </h1>

                <p className={`mt-4 text-base sm:text-lg leading-relaxed max-w-[60ch] ${theme.textSecondary}`}>
                  {profile.bio}
                </p>
              </div>

              {/* Unified Social Media Icon Bar & Profile Handles */}
              {activeSocials.length > 0 && (
                <div className={`mt-8 pt-6 border-t ${theme.border}`}>
                  <div className={`text-xs ${theme.textMuted} mb-3`}>
                    Verified Profiles & Channels
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {activeSocials.map((soc) => (
                      <a
                        key={soc.id}
                        href={soc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onRecordEvent('social_click', soc.id, `${soc.label} (${soc.handle})`)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border ${theme.border} ${theme.surface} ${theme.surfaceHover} text-xs font-medium ${theme.textPrimary} transition-colors whitespace-nowrap shrink-0`}
                      >
                        <SocialPlatformSvg platform={soc.platform} />
                        <span>{soc.label}</span>
                        <span className={`font-mono text-[11px] ${theme.textMuted}`}>{soc.handle}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <div className={`relative h-full min-h-[300px] rounded-2xl overflow-hidden border ${theme.border}`}>
                <SafeImage
                  src={profile.coverUrl}
                  alt={profile.displayName}
                  fallbackTitle={profile.displayName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-5">
                  <div className="flex items-center gap-3.5 text-white">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/80 shrink-0">
                      <SafeImage
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-editorial text-xl font-semibold leading-tight">
                        {profile.displayName}
                      </div>
                      <div className="text-xs text-white/80 font-mono">@{profile.handle}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Centered / Monograph Profile Header */
          <div className="space-y-6">
            <div className={`relative h-48 sm:h-60 rounded-2xl overflow-hidden border ${theme.border}`}>
              <SafeImage
                src={profile.coverUrl}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/90 shrink-0 shadow-md">
                    <SafeImage
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-white/80 mb-0.5">
                      {profile.discipline} · @{profile.handle}
                    </div>
                    <h1 className="font-editorial text-2xl sm:text-4xl font-semibold tracking-tight">
                      {profile.displayName}
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <p className={`text-sm sm:text-base leading-relaxed max-w-[65ch] ${theme.textSecondary}`}>
                {profile.bio}
              </p>
              <div className={`text-xs ${theme.textMuted} shrink-0`}>
                {profile.availabilityText}
              </div>
            </div>

            {activeSocials.length > 0 && (
              <div className={`pt-4 border-t ${theme.border} flex flex-wrap items-center gap-2`}>
                {activeSocials.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onRecordEvent('social_click', soc.id, `${soc.label} (${soc.handle})`)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${theme.border} ${theme.surface} ${theme.surfaceHover} text-xs font-medium ${theme.textPrimary} transition-colors whitespace-nowrap shrink-0`}
                  >
                    <SocialPlatformSvg platform={soc.platform} />
                    <span>{soc.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optional Subtle Editorial Marquee Divider */}
      {profile.showMarquee && profile.marqueeText && (
        <div className={`border-y ${theme.border} py-2.5 overflow-hidden select-none`}>
          <div className={`animate-marquee text-xs tracking-wide ${theme.textMuted}`}>
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

      {/* Curated Content Blocks Grid (Featured Links + Rich Media Embeds) */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className={`font-editorial text-2xl sm:text-3xl font-semibold ${theme.textPrimary}`}>
            01. Selected Links, Publications & Media
          </h2>
          <span className={`text-xs font-mono tabular-nums ${theme.textMuted}`}>
            {activeBlocks.length} {activeBlocks.length === 1 ? 'Entry' : 'Entries'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeBlocks.map((block) => {
            const isFullSpan =
              profile.layoutMode === 'monograph-column' || block.featuredSpan === 'full';

            if (block.type === 'media_embed') {
              return (
                <div
                  key={block.id}
                  className={isFullSpan ? 'md:col-span-2' : 'md:col-span-1'}
                >
                  {block.mediaKind === 'audio_studio' ? (
                    <StudioAudioPlayer
                      block={block}
                      theme={theme}
                      onPlayStart={() => onRecordEvent('media_play', block.id, block.title)}
                    />
                  ) : (
                    /* Rich Video / Spotify / External Media Embed Card */
                    <div className={`border ${theme.border} ${theme.surface} rounded-xl overflow-hidden`}>
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className={`flex items-center gap-2 text-xs ${theme.textMuted} mb-1`}>
                            <Film className="w-3.5 h-3.5" />
                            <span>{block.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{block.publishedDate}</span>
                            {block.durationLabel && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{block.durationLabel}</span>
                              </>
                            )}
                          </div>
                          <h3 className={`font-editorial text-xl font-semibold ${theme.textPrimary}`}>
                            {block.title}
                          </h3>
                          <p className={`text-sm ${theme.textSecondary} mt-0.5`}>
                            {block.subtitle}
                          </p>
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
                              className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${theme.buttonPrimary}`}
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
                            className={`px-3.5 py-2 rounded-lg border ${theme.border} text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 ${theme.textPrimary} hover:opacity-80`}
                          >
                            <span>Direct Link</span>
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
                  )}
                </div>
              );
            }

            // Standard Featured Link Card with Custom Thumbnail & Unboxed Editorial Metadata
            return (
              <a
                key={block.id}
                href={block.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onRecordEvent('link_click', block.id, block.title)}
                className={`group block border ${theme.border} ${theme.surface} ${theme.surfaceHover} rounded-xl overflow-hidden transition-all duration-150 ${
                  isFullSpan ? 'md:col-span-2' : 'md:col-span-1'
                }`}
              >
                <div
                  className={`flex flex-col ${
                    isFullSpan && block.thumbnailUrl ? 'sm:flex-row sm:items-stretch' : ''
                  }`}
                >
                  {block.thumbnailUrl && (
                    <div
                      className={
                        isFullSpan
                          ? 'sm:w-64 md:w-72 aspect-[16/10] sm:aspect-auto shrink-0 overflow-hidden'
                          : 'w-full aspect-[16/10] overflow-hidden'
                      }
                    >
                      <SafeImage
                        src={block.thumbnailUrl}
                        alt={block.title}
                        fallbackTitle={block.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Clean Unboxed Metadata with Middot Separators (Zero-Pill Discipline) */}
                      <div className={`flex items-center justify-between gap-2 text-xs ${theme.textMuted} mb-2`}>
                        <div className="flex items-center gap-2">
                          <span>{block.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{block.publishedDate}</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                      </div>

                      <h3
                        className={`font-editorial text-xl sm:text-2xl font-semibold tracking-tight ${theme.textPrimary}`}
                      >
                        {block.title}
                      </h3>

                      <p className={`mt-1.5 text-sm leading-relaxed ${theme.textSecondary}`}>
                        {block.subtitle}
                      </p>
                    </div>

                    <div className={`mt-4 pt-3 border-t ${theme.border} flex items-center justify-between text-xs ${theme.textMuted}`}>
                      <span className="truncate max-w-[260px]">
                        {block.url.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                      <span className={`font-medium ${theme.textPrimary} flex items-center gap-1`}>
                        Explore <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Quiet Editorial Footer */}
      <footer className={`border-t ${theme.border} px-6 py-8 mt-8`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className={theme.textMuted}>
            © {new Date().getFullYear()} {profile.displayName}. All rights reserved.
          </div>
          <div className={`flex items-center gap-3 ${theme.textMuted}`}>
            <span>Curated with Atelier Link</span>
            {primaryDomain && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{primaryDomain}</span>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
