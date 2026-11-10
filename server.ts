import express from 'express';
import fs from 'fs';
import path from 'path';
import dns from 'dns/promises';
import tls from 'tls';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type {
  AppState,
  CustomDomainRecord,
  DiagnosticReportItem,
  AnalyticsEvent,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'atelier_store.json');

function createInitialEvents(): AnalyticsEvent[] {
  const now = Date.now();
  const dayMs = 86400000;
  const events: AnalyticsEvent[] = [];

  const referrers = ['Direct', 'Instagram', 'X / Twitter', 'Substack', 'LinkedIn', 'GitHub'];
  const devices: Array<'Desktop' | 'Mobile' | 'Tablet'> = ['Desktop', 'Mobile', 'Mobile', 'Desktop', 'Tablet'];
  const regions = ['Zurich, CH', 'London, UK', 'New York, US', 'Tokyo, JP', 'Berlin, DE', 'Milan, IT'];

  const targets = [
    { id: 'blk-monograph', title: 'Architectural Monograph Vol. IV — Print & Digital Edition', type: 'link_click' as const },
    { id: 'blk-exhibition', title: 'Autumn Residency: Form & Materiality at Kunsthalle', type: 'link_click' as const },
    { id: 'blk-audio-session', title: 'Modular Studies in Stone & Brass (Studio Session)', type: 'media_play' as const },
    { id: 'blk-video-reel', title: 'Architectural Light & Acoustic Space — Short Film', type: 'media_play' as const },
    { id: 'blk-journal', title: 'Notes on Quiet Interfaces & Editorial Craft', type: 'link_click' as const },
  ];

  // Generate 14 days of realistic baseline events so time-series charts and tables are immediately rich
  for (let d = 13; d >= 0; d--) {
    const viewsCount = 14 + ((d * 5) % 11);
    for (let v = 0; v < viewsCount; v++) {
      const ts = new Date(now - d * dayMs - v * 1800000).toISOString();
      events.push({
        id: `evt-pv-${d}-${v}`,
        timestamp: ts,
        type: 'page_view',
        referrer: referrers[(d + v) % referrers.length],
        device: devices[(d + v) % devices.length],
        region: regions[(d + v) % regions.length],
      });
    }

    const clicksCount = 7 + ((d * 3) % 7);
    for (let c = 0; c < clicksCount; c++) {
      const target = targets[(d + c) % targets.length];
      const ts = new Date(now - d * dayMs - c * 2400000).toISOString();
      events.push({
        id: `evt-clk-${d}-${c}`,
        timestamp: ts,
        type: target.type,
        targetId: target.id,
        targetTitle: target.title,
        referrer: referrers[(d + c) % referrers.length],
        device: devices[(d + c) % devices.length],
        region: regions[(d + c) % regions.length],
      });
    }
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const DEFAULT_STATE: AppState = {
  profile: {
    displayName: 'Elena Rostova',
    handle: 'elenarostova',
    discipline: 'Architectural Designer & Sound Artist',
    location: 'Zurich · Milan',
    bio: 'Exploring tactile minimalism across spatial architecture, acoustic sculpture, and printed monographs. Founder of Atelier Rostova.',
    avatarUrl: '/src/assets/images/avatar_editorial_portrait_1794161554147.jpg',
    coverUrl: '/src/assets/images/cover_atelier_architecture_1794161554142.jpg',
    themePreset: 'alabaster',
    layoutMode: 'editorial-split',
    darkMode: false,
    showMarquee: true,
    marqueeText: 'Selected Works · Spatial Architecture · Monograph Vol. IV · Acoustic Installations · Custom Commissions',
    editionLabel: '2026 Catalogue',
    availabilityText: 'Open for Q4 Commissions & Exhibitions',
    contactEmail: 'studio@elenarostova.ch',
  },
  socials: [
    {
      id: 'soc-ig',
      platform: 'instagram',
      label: 'Instagram',
      handle: '@elenarostova.studio',
      url: 'https://instagram.com',
      enabled: true,
      clicks: 84,
    },
    {
      id: 'soc-x',
      platform: 'x',
      label: 'X',
      handle: '@elenarostova',
      url: 'https://x.com',
      enabled: true,
      clicks: 52,
    },
    {
      id: 'soc-yt',
      platform: 'youtube',
      label: 'YouTube',
      handle: 'Atelier Rostova Film',
      url: 'https://www.youtube.com',
      enabled: true,
      clicks: 69,
    },
    {
      id: 'soc-sp',
      platform: 'spotify',
      label: 'Spotify',
      handle: 'Elena Rostova Ensemble',
      url: 'https://open.spotify.com',
      enabled: true,
      clicks: 47,
    },
    {
      id: 'soc-gh',
      platform: 'github',
      label: 'GitHub',
      handle: 'github.com/erostova',
      url: 'https://github.com',
      enabled: true,
      clicks: 38,
    },
    {
      id: 'soc-li',
      platform: 'linkedin',
      label: 'LinkedIn',
      handle: 'in/elena-rostova',
      url: 'https://www.linkedin.com',
      enabled: true,
      clicks: 41,
    },
  ],
  blocks: [
    {
      id: 'blk-monograph',
      type: 'featured_link',
      title: 'Architectural Monograph Vol. IV — Print & Digital Edition',
      subtitle: 'Hardcover 280-page linen-bound study on travertine, raw timber, and acoustic shadow.',
      category: 'Publication',
      publishedDate: 'Autumn 2026',
      url: 'https://en.wikipedia.org/wiki/Architectural_theory',
      thumbnailUrl: '/src/assets/images/thumb_monograph_book_1794161555548.jpg',
      featuredSpan: 'full',
      enabled: true,
      clicks: 142,
    },
    {
      id: 'blk-exhibition',
      type: 'featured_link',
      title: 'Autumn Residency: Form & Materiality at Kunsthalle',
      subtitle: 'Private viewing reservations, exhibition catalogue notes, and spatial floorplan.',
      category: 'Exhibition',
      publishedDate: 'November 2026',
      url: 'https://en.wikipedia.org/wiki/Minimalism',
      thumbnailUrl: '/src/assets/images/thumb_exhibition_gallery_1794161555364.jpg',
      featuredSpan: 'half',
      enabled: true,
      clicks: 98,
    },
    {
      id: 'blk-journal',
      type: 'featured_link',
      title: 'Notes on Quiet Interfaces & Editorial Craft',
      subtitle: 'Monthly essay dispatch examining typography, physical materials, and spatial calm.',
      category: 'Editorial Dispatch',
      publishedDate: 'Issue No. 18',
      url: 'https://en.wikipedia.org/wiki/Swiss_Style_(design)',
      thumbnailUrl: '/src/assets/images/cover_atelier_architecture_1794161554142.jpg',
      featuredSpan: 'half',
      enabled: true,
      clicks: 76,
    },
    {
      id: 'blk-audio-session',
      type: 'media_embed',
      title: 'Modular Studies in Stone & Brass (Studio Session)',
      subtitle: 'Live 4-voice polyphonic Buchla & acoustic resonance study recorded in Zurich.',
      category: 'Audio Embed',
      publishedDate: '04:18 Master',
      url: 'https://open.spotify.com',
      thumbnailUrl: '/src/assets/images/thumb_acoustic_session_1794161557011.jpg',
      featuredSpan: 'full',
      mediaKind: 'audio_studio',
      durationLabel: '04:18',
      composerCredits: 'Composed & Recorded at Atelier Zurich · 48kHz / 24-bit',
      enabled: true,
      clicks: 114,
    },
    {
      id: 'blk-video-reel',
      type: 'media_embed',
      title: 'Architectural Light & Acoustic Space — Short Film',
      subtitle: '16mm documentary study on natural light movement across limestone interiors.',
      category: 'Video Embed',
      publishedDate: 'HD Monograph Reel',
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      mediaKind: 'youtube',
      mediaEmbedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
      thumbnailUrl: '/src/assets/images/cover_atelier_architecture_1794161554142.jpg',
      featuredSpan: 'full',
      durationLabel: 'Live Stream / Video',
      composerCredits: 'Cinematography by Atelier Film Unit',
      enabled: true,
      clicks: 89,
    },
  ],
  analyticsWidgets: [
    {
      id: 'kpi_summary',
      title: '01. Engagement Summary & Conversion',
      subtitle: 'Total views, link clicks, click-through rate, and active blocks',
      colSpan: 2,
      visible: true,
    },
    {
      id: 'traffic_timeline',
      title: '02. Daily Views & Link Attribution Velocity',
      subtitle: 'Day-by-day comparison of landing page impressions versus outbound clicks',
      colSpan: 2,
      visible: true,
    },
    {
      id: 'top_links',
      title: '03. Content Block & Link Performance',
      subtitle: 'Ranked click volume and share of engagement by block',
      colSpan: 1,
      visible: true,
    },
    {
      id: 'referrer_sources',
      title: '04. Inbound Referrer Channels',
      subtitle: 'Traffic origin breakdown across social and direct visits',
      colSpan: 1,
      visible: true,
    },
    {
      id: 'device_distribution',
      title: '05. Viewport & Regional Telemetry',
      subtitle: 'Visitor distribution across desktop, mobile, and top cities',
      colSpan: 1,
      visible: true,
    },
    {
      id: 'event_stream',
      title: '06. Live Attribution Event Ledger',
      subtitle: 'Chronological stream of real visitor interactions recorded on your page',
      colSpan: 1,
      visible: true,
    },
  ],
  events: createInitialEvents(),
  domains: [
    {
      id: 'dom-example-1',
      domain: 'example.com',
      isPrimary: true,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      lastCheckedAt: null,
      expectedRecordType: 'A',
      expectedTarget: '76.76.21.21',
      txtVerificationName: '_atelier-verify.example.com',
      txtVerificationValue: 'atelier-site-verification=9f8a7d6c5b4e3f2a1',
      dnsStatus: 'unverified',
      resolvedA: [],
      resolvedAAAA: [],
      resolvedCname: [],
      resolvedTxt: [],
      resolvedNs: [],
      dnsLookupLatencyMs: null,
      sslStatus: 'missing',
      sslIssuer: null,
      sslSubject: null,
      sslValidFrom: null,
      sslValidTo: null,
      sslProtocol: null,
      sslFingerprint: null,
      diagnosticMessage: 'Click "Verify DNS & SSL" to execute a real-time DNS and TLS certificate lookup.',
    },
  ],
  redirects: [
    {
      id: 'red-1',
      sourcePath: '/monograph',
      destinationUrl: 'https://en.wikipedia.org/wiki/Architectural_theory',
      statusCode: 301,
      preserveQuery: true,
      enabled: true,
      hits: 34,
    },
    {
      id: 'red-2',
      sourcePath: '/exhibition-rsvp',
      destinationUrl: 'https://en.wikipedia.org/wiki/Minimalism',
      statusCode: 302,
      preserveQuery: true,
      enabled: true,
      hits: 19,
    },
  ],
  diagnostics: [],
  lastDiagnosticRunAt: null,
};

function loadState(): AppState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (err) {
    console.error('Failed to read store, initializing default state:', err);
  }
  saveState(DEFAULT_STATE);
  return DEFAULT_STATE;
}

function saveState(state: AppState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store:', err);
  }
}

let appState: AppState = loadState();

// Real TLS certificate inspection via Node tls.connect
function inspectTlsCertificate(hostname: string, timeoutMs = 4500): Promise<{
  sslStatus: 'active' | 'missing' | 'expired';
  sslIssuer: string | null;
  sslSubject: string | null;
  sslValidFrom: string | null;
  sslValidTo: string | null;
  sslProtocol: string | null;
  sslFingerprint: string | null;
}> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: {
      sslStatus: 'active' | 'missing' | 'expired';
      sslIssuer: string | null;
      sslSubject: string | null;
      sslValidFrom: string | null;
      sslValidTo: string | null;
      sslProtocol: string | null;
      sslFingerprint: string | null;
    }) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    try {
      const socket = tls.connect(
        {
          host: hostname,
          port: 443,
          servername: hostname,
          rejectUnauthorized: false,
          timeout: timeoutMs,
        },
        () => {
          try {
            const cert = socket.getPeerCertificate();
            const protocol = socket.getProtocol() || 'TLSv1.3';
            socket.end();

            if (!cert || Object.keys(cert).length === 0) {
              return finish({
                sslStatus: 'missing',
                sslIssuer: null,
                sslSubject: null,
                sslValidFrom: null,
                sslValidTo: null,
                sslProtocol: null,
                sslFingerprint: null,
              });
            }

            const validToDate = cert.valid_to ? new Date(cert.valid_to) : null;
            const isExpired = validToDate ? validToDate.getTime() < Date.now() : false;
            const issuerOrg =
              cert.issuer?.O || cert.issuer?.CN || 'Public Certificate Authority';
            const subjectCn = cert.subject?.CN || hostname;

            finish({
              sslStatus: isExpired ? 'expired' : 'active',
              sslIssuer: String(issuerOrg),
              sslSubject: String(subjectCn),
              sslValidFrom: cert.valid_from || null,
              sslValidTo: cert.valid_to || null,
              sslProtocol: protocol,
              sslFingerprint: cert.fingerprint256 || null,
            });
          } catch {
            socket.destroy();
            finish({
              sslStatus: 'missing',
              sslIssuer: null,
              sslSubject: null,
              sslValidFrom: null,
              sslValidTo: null,
              sslProtocol: null,
              sslFingerprint: null,
            });
          }
        }
      );

      socket.on('timeout', () => {
        socket.destroy();
        finish({
          sslStatus: 'missing',
          sslIssuer: null,
          sslSubject: null,
          sslValidFrom: null,
          sslValidTo: null,
          sslProtocol: null,
          sslFingerprint: null,
        });
      });

      socket.on('error', () => {
        socket.destroy();
        finish({
          sslStatus: 'missing',
          sslIssuer: null,
          sslSubject: null,
          sslValidFrom: null,
          sslValidTo: null,
          sslProtocol: null,
          sslFingerprint: null,
        });
      });
    } catch {
      finish({
        sslStatus: 'missing',
        sslIssuer: null,
        sslSubject: null,
        sslValidFrom: null,
        sslValidTo: null,
        sslProtocol: null,
        sslFingerprint: null,
      });
    }
  });
}

// Perform real DNS + TLS lookup for any hostname
async function performLiveDomainCheck(hostname: string) {
  const cleanHost = hostname
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');

  const startTime = Date.now();

  const [aRes, aaaaRes, cnameRes, txtRes, nsRes, tlsInfo] = await Promise.all([
    dns.resolve4(cleanHost).catch(() => [] as string[]),
    dns.resolve6(cleanHost).catch(() => [] as string[]),
    dns.resolveCname(cleanHost).catch(() => [] as string[]),
    dns
      .resolveTxt(cleanHost)
      .then((records) => records.map((r) => r.join('')))
      .catch(() => [] as string[]),
    dns.resolveNs(cleanHost).catch(() => [] as string[]),
    inspectTlsCertificate(cleanHost),
  ]);

  const latencyMs = Date.now() - startTime;
  const hasAnyDns =
    aRes.length > 0 || aaaaRes.length > 0 || cnameRes.length > 0 || nsRes.length > 0;

  let diagnosticMessage = '';
  if (hasAnyDns && tlsInfo.sslStatus === 'active') {
    diagnosticMessage = `DNS resolved (${aRes.length} A, ${cnameRes.length} CNAME) in ${latencyMs}ms. Active ${tlsInfo.sslProtocol} certificate issued by ${tlsInfo.sslIssuer}.`;
  } else if (hasAnyDns) {
    diagnosticMessage = `DNS records resolved (${aRes.join(', ') || cnameRes.join(', ')}) in ${latencyMs}ms, but port 443 TLS handshake did not return an active certificate.`;
  } else {
    diagnosticMessage = `No public A or CNAME records resolved for ${cleanHost} yet (${latencyMs}ms). Add the required DNS records at your registrar and re-verify.`;
  }

  return {
    cleanHost,
    resolvedA: aRes,
    resolvedAAAA: aaaaRes,
    resolvedCname: cnameRes,
    resolvedTxt: txtRes.slice(0, 8),
    resolvedNs: nsRes,
    dnsLookupLatencyMs: latencyMs,
    dnsStatus: hasAnyDns ? ('verified' as const) : ('pending_dns' as const),
    ...tlsInfo,
    diagnosticMessage,
  };
}

// Perform a real HTTP HEAD/GET check on a URL for the Daily Error & Bug Checker
function checkUrlReachability(targetUrl: string, timeoutMs = 4000): Promise<{
  ok: boolean;
  statusCode: number | null;
  latencyMs: number;
  detail: string;
}> {
  return new Promise((resolve) => {
    const start = Date.now();
    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return resolve({
        ok: false,
        statusCode: null,
        latencyMs: 0,
        detail: 'Malformed URL syntax (missing https:// protocol or valid hostname).',
      });
    }

    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.request(
      parsed,
      {
        method: 'HEAD',
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'AtelierLink-HealthVerifier/1.0',
          Accept: '*/*',
        },
      },
      (res) => {
        const latencyMs = Date.now() - start;
        const code = res.statusCode || 200;
        res.resume();
        // Treat 2xx, 3xx, and 403/405 (some social networks block HEAD requests with 403/405 even when live) as reachable
        const reachable = code >= 200 && code < 400 || code === 403 || code === 405 || code === 429;
        resolve({
          ok: reachable,
          statusCode: code,
          latencyMs,
          detail: reachable
            ? `Endpoint reachable (HTTP ${code}) in ${latencyMs}ms.`
            : `Endpoint returned HTTP ${code} (${latencyMs}ms).`,
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({
        ok: false,
        statusCode: null,
        latencyMs: Date.now() - start,
        detail: `Connection timed out after ${timeoutMs}ms.`,
      });
    });

    req.on('error', (err) => {
      resolve({
        ok: false,
        statusCode: null,
        latencyMs: Date.now() - start,
        detail: `Network resolution error: ${err.message}`,
      });
    });

    req.end();
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // 1. Get complete application state
  app.get('/api/state', (_req, res) => {
    res.json(appState);
  });

  // 2. Update profile & appearance settings
  app.put('/api/profile', (req, res) => {
    appState.profile = {
      ...appState.profile,
      ...req.body,
    };
    saveState(appState);
    res.json({ profile: appState.profile });
  });

  // 3. Update content blocks (including drag-and-drop reordering, adding, editing, deleting)
  app.put('/api/blocks', (req, res) => {
    if (Array.isArray(req.body.blocks)) {
      appState.blocks = req.body.blocks;
      saveState(appState);
    }
    res.json({ blocks: appState.blocks });
  });

  // 4. Update social profiles
  app.put('/api/socials', (req, res) => {
    if (Array.isArray(req.body.socials)) {
      appState.socials = req.body.socials;
      saveState(appState);
    }
    res.json({ socials: appState.socials });
  });

  // 5. Update drag-and-drop analytics widget layout
  app.put('/api/analytics/layout', (req, res) => {
    if (Array.isArray(req.body.analyticsWidgets)) {
      appState.analyticsWidgets = req.body.analyticsWidgets;
      saveState(appState);
    }
    res.json({ analyticsWidgets: appState.analyticsWidgets });
  });

  // 6. Record a real visitor telemetry event (page_view, link_click, social_click, media_play)
  app.post('/api/analytics/event', (req, res) => {
    const { type, targetId, targetTitle, referrer, device, region } = req.body;
    const newEvent: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      type: type || 'link_click',
      targetId,
      targetTitle,
      referrer: referrer || 'Direct',
      device: device || 'Desktop',
      region: region || 'Local Session',
    };

    appState.events.unshift(newEvent);
    if (appState.events.length > 1000) {
      appState.events = appState.events.slice(0, 1000);
    }

    if (targetId) {
      const blk = appState.blocks.find((b) => b.id === targetId);
      if (blk) {
        blk.clicks = (blk.clicks || 0) + 1;
      }
      const soc = appState.socials.find((s) => s.id === targetId);
      if (soc) {
        soc.clicks = (soc.clicks || 0) + 1;
      }
    }

    saveState(appState);
    res.json({ event: newEvent, blocks: appState.blocks, socials: appState.socials });
  });

  // 7. Add a custom domain and immediately run a real DNS/SSL check
  app.post('/api/domains', async (req, res) => {
    const rawDomain = String(req.body.domain || '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '');

    if (!rawDomain || !rawDomain.includes('.')) {
      return res.status(400).json({ error: 'Please enter a valid domain name (e.g., studio.yourdomain.com).' });
    }

    const exists = appState.domains.find((d) => d.domain === rawDomain);
    if (exists) {
      return res.status(400).json({ error: 'This domain is already registered in your workspace.' });
    }

    const parts = rawDomain.split('.');
    const isSubdomain = parts.length > 2;
    const token = Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 8);

    const liveResult = await performLiveDomainCheck(rawDomain);

    const newDomain: CustomDomainRecord = {
      id: `dom-${Date.now()}`,
      domain: rawDomain,
      isPrimary: appState.domains.length === 0,
      createdAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
      expectedRecordType: isSubdomain ? 'CNAME' : 'A',
      expectedTarget: isSubdomain ? 'cname.atelier-link.app' : '76.76.21.21',
      txtVerificationName: `_atelier-verify.${rawDomain}`,
      txtVerificationValue: `atelier-site-verification=${token}`,
      dnsStatus: liveResult.dnsStatus,
      resolvedA: liveResult.resolvedA,
      resolvedAAAA: liveResult.resolvedAAAA,
      resolvedCname: liveResult.resolvedCname,
      resolvedTxt: liveResult.resolvedTxt,
      resolvedNs: liveResult.resolvedNs,
      dnsLookupLatencyMs: liveResult.dnsLookupLatencyMs,
      sslStatus: liveResult.sslStatus,
      sslIssuer: liveResult.sslIssuer,
      sslSubject: liveResult.sslSubject,
      sslValidFrom: liveResult.sslValidFrom,
      sslValidTo: liveResult.sslValidTo,
      sslProtocol: liveResult.sslProtocol,
      sslFingerprint: liveResult.sslFingerprint,
      diagnosticMessage: liveResult.diagnosticMessage,
    };

    appState.domains.unshift(newDomain);
    saveState(appState);
    res.json({ domain: newDomain, domains: appState.domains });
  });

  // 8. Verify an existing domain's live DNS & SSL status
  app.post('/api/domains/:id/verify', async (req, res) => {
    const dom = appState.domains.find((d) => d.id === req.params.id);
    if (!dom) {
      return res.status(404).json({ error: 'Domain not found.' });
    }

    const liveResult = await performLiveDomainCheck(dom.domain);
    dom.lastCheckedAt = new Date().toISOString();
    dom.dnsStatus = liveResult.dnsStatus;
    dom.resolvedA = liveResult.resolvedA;
    dom.resolvedAAAA = liveResult.resolvedAAAA;
    dom.resolvedCname = liveResult.resolvedCname;
    dom.resolvedTxt = liveResult.resolvedTxt;
    dom.resolvedNs = liveResult.resolvedNs;
    dom.dnsLookupLatencyMs = liveResult.dnsLookupLatencyMs;
    dom.sslStatus = liveResult.sslStatus;
    dom.sslIssuer = liveResult.sslIssuer;
    dom.sslSubject = liveResult.sslSubject;
    dom.sslValidFrom = liveResult.sslValidFrom;
    dom.sslValidTo = liveResult.sslValidTo;
    dom.sslProtocol = liveResult.sslProtocol;
    dom.sslFingerprint = liveResult.sslFingerprint;
    dom.diagnosticMessage = liveResult.diagnosticMessage;

    saveState(appState);
    res.json({ domain: dom, domains: appState.domains });
  });

  // 9. Set primary canonical domain
  app.put('/api/domains/:id/primary', (req, res) => {
    const target = appState.domains.find((d) => d.id === req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'Domain not found.' });
    }
    appState.domains.forEach((d) => {
      d.isPrimary = d.id === target.id;
    });
    saveState(appState);
    res.json({ domains: appState.domains });
  });

  // 10. Delete custom domain
  app.delete('/api/domains/:id', (req, res) => {
    appState.domains = appState.domains.filter((d) => d.id !== req.params.id);
    if (appState.domains.length > 0 && !appState.domains.some((d) => d.isPrimary)) {
      appState.domains[0].isPrimary = true;
    }
    saveState(appState);
    res.json({ domains: appState.domains });
  });

  // 11. Redirect rules CRUD
  app.put('/api/redirects', (req, res) => {
    if (Array.isArray(req.body.redirects)) {
      appState.redirects = req.body.redirects;
      saveState(appState);
    }
    res.json({ redirects: appState.redirects });
  });

  // 12. Daily Error & Health Check Engine (verifies all links, socials, media embeds, domains, and auto-resolves common URL/protocol issues)
  app.post('/api/diagnostics/run', async (req, res) => {
    const autoFix = Boolean(req.body?.autoResolve);
    const results: DiagnosticReportItem[] = [];
    const nowIso = new Date().toISOString();

    // Check all content blocks
    for (const block of appState.blocks) {
      let targetUrl = (block.url || '').trim();
      let resolutionNote: string | undefined;
      let status: DiagnosticReportItem['status'] = 'healthy';

      // Detect missing protocol or whitespace issues
      if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
        if (autoFix) {
          targetUrl = `https://${targetUrl.replace(/^\/+/, '')}`;
          block.url = targetUrl;
          resolutionNote = `Normalized missing HTTPS protocol -> ${targetUrl}`;
          status = 'auto_resolved';
        } else {
          results.push({
            id: `diag-blk-${block.id}`,
            checkedAt: nowIso,
            targetType: block.type === 'media_embed' ? 'media' : 'link',
            targetId: block.id,
            targetName: block.title,
            targetUrl: block.url || '(empty)',
            status: 'issue_detected',
            httpStatusCode: null,
            latencyMs: 0,
            detail: 'URL is missing https:// protocol prefix.',
          });
          continue;
        }
      }

      // If YouTube watch URL is used in mediaEmbedUrl instead of /embed/, fix it automatically on autoFix
      if (
        block.type === 'media_embed' &&
        block.mediaKind === 'youtube' &&
        block.mediaEmbedUrl &&
        block.mediaEmbedUrl.includes('watch?v=')
      ) {
        if (autoFix) {
          const videoId = block.mediaEmbedUrl.split('watch?v=')[1]?.split('&')[0];
          if (videoId) {
            block.mediaEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
            resolutionNote = `Converted YouTube watch URL to embeddable endpoint (${block.mediaEmbedUrl}).`;
            status = 'auto_resolved';
          }
        } else {
          results.push({
            id: `diag-blk-embed-${block.id}`,
            checkedAt: nowIso,
            targetType: 'media',
            targetId: block.id,
            targetName: block.title,
            targetUrl: block.mediaEmbedUrl,
            status: 'issue_detected',
            httpStatusCode: null,
            latencyMs: 0,
            detail: 'YouTube embed URL uses /watch?v= instead of /embed/ format.',
          });
          continue;
        }
      }

      const probe = await checkUrlReachability(targetUrl);
      if (!probe.ok && !resolutionNote) {
        status = 'issue_detected';
      }

      results.push({
        id: `diag-blk-${block.id}`,
        checkedAt: nowIso,
        targetType: block.type === 'media_embed' ? 'media' : 'link',
        targetId: block.id,
        targetName: block.title,
        targetUrl,
        status,
        httpStatusCode: probe.statusCode,
        latencyMs: probe.latencyMs,
        detail: probe.detail,
        resolutionNote,
      });
    }

    // Check all enabled social profiles
    for (const soc of appState.socials.filter((s) => s.enabled)) {
      let targetUrl = (soc.url || '').trim();
      let resolutionNote: string | undefined;
      let status: DiagnosticReportItem['status'] = 'healthy';

      if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
        if (autoFix) {
          targetUrl = `https://${targetUrl.replace(/^\/+/, '')}`;
          soc.url = targetUrl;
          resolutionNote = `Added missing https:// protocol to ${soc.label} profile URL.`;
          status = 'auto_resolved';
        } else {
          results.push({
            id: `diag-soc-${soc.id}`,
            checkedAt: nowIso,
            targetType: 'social',
            targetId: soc.id,
            targetName: `${soc.label} (${soc.handle})`,
            targetUrl: soc.url,
            status: 'issue_detected',
            httpStatusCode: null,
            latencyMs: 0,
            detail: 'Social profile URL is missing https:// protocol.',
          });
          continue;
        }
      }

      const probe = await checkUrlReachability(targetUrl);
      results.push({
        id: `diag-soc-${soc.id}`,
        checkedAt: nowIso,
        targetType: 'social',
        targetId: soc.id,
        targetName: `${soc.label} (${soc.handle})`,
        targetUrl,
        status: !probe.ok && !resolutionNote ? 'issue_detected' : status,
        httpStatusCode: probe.statusCode,
        latencyMs: probe.latencyMs,
        detail: probe.detail,
        resolutionNote,
      });
    }

    // Check all redirect rules
    for (const red of appState.redirects) {
      let resolutionNote: string | undefined;
      let status: DiagnosticReportItem['status'] = 'healthy';

      if (!red.sourcePath.startsWith('/')) {
        if (autoFix) {
          red.sourcePath = `/${red.sourcePath}`;
          resolutionNote = `Normalized source path to start with leading slash (${red.sourcePath}).`;
          status = 'auto_resolved';
        } else {
          status = 'issue_detected';
        }
      }

      if (!/^https?:\/\//i.test(red.destinationUrl)) {
        if (autoFix) {
          red.destinationUrl = `https://${red.destinationUrl}`;
          resolutionNote = (resolutionNote ? `${resolutionNote} ` : '') + `Normalized destination URL to HTTPS.`;
          status = 'auto_resolved';
        } else {
          status = 'issue_detected';
        }
      }

      const probe = await checkUrlReachability(red.destinationUrl);
      results.push({
        id: `diag-red-${red.id}`,
        checkedAt: nowIso,
        targetType: 'redirect',
        targetId: red.id,
        targetName: `Redirect ${red.sourcePath} (${red.statusCode})`,
        targetUrl: red.destinationUrl,
        status: !probe.ok && status === 'healthy' ? 'issue_detected' : status,
        httpStatusCode: probe.statusCode,
        latencyMs: probe.latencyMs,
        detail: probe.detail,
        resolutionNote,
      });
    }

    // Check custom domains via live DNS & TLS
    for (const dom of appState.domains) {
      const liveResult = await performLiveDomainCheck(dom.domain);
      dom.lastCheckedAt = nowIso;
      dom.dnsStatus = liveResult.dnsStatus;
      dom.resolvedA = liveResult.resolvedA;
      dom.resolvedAAAA = liveResult.resolvedAAAA;
      dom.resolvedCname = liveResult.resolvedCname;
      dom.resolvedTxt = liveResult.resolvedTxt;
      dom.resolvedNs = liveResult.resolvedNs;
      dom.dnsLookupLatencyMs = liveResult.dnsLookupLatencyMs;
      dom.sslStatus = liveResult.sslStatus;
      dom.sslIssuer = liveResult.sslIssuer;
      dom.sslSubject = liveResult.sslSubject;
      dom.sslValidFrom = liveResult.sslValidFrom;
      dom.sslValidTo = liveResult.sslValidTo;
      dom.sslProtocol = liveResult.sslProtocol;
      dom.sslFingerprint = liveResult.sslFingerprint;
      dom.diagnosticMessage = liveResult.diagnosticMessage;

      results.push({
        id: `diag-dom-${dom.id}`,
        checkedAt: nowIso,
        targetType: 'domain',
        targetId: dom.id,
        targetName: `Custom Domain (${dom.domain})`,
        targetUrl: `https://${dom.domain}`,
        status: liveResult.dnsStatus === 'verified' ? 'healthy' : 'issue_detected',
        httpStatusCode: liveResult.sslStatus === 'active' ? 200 : null,
        latencyMs: liveResult.dnsLookupLatencyMs || 0,
        detail: liveResult.diagnosticMessage,
      });
    }

    appState.diagnostics = results;
    appState.lastDiagnosticRunAt = nowIso;
    saveState(appState);

    res.json({
      diagnostics: appState.diagnostics,
      lastDiagnosticRunAt: appState.lastDiagnosticRunAt,
      blocks: appState.blocks,
      socials: appState.socials,
      redirects: appState.redirects,
      domains: appState.domains,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Atelier Link server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
