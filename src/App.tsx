/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  RefreshCw,
  Check,
  Copy,
  Download,
  AlertTriangle,
  Terminal,
  Sliders,
  FileText,
  Send,
  Search
} from 'lucide-react';

interface GuestbookEntry {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  category: 'technical' | 'dread' | 'refund';
  ratingLabel: string;
  message: string;
  date: string;
}

interface PricingPlan {
  id: string;
  index: string;
  name: string;
  tagline: string;
  usdPrice: number;
  sighsPrice: number;
  deliveryTime: string;
  features: string[];
  surcharges: { label: string; usd: number; sighs: number }[];
}

const INITIAL_GUESTBOOK: GuestbookEntry[] = [
  {
    id: '1',
    ticketNumber: 'BW-1041',
    name: 'Arthur Pendelton',
    email: 'arthur@pendelton-logistics.org',
    category: 'technical',
    ratingLabel: '0.5 / 5 Stars · Unusable',
    message: 'I tried to enter my phone number using the slider for twenty minutes and accidentally called a bowling alley in Toledo. Truly remarkable engineering.',
    date: 'Nov 14, 2026'
  },
  {
    id: '2',
    ticketNumber: 'BW-1042',
    name: 'Elena Rostova',
    email: 'erostova@vanguard-press.io',
    category: 'dread',
    ratingLabel: '1.0 / 5 Stars · Deeply Confused',
    message: 'The hand-pumped volume control leaked all of its air while I was on a conference call. My team now believes I work inside a submarine.',
    date: 'Nov 15, 2026'
  },
  {
    id: '3',
    ticketNumber: 'BW-1043',
    name: 'Marcus Vance',
    email: 'mvance@vancehardware.net',
    category: 'refund',
    ratingLabel: '0.0 / 5 Stars · Want My $0.02',
    message: 'Chased the two-cent rebate button across four monitors before it finally surrendered. Frame-worthy certificate, still demanding a refund.',
    date: 'Nov 16, 2026'
  }
];

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'nephew',
    index: '01. Starter Mistake',
    name: 'The Nephew Knows HTML',
    tagline: 'Built during a single Thanksgiving weekend on a borrowed laptop.',
    usdPrice: 4.99,
    sighsPrice: 12,
    deliveryTime: '4 to 90 business weeks',
    features: [
      'One mostly centered div that shifts left on Tuesdays',
      'Three hyperlinks (two point to localhost:8080)',
      'Hand-written apology letter signed by our intern',
      'Pre-configured Cloudflare Pages _redirects file'
    ],
    surcharges: [
      { label: 'Duct Tape Server Hosting Fee', usd: 1.50, sighs: 4 },
      { label: 'Spellcheck Waiver Credit', usd: -0.49, sighs: -1 }
    ]
  },
  {
    id: 'enterprise',
    index: '02. Corporate Regret',
    name: 'Enterprise Beige Suite',
    tagline: 'Identical to the $4.99 site, accompanied by a 94-page justification deck.',
    usdPrice: 14999.00,
    sighsPrice: 840,
    deliveryTime: '6 quarters of discovery calls',
    features: [
      'Dedicated rotary toaster telemetry hotline',
      'Custom Leaky Volume Slider for executive town halls',
      'Quarterly audit confirming site is still a single page',
      'Cloudflare Pages global edge caching for your typos'
    ],
    surcharges: [
      { label: 'Mandatory Consulting Jargon Surcharge', usd: 2400.00, sighs: 110 },
      { label: 'Floppy Disk Backup Retainer', usd: 350.00, sighs: 25 }
    ]
  },
  {
    id: 'mercy',
    index: '03. The Escape Hatch',
    name: 'Please Just Close The Tab',
    tagline: 'We both pretend you never visited this URL and move on with our lives.',
    usdPrice: 0.00,
    sighsPrice: 1,
    deliveryTime: 'Immediate relief',
    features: [
      'Zero follow-up emails from our sales department',
      'Complete amnesty from the Rotary Phone Input',
      'Complimentary copy of our wrangler.toml config',
      '100% money-back guarantee on your $0.00 purchase'
    ],
    surcharges: [
      { label: 'Emotional Recovery Processing Fee', usd: 0.00, sighs: 0 }
    ]
  }
];

const EXCUSE_TEMPLATES = {
  mild: [
    'Our CSS grid collapsed because a pigeon landed on the fiber optic conduit outside Gary’s apartment. Estimated recovery: 4 to 7 business Thursdays.',
    'We temporarily replaced the database with a shared spreadsheet that someone sorted by column C without selecting all rows.',
    'The button you clicked works in theory, which our engineering team considers a 90% success rate.'
  ],
  founder: [
    'We are pivoting from a functional website to an artisanal, post-usability static artifact hosted at the network edge.',
    'By removing conventional navigation affordances, we increased average time-on-page by 340% among users who could not find the exit.',
    'Our Series A deck describes this broken layout as Intentional Friction Architecture.'
  ],
  web05: [
    'Please wait while we manually fax your HTTP request to our basement Dell tower.',
    'This page is best viewed at 800x600 resolution while standing slightly to the left of your CRT monitor.',
    'Error 418: Our server rack is held together by load-bearing silver duct tape that has reached thermal capacity.'
  ]
};

const CLOUDFLARE_SNIPPETS = {
  wrangler: `name = "badweb-institute"
compatibility_date = "2026-11-16"
pages_build_output_dir = "dist"

# Deploy from terminal:
# npm run build && npx wrangler pages deploy dist`,
  redirects: `# /public/_redirects
# Ensures single-page routing resolves cleanly on Cloudflare Pages
/*    /index.html   200`,
  headers: `# /public/_headers
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable`
};

function ResilientImage({
  src,
  alt,
  caption,
  className = ''
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-stone-200 bg-stone-100 ${className}`}>
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-stone-100 to-stone-200 text-stone-700">
          <Terminal className="w-8 h-8 mb-3 text-amber-700" />
          <p className="text-sm font-semibold">{alt}</p>
          <p className="text-xs text-stone-500 mt-1">Archival hardware photograph · Asset verified</p>
        </div>
      )}
      {caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 pt-10">
          <p className="text-xs text-stone-100 leading-snug">{caption}</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // 01. Leaky Hand-Pumped Volume Control state
  const [volume, setVolume] = useState<number>(38);
  const [mercyValveLocked, setMercyValveLocked] = useState<boolean>(false);
  const [lastBeepNote, setLastBeepNote] = useState<string>('Ready to honk');
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 02. Evasive Rebate Button state
  const [dodgeCount, setDodgeCount] = useState<number>(0);
  const [rebateClaimed, setRebateClaimed] = useState<boolean>(false);

  // 03. Worst Phone Number Input state
  const [phoneNumberInt, setPhoneNumberInt] = useState<number>(5558675309);
  const [manualPhoneMode, setManualPhoneMode] = useState<boolean>(false);
  const [phoneVerifiedMessage, setPhoneVerifiedMessage] = useState<string>('');

  // 04. Overly Honest Cookie & Regret Ledger state
  const [cookiePrefs, setCookiePrefs] = useState({
    structural: true,
    typo2014: true,
    mattressBrokers: false,
    cursorJudge: true
  });
  const [cookieSavedToast, setCookieSavedToast] = useState<string>('');

  // Excuse Generator state
  const [excuseTier, setExcuseTier] = useState<'mild' | 'founder' | 'web05'>('mild');
  const [excuseIndex, setExcuseIndex] = useState<number>(0);
  const [copiedExcuse, setCopiedExcuse] = useState<boolean>(false);

  // Pricing & Invoice state
  const [currencyMode, setCurrencyMode] = useState<'usd' | 'sighs'>('usd');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('nephew');

  // Guestbook state
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>(() => {
    try {
      const saved = localStorage.getItem('badweb_guestbook_v1');
      return saved ? JSON.parse(saved) : INITIAL_GUESTBOOK;
    } catch {
      return INITIAL_GUESTBOOK;
    }
  });
  const [guestFilter, setGuestFilter] = useState<'all' | 'technical' | 'dread' | 'refund'>('all');
  const [guestSearch, setGuestSearch] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formCategory, setFormCategory] = useState<'technical' | 'dread' | 'refund'>('technical');
  const [formRating, setFormRating] = useState<string>('0.5 / 5 Stars · Unusable');
  const [formMessage, setFormMessage] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');

  // Cloudflare Pages Config Inspector state
  const [cfTab, setCfTab] = useState<'wrangler' | 'redirects' | 'headers'>('wrangler');
  const [copiedCf, setCopiedCf] = useState<boolean>(false);

  // Leaky volume effect
  useEffect(() => {
    if (mercyValveLocked) return;
    const timer = window.setInterval(() => {
      setVolume((prev) => Math.max(0, prev - 2));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mercyValveLocked]);

  // Persist guestbook
  useEffect(() => {
    try {
      localStorage.setItem('badweb_guestbook_v1', JSON.stringify(guestbook));
    } catch {
      // Ignore storage errors in private browsing
    }
  }, [guestbook]);

  const handlePumpVolume = () => {
    setVolume((prev) => Math.min(100, prev + 14));
  };

  const handleReleaseVolume = () => {
    setVolume((prev) => Math.max(0, prev - 18));
  };

  const handlePlayTone = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const freq = 180 + Math.round((volume / 100) * 440);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(90, freq - 110), ctx.currentTime + 0.22);

      const normalizedGain = Math.max(0.01, (volume / 100) * 0.18);
      gain.gain.setValueAtTime(normalizedGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
      setLastBeepNote(`Emitted ${freq} Hz sawtooth honk at ${volume}% pressure`);
    } catch {
      setLastBeepNote(`Simulated ${volume}% acoustic buzz (audio muted by browser)`);
    }
  };

  const formatPhoneNumber = (num: number): string => {
    const padded = Math.max(0, Math.min(9999999999, Math.floor(num)))
      .toString()
      .padStart(10, '0');
    return `(${padded.slice(0, 3)}) ${padded.slice(3, 6)}-${padded.slice(6, 10)}`;
  };

  const handleRollPhone = () => {
    const randomTenDigit = Math.floor(2000000000 + Math.random() * 7999999999);
    setPhoneNumberInt(randomTenDigit);
    setPhoneVerifiedMessage('');
  };

  const handleVerifyPhone = () => {
    setPhoneVerifiedMessage(
      `Logged ${formatPhoneNumber(phoneNumberInt)}. If this is not your phone number, please legally change your number to match.`
    );
  };

  const dodgeOffsets = [
    'translate-x-0 translate-y-0',
    'translate-x-6 -translate-y-2',
    '-translate-x-5 translate-y-2',
    'translate-x-3 translate-y-1'
  ];

  const dodgeReasons = [
    'Ready for rebate claim',
    'Dodge 1 of 3: Form 27B/6 not notarized. Click again to override.',
    'Dodge 2 of 3: Cursor velocity exceeded bureaucratic threshold. Click again.',
    'Dodge 3 of 3: Accounting is sighing loudly. One final click to claim.'
  ];

  const handleRebateClick = () => {
    if (rebateClaimed) return;
    if (dodgeCount < 3) {
      setDodgeCount((prev) => prev + 1);
    } else {
      setRebateClaimed(true);
    }
  };

  const handleResetRebate = () => {
    setDodgeCount(0);
    setRebateClaimed(false);
  };

  const totalCookieKilobytes =
    (cookiePrefs.structural ? 12 : 0) +
    (cookiePrefs.typo2014 ? 480 : 0) +
    (cookiePrefs.mattressBrokers ? 2410 : 0) +
    (cookiePrefs.cursorJudge ? 95 : 0);

  const handleSaveCookies = () => {
    setCookieSavedToast(
      `Committed ${totalCookieKilobytes.toLocaleString()} KB of questionable preferences to local memory.`
    );
  };

  const currentExcuse = EXCUSE_TEMPLATES[excuseTier][excuseIndex % EXCUSE_TEMPLATES[excuseTier].length];

  const handleCopyExcuse = () => {
    navigator.clipboard?.writeText(currentExcuse);
    setCopiedExcuse(true);
    window.setTimeout(() => setCopiedExcuse(false), 1800);
  };

  const selectedPlan = PRICING_PLANS.find((p) => p.id === selectedPlanId) || PRICING_PLANS[0];
  const surchargeTotalUsd = selectedPlan.surcharges.reduce((acc, item) => acc + item.usd, 0);
  const surchargeTotalSighs = selectedPlan.surcharges.reduce((acc, item) => acc + item.sighs, 0);
  const grandTotalUsd = selectedPlan.usdPrice + surchargeTotalUsd;
  const grandTotalSighs = selectedPlan.sighsPrice + surchargeTotalSighs;

  const handleDownloadInvoice = () => {
    const content = [
      '====================================================',
      'BADWEB INSTITUTE — OFFICIAL ITEMIZED INVOICE',
      '====================================================',
      `Plan Selected: ${selectedPlan.name}`,
      `Delivery Estimate: ${selectedPlan.deliveryTime}`,
      `Base Price: ${currencyMode === 'usd' ? `$${selectedPlan.usdPrice.toFixed(2)} USD` : `${selectedPlan.sighsPrice} Heavy Sighs`}`,
      ...selectedPlan.surcharges.map(
        (s) =>
          `Surcharge (${s.label}): ${
            currencyMode === 'usd' ? `$${s.usd.toFixed(2)} USD` : `${s.sighs} Heavy Sighs`
          }`
      ),
      '----------------------------------------------------',
      `TOTAL DUE: ${
        currencyMode === 'usd' ? `$${grandTotalUsd.toFixed(2)} USD` : `${grandTotalSighs} Heavy Sighs`
      }`,
      '====================================================',
      'Thank you for supporting questionable web architecture.'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `badweb-invoice-${selectedPlan.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGuestbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const trimmedName = formName.trim();
    const trimmedEmail = formEmail.trim();
    const trimmedMessage = formMessage.trim();

    if (!trimmedName) {
      setFormError('Please provide your name so we know who to ignore.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Please enter a valid email address (e.g., victim@example.com).');
      return;
    }
    if (trimmedMessage.length < 10) {
      setFormError('Your complaint must be at least 10 characters long to qualify as a grievance.');
      return;
    }

    const nextTicketNum = `BW-${1044 + guestbook.length}`;
    const newEntry: GuestbookEntry = {
      id: String(Date.now()),
      ticketNumber: nextTicketNum,
      name: trimmedName,
      email: trimmedEmail,
      category: formCategory,
      ratingLabel: formRating,
      message: trimmedMessage,
      date: 'Just now'
    };

    setGuestbook((prev) => [newEntry, ...prev]);
    setFormName('');
    setFormEmail('');
    setFormMessage('');
    setFormSuccess(`Grievance logged under Ticket ${nextTicketNum}. Estimated resolution: Year 2038.`);
  };

  const filteredGuestbook = guestbook.filter((entry) => {
    const matchesCategory = guestFilter === 'all' || entry.category === guestFilter;
    const matchesSearch =
      !guestSearch.trim() ||
      entry.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
      entry.message.toLowerCase().includes(guestSearch.toLowerCase()) ||
      entry.ticketNumber.toLowerCase().includes(guestSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCf = () => {
    navigator.clipboard?.writeText(CLOUDFLARE_SNIPPETS[cfTab]);
    setCopiedCf(true);
    window.setTimeout(() => setCopiedCf(false), 1800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-4 border-b border-stone-200 bg-[#FAF8F5]/95 backdrop-blur-sm">
        <a
          href="#"
          className="font-display text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
        >
          BadWeb Institute
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <a
            href="#contraptions"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Contraptions
          </a>
          <a
            href="#hall-of-shame"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Hall of Shame
          </a>
          <a
            href="#pricing"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Pricing
          </a>
          <a
            href="#guestbook"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Guestbook
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#guestbook"
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
          >
            File Complaint
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-stone-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-4">
                  <span>Museum of Questionable UX</span>
                  <span aria-hidden="true">·</span>
                  <span>Est. November 1998</span>
                  <span aria-hidden="true">·</span>
                  <span>Cloudflare Pages Static Build</span>
                </div>

                <h1
                  className="font-display font-bold tracking-tight text-stone-900 leading-[1.08]"
                  style={{
                    fontSize: 'clamp(2.25rem, 4vw, 3.75rem)',
                    textWrap: 'balance'
                  }}
                >
                  We spent forty-seven minutes building this page so you don’t have to.
                </h1>

                <p className="mt-6 text-base leading-relaxed text-stone-600 max-w-2xl">
                  Welcome to the web’s premier one-page monument to over-engineered mediocrity,
                  hand-pumped audio sliders, and forms that actively resent your input. Every single
                  widget below is wired to real client-side logic, though our legal department
                  advises against enjoying it.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-200/80 flex flex-wrap items-center gap-4">
                <a
                  href="#contraptions"
                  className="px-5 py-3 text-sm font-semibold text-white bg-amber-700 rounded-lg hover:bg-amber-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                >
                  Test Useless Contraptions
                </a>
                <a
                  href="#cloudflare-ready"
                  className="px-5 py-3 text-sm font-semibold text-stone-800 bg-stone-200/70 rounded-lg hover:bg-stone-200 transition-colors whitespace-nowrap shrink-0"
                >
                  Inspect Cloudflare Config
                </a>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="lg:col-span-5 flex">
              <ResilientImage
                src="/src/assets/images/hero_beige_crt_setup_1794842913217.jpg"
                alt="Beige 1990s CRT monitor covered in yellow sticky notes and tangled cables"
                caption="Fig 1. Our primary production workstation and sticky-note password vault, photographed Tuesday afternoon."
                className="w-full lg:h-full min-h-[300px]"
              />
            </div>
          </div>

          {/* 4-Column KPI Strip Below Hero Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-8 border-t border-stone-200">
            <div>
              <p className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
                04 hrs 12m
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Time since Gary tripped over the power cord · Basement Lab
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
                2,400 bps
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Peak emotional bandwidth · Acoustic coupler verified
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
                99.4%
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Visitors who immediately sigh within 8 seconds · 6-Month Audit
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-stone-900 tabular-nums">
                $0.02
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Remaining annual UI budget · After purchasing silver duct tape
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Interactive Anti-UX Contraptions Lab */}
        <section
          id="contraptions"
          className="max-w-7xl mx-auto px-6 py-16 lg:py-20 border-b border-stone-200"
        >
          <div className="max-w-2xl mb-10">
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
              <span>Interactive Hostile UI Laboratory</span>
              <span aria-hidden="true">·</span>
              <span>4 Active Mechanisms</span>
            </div>
            <h2
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900"
              style={{ textWrap: 'balance' }}
            >
              Why make things convenient when we can make them memorable?
            </h2>
            <p className="mt-3 text-base text-stone-600 leading-relaxed">
              Modern web applications spoil users with intuitive controls. Try our flagship
              replacements below—each engineered to add unnecessary physical effort to routine
              tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Contraption 01: Leaky Hand-Pumped Volume */}
            <div className="lg:col-span-7 rounded-xl border border-stone-200 bg-white p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs text-stone-500">
                    Pneumatic Audio Control · Leak Rate: 2% / sec
                  </span>
                  <span className="font-mono text-xs text-stone-600 tabular-nums">
                    Valve: {mercyValveLocked ? 'Sealed' : 'Leaking'}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-stone-900">
                  01. Pneumatic Hand-Pumped Volume Regulator
                </h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                  Standard sliders are lazy. Here, you must manually pump air pressure into the
                  volume tank before it leaks out through a Virtual Gasket Failure. Flip the Mercy
                  Valve if your wrist gets tired.
                </p>

                {/* Pressure Bar */}
                <div className="mt-6 p-4 rounded-lg bg-stone-100 border border-stone-200">
                  <div className="flex items-center justify-between text-sm font-medium text-stone-800 mb-2">
                    <span className="flex items-center gap-2">
                      {volume > 0 ? (
                        <Volume2 className="w-4 h-4 text-amber-700" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-stone-400" />
                      )}
                      Current Acoustic Pressure
                    </span>
                    <span className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                      {volume}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-700 transition-transform duration-150 origin-left"
                      style={{ transform: `scaleX(${volume / 100})` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-stone-500 font-mono tabular-nums">
                    {lastBeepNote}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePumpVolume}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 active:scale-95 transition-transform whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Pump Air (+14%)
                </button>
                <button
                  type="button"
                  onClick={handleReleaseVolume}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Bleed Valve (-18%)
                </button>
                <button
                  type="button"
                  onClick={() => setMercyValveLocked((prev) => !prev)}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    mercyValveLocked
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {mercyValveLocked ? 'Unseal Mercy Valve' : 'Seal Mercy Valve'}
                </button>
                <button
                  type="button"
                  onClick={handlePlayTone}
                  className="px-4 py-2.5 text-xs font-semibold text-amber-800 bg-amber-100/70 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Test Sawtooth Honk
                </button>
              </div>
            </div>

            {/* Contraption 02: Evasive $0.02 Cash Rebate */}
            <div className="lg:col-span-5 rounded-xl border border-stone-200 bg-white p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs text-stone-500">Customer Retention Department</span>
                  <span className="font-mono text-xs text-stone-600 tabular-nums">
                    Attempts: {dodgeCount} / 3
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-stone-900">
                  02. The Reluctant $0.02 Rebate Button
                </h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                  We promised our shareholders we would offer a generous cash rebate, but we
                  promised our CFO we would make you click four times while reading bureaucratic
                  excuses.
                </p>

                <div className="mt-6 p-4 rounded-lg bg-stone-100 border border-stone-200 min-h-[124px] flex flex-col justify-between">
                  <p className="text-xs text-stone-600 font-medium">
                    {rebateClaimed
                      ? 'Official Rebate Voucher #RW-002 Authorized. Payable in 2041.'
                      : dodgeReasons[dodgeCount]}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    {!rebateClaimed ? (
                      <button
                        type="button"
                        onClick={handleRebateClick}
                        className={`px-4 py-2 text-xs font-semibold text-white bg-amber-700 rounded-lg hover:bg-amber-800 transition-transform duration-150 whitespace-nowrap shrink-0 cursor-pointer ${dodgeOffsets[dodgeCount]}`}
                      >
                        {dodgeCount === 0
                          ? 'Claim $0.02 Rebate'
                          : dodgeCount < 3
                          ? `Chase $0.02 Rebate (${3 - dodgeCount} left)`
                          : 'Final Click: Force Payout'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>$0.02 Credited to Your Moral Account</span>
                      </div>
                    )}

                    {(dodgeCount > 0 || rebateClaimed) && (
                      <button
                        type="button"
                        onClick={handleResetRebate}
                        className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 underline whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-6 pt-4 border-t border-stone-100 text-xs text-stone-500">
                Audited by the Committee for Technically Functional Buttons.
              </p>
            </div>

            {/* Contraption 03: Worst Phone Number Slider */}
            <div className="lg:col-span-6 rounded-xl border border-stone-200 bg-white p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs text-stone-500">Precision Contact Capture</span>
                  <span className="font-mono text-xs text-stone-600 tabular-nums">
                    Range: 10 Billion Values
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-stone-900">
                  03. Linear Phone Number Slider
                </h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                  Typing ten digits on a keyboard is prone to human error. Slide smoothly across all
                  ten billion possible North American telephone numbers, or roll a random citizen’s
                  number.
                </p>

                <div className="mt-6 p-4 rounded-lg bg-stone-100 border border-stone-200">
                  <label
                    htmlFor="phone-slider-control"
                    className="block text-xs text-stone-500 mb-1"
                  >
                    Selected Telephone Number
                  </label>

                  {!manualPhoneMode ? (
                    <>
                      <p className="font-mono text-2xl font-bold text-stone-900 tabular-nums tracking-tight">
                        {formatPhoneNumber(phoneNumberInt)}
                      </p>
                      <input
                        id="phone-slider-control"
                        type="range"
                        min={1000000000}
                        max={9999999999}
                        step={1}
                        value={phoneNumberInt}
                        onChange={(e) => {
                          setPhoneNumberInt(Number(e.target.value));
                          setPhoneVerifiedMessage('');
                        }}
                        className="w-full mt-3 accent-amber-700 cursor-pointer"
                      />
                    </>
                  ) : (
                    <input
                      id="phone-slider-control"
                      type="number"
                      min={1000000000}
                      max={9999999999}
                      value={phoneNumberInt}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!Number.isNaN(val)) setPhoneNumberInt(val);
                      }}
                      className="w-full mt-1 px-3 py-2 font-mono text-base bg-white border border-stone-300 rounded-lg text-stone-900 tabular-nums"
                    />
                  )}

                  {phoneVerifiedMessage && (
                    <p className="mt-2 text-xs text-amber-900 font-medium">
                      {phoneVerifiedMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRollPhone}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Roll Random Number
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneNumberInt((prev) => Math.min(9999999999, prev + 1))}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Nudge +1 Digit
                </button>
                <button
                  type="button"
                  onClick={() => setManualPhoneMode((prev) => !prev)}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {manualPhoneMode ? 'Restore Awful Slider' : 'Enable Mercy Typing'}
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPhone}
                  className="px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-100/70 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Confirm Number
                </button>
              </div>
            </div>

            {/* Contraption 04: Overly Honest Cookie & Excuse Generator */}
            <div className="lg:col-span-6 rounded-xl border border-stone-200 bg-white p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs text-stone-500">Transparency & Excuse Engine</span>
                  <span className="font-mono text-xs text-stone-600 tabular-nums">
                    Payload: {totalCookieKilobytes.toLocaleString()} KB
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-stone-900">
                  04. Overly Honest Cookie & Excuse Synthesizer
                </h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                  Configure which completely unnecessary trackers we pretend to run, or generate a
                  tailor-made engineering excuse for why your own project is late.
                </p>

                <div className="mt-4 space-y-2.5">
                  <label className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 text-xs text-stone-700 cursor-pointer">
                    <span className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={cookiePrefs.typo2014}
                        onChange={(e) =>
                          setCookiePrefs((p) => ({ ...p, typo2014: e.target.checked }))
                        }
                        className="accent-amber-700 w-4 h-4"
                      />
                      <span>Remember that embarrassing typo you made in 2014</span>
                    </span>
                    <span className="font-mono text-stone-500 tabular-nums shrink-0">480 KB</span>
                  </label>

                  <label className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 text-xs text-stone-700 cursor-pointer">
                    <span className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={cookiePrefs.mattressBrokers}
                        onChange={(e) =>
                          setCookiePrefs((p) => ({ ...p, mattressBrokers: e.target.checked }))
                        }
                        className="accent-amber-700 w-4 h-4"
                      />
                      <span>Notify 847 mattress podcasts that you look slightly tired</span>
                    </span>
                    <span className="font-mono text-stone-500 tabular-nums shrink-0">2,410 KB</span>
                  </label>
                </div>

                {/* Excuse Synthesizer Sub-box */}
                <div className="mt-4 p-3.5 rounded-lg bg-stone-100 border border-stone-200">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-stone-700">
                      Production Outage Excuse Generator
                    </span>
                    <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-md">
                      {(['mild', 'founder', 'web05'] as const).map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setExcuseTier(tier)}
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            excuseTier === tier
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {tier === 'mild' ? 'Intern' : tier === 'founder' ? 'Founder' : '1998 IT'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-700 italic leading-relaxed">
                    “{currentExcuse}”
                  </p>
                </div>

                {cookieSavedToast && (
                  <p className="mt-2 text-xs text-emerald-800 font-medium">{cookieSavedToast}</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setExcuseIndex((prev) => prev + 1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Cycle Excuse</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyExcuse}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedExcuse ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedExcuse ? 'Copied Excuse' : 'Copy Excuse'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveCookies}
                  className="px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-100/70 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Save Cookie Ledger
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Hall of Shame — Case Studies & Attributable Regrets */}
        <section
          id="hall-of-shame"
          className="max-w-7xl mx-auto px-6 py-16 lg:py-20 border-b border-stone-200"
        >
          <div className="max-w-2xl mb-12">
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
              <span>Documented Field Failures</span>
              <span aria-hidden="true">·</span>
              <span>Hardware & UX Case Studies</span>
            </div>
            <h2
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900"
              style={{ textWrap: 'balance' }}
            >
              Proven results in reducing user engagement to near zero.
            </h2>
            <p className="mt-3 text-base text-stone-600 leading-relaxed">
              Every architectural decision we make is backed by empirical catastrophe. Review our
              two most celebrated infrastructure deployments below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Case Study 1 */}
            <article className="rounded-xl border border-stone-200 bg-white overflow-hidden flex flex-col justify-between">
              <div>
                <ResilientImage
                  src="/src/assets/images/shame_duct_tape_server_1794842914888.jpg"
                  alt="Makeshift server rack made of beige desktop towers held together with silver duct tape"
                  caption="Exhibit A: Cluster Node 03 secured with high-tensile silver adhesive."
                  className="aspect-4/3 rounded-none border-0 border-b border-stone-200"
                />
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                    <span>Infrastructure Migration</span>
                    <span aria-hidden="true">·</span>
                    <span>Q3 2025 Audit</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-stone-900">
                    01. The Load-Bearing Duct Tape Cluster
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                    When asked to migrate a regional logistics portal to high-availability cloud
                    infrastructure, we instead stacked seven 1999 Dell Dimension towers on a rusted
                    utility shelf and cross-braced the ribbon cables with industrial duct tape.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-6 p-4 rounded-lg bg-stone-50 border border-stone-200/80">
                    <div>
                      <p className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                        -84.2%
                      </p>
                      <p className="text-xs text-stone-500">
                        Checkout completion within 14 days of launch
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                        78 dB
                      </p>
                      <p className="text-xs text-stone-500">
                        Ambient cooling fan roar in the breakroom
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <blockquote className="px-6 pb-6 sm:px-8 sm:pb-8 pt-4 border-t border-stone-100">
                <p className="text-xs text-stone-600 italic leading-relaxed">
                  “Before hiring BadWeb Institute, our warehouse portal processed 400 orders a day.
                  After they taped six beige towers together in our janitor closet, we only
                  processed 12 orders, but our heating bill dropped by 30% in January.”
                </p>
                <footer className="mt-2 text-xs font-semibold text-stone-800">
                  — Raymond Vance, Director of Operations, Tri-County Pallet & Crate
                </footer>
              </blockquote>
            </article>

            {/* Case Study 2 */}
            <article className="rounded-xl border border-stone-200 bg-white overflow-hidden flex flex-col justify-between">
              <div>
                <ResilientImage
                  src="/src/assets/images/shame_rotary_modem_toaster_1794842913877.jpg"
                  alt="Brushed steel kitchen toaster fitted with a beige vintage rotary telephone dial and coiled cord"
                  caption="Exhibit B: The Toast-A-Call 2400 appliance during browning calibration."
                  className="aspect-4/3 rounded-none border-0 border-b border-stone-200"
                />
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                    <span>Connected Appliance Division</span>
                    <span aria-hidden="true">·</span>
                    <span>Patent Pending</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-stone-900">
                    02. The Toast-A-Call Rotary Breakfast Modem
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                    Why shouldn’t your two-slice kitchen toaster require dialing a seven-digit
                    landline extension before heating rye bread? If someone picks up the kitchen
                    phone mid-toast, the bagel ejects raw.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-6 p-4 rounded-lg bg-stone-50 border border-stone-200/80">
                    <div>
                      <p className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                        412 / hr
                      </p>
                      <p className="text-xs text-stone-500">
                        Burnt toast support tickets filed per morning
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                        $14.50
                      </p>
                      <p className="text-xs text-stone-500">
                        Total lifetime hardware revenue across 9 months
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <blockquote className="px-6 pb-6 sm:px-8 sm:pb-8 pt-4 border-t border-stone-100">
                <p className="text-xs text-stone-600 italic leading-relaxed">
                  “We asked for a simple smart-kitchen companion app. Instead, they bolted a 1974
                  rotary dial onto our breakroom toaster. Now our accountants accidentally dial
                  international collect calls whenever they want an English muffin.”
                </p>
                <footer className="mt-2 text-xs font-semibold text-stone-800">
                  — Sandra Lin, VP of Workplace Facilities, Meridian Breakfast Corp
                </footer>
              </blockquote>
            </article>
          </div>
        </section>

        {/* Section 3: Questionable Pricing & Live Invoice Calculator */}
        <section
          id="pricing"
          className="max-w-7xl mx-auto px-6 py-16 lg:py-20 border-b border-stone-200"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span>Transparent Overbilling</span>
                <span aria-hidden="true">·</span>
                <span>Instant TXT Receipt</span>
              </div>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900"
                style={{ textWrap: 'balance' }}
              >
                Select a disappointment tier that fits your budget.
              </h2>
            </div>

            {/* Interactive Currency Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setCurrencyMode('usd')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currencyMode === 'usd'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Bill in US Dollars ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode('sighs')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currencyMode === 'sighs'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Bill in Heavy Sighs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 3 Pricing Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRICING_PLANS.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl border p-6 flex flex-col justify-between transition-colors ${
                      isSelected
                        ? 'border-amber-700 bg-white'
                        : 'border-stone-200 bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs text-stone-500 mb-1">{plan.index}</p>
                      <h3 className="font-display text-lg font-bold text-stone-900">
                        {plan.name}
                      </h3>
                      <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                        {plan.tagline}
                      </p>

                      <div className="mt-5 pt-4 border-t border-stone-100">
                        <p className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
                          {currencyMode === 'usd'
                            ? `$${plan.usdPrice.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}`
                            : `${plan.sighsPrice} Sighs`}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Delivery: {plan.deliveryTime}
                        </p>
                      </div>

                      <ul className="mt-5 space-y-2.5 text-xs text-stone-700">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="leading-snug">
                            · {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`mt-6 w-full px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-700 text-white hover:bg-amber-800'
                          : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                      }`}
                    >
                      {isSelected ? 'Selected on Invoice' : 'Select This Mistake'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Live Itemized Receipt Box */}
            <div className="lg:col-span-4 rounded-xl border border-stone-200 bg-white p-6">
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-stone-200">
                <div>
                  <p className="text-xs text-stone-500">Live Itemized Estimate</p>
                  <h3 className="font-display text-lg font-bold text-stone-900">
                    Official Quote Summary
                  </h3>
                </div>
                <FileText className="w-5 h-5 text-stone-400 shrink-0" />
              </div>

              <div className="py-4 space-y-3 border-b border-stone-200 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-stone-800">{selectedPlan.name}</span>
                  <span className="font-mono font-semibold text-stone-900 tabular-nums shrink-0">
                    {currencyMode === 'usd'
                      ? `$${selectedPlan.usdPrice.toFixed(2)}`
                      : `${selectedPlan.sighsPrice} Sighs`}
                  </span>
                </div>

                {selectedPlan.surcharges.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 text-stone-600">
                    <span>{s.label}</span>
                    <span className="font-mono tabular-nums shrink-0">
                      {currencyMode === 'usd' ? `$${s.usd.toFixed(2)}` : `${s.sighs} Sighs`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-stone-900">Total Damage</span>
                <span className="font-mono text-xl font-bold text-amber-800 tabular-nums">
                  {currencyMode === 'usd'
                    ? `$${grandTotalUsd.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`
                    : `${grandTotalSighs} Heavy Sighs`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official TXT Invoice</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: The 1998 Guestbook & Complaint Department */}
        <section
          id="guestbook"
          className="max-w-7xl mx-auto px-6 py-16 lg:py-20 border-b border-stone-200"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Complaint Form */}
            <div className="lg:col-span-5 rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span>Public Grievance Log</span>
                <span aria-hidden="true">·</span>
                <span>Validated Form</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-stone-900">
                Sign the 1998 Guestbook
              </h2>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Leave your official review of this one-page disaster. All complaints are assigned a
                permanent ticket number and displayed immediately.
              </p>

              <form onSubmit={handleGuestbookSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="guest-name"
                    className="block text-xs font-semibold text-stone-700 mb-1.5"
                  >
                    Your Full Name
                  </label>
                  <input
                    id="guest-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Disappointed Visitor"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-2 focus:outline-amber-700"
                  />
                </div>

                <div>
                  <label
                    htmlFor="guest-email"
                    className="block text-xs font-semibold text-stone-700 mb-1.5"
                  >
                    Work or Dial-Up Email Address
                  </label>
                  <input
                    id="guest-email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="you@aol-keyword.org"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-2 focus:outline-amber-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="guest-category"
                      className="block text-xs font-semibold text-stone-700 mb-1.5"
                    >
                      Grievance Category
                    </label>
                    <select
                      id="guest-category"
                      value={formCategory}
                      onChange={(e) =>
                        setFormCategory(e.target.value as 'technical' | 'dread' | 'refund')
                      }
                      className="w-full px-3 py-2.5 text-xs font-medium bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    >
                      <option value="technical">UX & Slider Trauma</option>
                      <option value="dread">Existential Dread</option>
                      <option value="refund">Demand $0.02 Refund</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="guest-rating"
                      className="block text-xs font-semibold text-stone-700 mb-1.5"
                    >
                      Generous Rating
                    </label>
                    <select
                      id="guest-rating"
                      value={formRating}
                      onChange={(e) => setFormRating(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-medium bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    >
                      <option value="0.5 / 5 Stars · Unusable">0.5 / 5 Stars · Unusable</option>
                      <option value="1.0 / 5 Stars · Deeply Confused">
                        1.0 / 5 Stars · Deeply Confused
                      </option>
                      <option value="0.0 / 5 Stars · Want My $0.02">
                        0.0 / 5 Stars · Want My $0.02
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="guest-message"
                    className="block text-xs font-semibold text-stone-700 mb-1.5"
                  >
                    Official Complaint Statement
                  </label>
                  <textarea
                    id="guest-message"
                    rows={3}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Describe which contraption offended your sensibilities the most..."
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-2 focus:outline-amber-700"
                  />
                </div>

                {formError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-amber-700 rounded-lg hover:bg-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Grievance to Permanent Record</span>
                </button>
              </form>
            </div>

            {/* Guestbook Feed */}
            <div className="lg:col-span-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-lg self-start">
                  {(
                    [
                      { id: 'all', label: 'All Entries' },
                      { id: 'technical', label: 'Slider Trauma' },
                      { id: 'dread', label: 'Dread' },
                      { id: 'refund', label: 'Refunds' }
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setGuestFilter(tab.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        guestFilter === tab.id
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="Search tickets..."
                    aria-label="Search guestbook entries"
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {filteredGuestbook.length === 0 ? (
                  <div className="p-8 rounded-xl border border-stone-200 bg-white text-center">
                    <p className="text-sm font-semibold text-stone-800">
                      No matching complaints found.
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      Try clearing your search filter or submit a fresh grievance on the left.
                    </p>
                  </div>
                ) : (
                  filteredGuestbook.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-xl border border-stone-200 bg-white"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-stone-800 tabular-nums">
                            Ticket #{item.ticketNumber}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.ratingLabel}</span>
                        </div>
                        <span className="tabular-nums">{item.date}</span>
                      </div>

                      <p className="text-sm text-stone-700 leading-relaxed">“{item.message}”</p>

                      <p className="mt-3 text-xs font-semibold text-stone-900">
                        — {item.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Cloudflare Pages Readiness Inspector */}
        <section id="cloudflare-ready" className="max-w-7xl mx-auto px-6 py-16">
          <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <span>Zero-Backend Static Output</span>
                  <span aria-hidden="true">·</span>
                  <span>Pre-Configured in Repository</span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                  Cloudflare Pages Deployment Kit
                </h2>
                <p className="mt-1 text-sm text-stone-600">
                  Despite our questionable UX, the underlying build pipeline is rock-solid.{" "}
                  <code className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">
                    wrangler.toml
                  </code>
                  ,{" "}
                  <code className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">
                    public/_redirects
                  </code>
                  , and{" "}
                  <code className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">
                    public/_headers
                  </code>{" "}
                  are included in this project for instant deployment.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg self-start shrink-0">
                {(
                  [
                    { id: 'wrangler', label: 'wrangler.toml' },
                    { id: 'redirects', label: '_redirects' },
                    { id: 'headers', label: '_headers' }
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCfTab(tab.id)}
                    className={`px-3 py-1.5 font-mono text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      cfTab === tab.id
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 bg-stone-900 text-stone-100 rounded-lg p-4 font-mono text-xs overflow-x-auto relative">
                <pre className="leading-relaxed">{CLOUDFLARE_SNIPPETS[cfTab]}</pre>
              </div>

              <div className="lg:col-span-4 space-y-3 text-xs text-stone-600">
                <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200">
                  <p className="font-semibold text-stone-900">Build Command</p>
                  <p className="font-mono text-stone-700 mt-0.5">npm run build</p>
                </div>
                <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200">
                  <p className="font-semibold text-stone-900">Build Output Directory</p>
                  <p className="font-mono text-stone-700 mt-0.5">dist</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCf}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-800 bg-stone-200/80 rounded-lg hover:bg-stone-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedCf ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCf ? 'Copied Configuration' : 'Copy Active File'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-stone-200 bg-[#FAF8F5] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            <span className="font-display font-bold text-stone-900">BadWeb Institute</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>Division of Unnecessary Digital Friction · ISO-9001 Reject</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#contraptions" className="hover:text-stone-900 transition-colors">
              Contraptions
            </a>
            <a href="#hall-of-shame" className="hover:text-stone-900 transition-colors">
              Hall of Shame
            </a>
            <a href="#pricing" className="hover:text-stone-900 transition-colors">
              Pricing
            </a>
            <a href="#cloudflare-ready" className="hover:text-stone-900 transition-colors">
              Cloudflare Config
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
