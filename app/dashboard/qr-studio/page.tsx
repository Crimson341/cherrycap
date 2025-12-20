"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";
import {
  QrCode,
  Link as LinkIcon,
  Wifi,
  User,
  MapPin,
  Phone,
  Mail,
  Download,
  Copy,
  Sparkles,
  Loader2,
  ChevronLeft,
  Palette,
  CreditCard,
  Calendar,
  MessageSquare,
  Share2,
  Snowflake,
  Sun,
  Leaf,
  Heart,
  Star,
  Zap,
  X,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { StarButton } from "@/components/ui/star-button";

// QR Code types - simplified display
const QR_TYPES = {
  url: { name: "Link", icon: LinkIcon, placeholder: "https://example.com" },
  wifi: { name: "WiFi", icon: Wifi, placeholder: "Network Name" },
  vcard: { name: "Contact", icon: User, placeholder: "John Doe" },
  phone: { name: "Phone", icon: Phone, placeholder: "+1 555-123-4567" },
  email: { name: "Email", icon: Mail, placeholder: "hello@example.com" },
  sms: { name: "SMS", icon: MessageSquare, placeholder: "+1 555-123-4567" },
  location: { name: "Location", icon: MapPin, placeholder: "40.7128,-74.0060" },
  payment: { name: "Payment", icon: CreditCard, placeholder: "@username" },
  calendar: { name: "Event", icon: Calendar, placeholder: "Event Name" },
  social: { name: "Social", icon: Share2, placeholder: "https://instagram.com/you" },
} as const;

// AI Background themes
const AI_THEMES = {
  christmas: { name: "Christmas", icon: Snowflake, prompt: "Festive Christmas background with snowflakes, red and green colors, holly, ornaments", colors: { bg: "#1a472a", fg: "#ffffff" } },
  summer: { name: "Summer", icon: Sun, prompt: "Bright sunny summer background with beach vibes, tropical colors, palm trees", colors: { bg: "#87CEEB", fg: "#000000" } },
  autumn: { name: "Autumn", icon: Leaf, prompt: "Warm autumn background with falling leaves, orange and brown colors", colors: { bg: "#D2691E", fg: "#ffffff" } },
  valentines: { name: "Love", icon: Heart, prompt: "Romantic background with hearts, pink and red colors", colors: { bg: "#FF69B4", fg: "#ffffff" } },
  premium: { name: "Premium", icon: Star, prompt: "Luxurious premium background with gold accents, elegant dark theme", colors: { bg: "#1a1a1a", fg: "#D4AF37" } },
  tech: { name: "Tech", icon: Zap, prompt: "Modern tech background with circuit patterns, neon blue and purple", colors: { bg: "#0D1117", fg: "#58A6FF" } },
  custom: { name: "Custom", icon: Sparkles, prompt: "", colors: { bg: "#ffffff", fg: "#000000" } },
} as const;

// Color presets
const COLOR_PRESETS = [
  { name: "Classic", fg: "#000000", bg: "#ffffff" },
  { name: "Inverted", fg: "#ffffff", bg: "#000000" },
  { name: "Ocean", fg: "#0077B6", bg: "#CAF0F8" },
  { name: "Forest", fg: "#2D6A4F", bg: "#D8F3DC" },
  { name: "Sunset", fg: "#9C2706", bg: "#FFF5E6" },
  { name: "Berry", fg: "#7B2CBF", bg: "#F3E8FF" },
  { name: "Rose", fg: "#B76E79", bg: "#FFF5F5" },
  { name: "Midnight", fg: "#E0E1DD", bg: "#0D1B2A" },
];

export default function QRStudioPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const organizations = useQuery(api.organizations.listForUser, user?.id ? { userId: user.id } : "skip");
  const currentOrg = organizations?.[0];

  // Core state
  const [qrType, setQrType] = useState<keyof typeof QR_TYPES>("url");
  const [qrValue, setQrValue] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrSize] = useState(220);
  const [errorCorrection] = useState<"L" | "M" | "Q" | "H">("M");

  // WiFi
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  // vCard
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardCompany, setVcardCompany] = useState("");

  // SMS
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  // Calendar
  const [eventTitle, setEventTitle] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");

  // AI & UI
  const [aiTheme, setAiTheme] = useState<keyof typeof AI_THEMES | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [generatedBgUrl, setGeneratedBgUrl] = useState<string | null>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);

  // Build QR value
  const buildQRValue = useCallback(() => {
    switch (qrType) {
      case "wifi": return `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};;`;
      case "vcard": return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nORG:${vcardCompany}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case "phone": return `tel:${qrValue.replace(/[^0-9+]/g, "")}`;
      case "email": return `mailto:${qrValue}`;
      case "sms": return `sms:${smsPhone}${smsMessage ? `?body=${encodeURIComponent(smsMessage)}` : ""}`;
      case "location": return `geo:${qrValue}`;
      case "calendar": return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${eventStart.replace(/[-:]/g, "")}\nDTEND:${eventEnd.replace(/[-:]/g, "")}\nSUMMARY:${eventTitle}\nEND:VEVENT\nEND:VCALENDAR`;
      default: return qrValue;
    }
  }, [qrType, qrValue, wifiSSID, wifiPassword, wifiEncryption, vcardName, vcardPhone, vcardEmail, vcardCompany, smsPhone, smsMessage, eventTitle, eventStart, eventEnd]);

  const finalQRValue = buildQRValue();

  const applyBrandColors = () => {
    if (currentOrg?.brandColor) {
      setFgColor(currentOrg.brandColor);
      setBgColor("#ffffff");
    }
  };

  const generateAIBackground = async () => {
    if (!aiTheme) return;
    const theme = AI_THEMES[aiTheme];
    const prompt = aiTheme === "custom" ? customPrompt : theme.prompt;
    if (!prompt) return;

    setIsGeneratingBg(true);
    try {
      const response = await fetch("/api/ai/qr-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Create a beautiful background image for a QR code. ${prompt}. Clear center area for QR code. Subtle, professional.`, size: qrSize }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setGeneratedBgUrl(data.imageUrl);
          setFgColor(theme.colors.fg);
          setBgColor("transparent");
        }
      }
    } catch (error) {
      console.error("Failed to generate background:", error);
    } finally {
      setIsGeneratingBg(false);
    }
  };

  const downloadQR = async (format: "png" | "svg" = "png") => {
    setIsDownloading(true);
    try {
      if (format === "svg") {
        const svg = qrRef.current?.querySelector("svg");
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([svgData], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `qr-${Date.now()}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = qrSize + 32;
        canvas.width = size;
        canvas.height = size;

        if (ctx) {
          if (generatedBgUrl) {
            const bgImg = new Image();
            bgImg.crossOrigin = "anonymous";
            await new Promise<void>((resolve) => {
              bgImg.onload = () => { ctx.drawImage(bgImg, 0, 0, size, size); resolve(); };
              bgImg.onerror = () => resolve();
              bgImg.src = generatedBgUrl;
            });
          } else {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, size, size);
          }

          const qrCanvas = qrRef.current?.querySelector("canvas");
          if (qrCanvas) ctx.drawImage(qrCanvas, 16, 16);

          const url = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = url;
          a.download = `qr-${Date.now()}.png`;
          a.click();
        }
      }
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(finalQRValue);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <QrCode className="h-16 w-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">QR Code Studio</h1>
        <p className="text-neutral-400 mb-6">Sign in to create branded QR codes</p>
        <Link href="/login" className="px-6 py-2 bg-rose-500 hover:bg-rose-600 rounded-full transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-black text-white">
      {/* Minimal Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-neutral-950/80 border-b border-neutral-800/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="p-2 -ml-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800/50 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold flex items-center gap-2">
            <QrCode className="h-4 w-4 text-rose-500" />
            QR Studio
          </h1>
          <button
            onClick={() => downloadQR("png")}
            disabled={!finalQRValue || isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-700 disabled:text-neutral-400 rounded-full text-sm font-medium transition-colors"
          >
            {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* QR Preview - Always Prominent */}
        <div className="relative">
          <div
            ref={qrRef}
            className="mx-auto w-fit rounded-3xl overflow-hidden shadow-2xl shadow-black/50"
            style={{
              backgroundColor: generatedBgUrl ? "transparent" : bgColor,
              backgroundImage: generatedBgUrl ? `url(${generatedBgUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              padding: "24px",
            }}
          >
            {finalQRValue ? (
              <>
                <QRCodeSVG
                  value={finalQRValue}
                  size={qrSize}
                  fgColor={fgColor}
                  bgColor={generatedBgUrl ? "transparent" : bgColor}
                  level={errorCorrection}
                  includeMargin={false}
                />
                <div className="hidden">
                  <QRCodeCanvas
                    value={finalQRValue}
                    size={qrSize}
                    fgColor={fgColor}
                    bgColor={generatedBgUrl ? "transparent" : bgColor}
                    level={errorCorrection}
                    includeMargin={false}
                  />
                </div>
              </>
            ) : (
              <div className="w-[220px] h-[220px] flex flex-col items-center justify-center text-neutral-400">
                <QrCode className="h-12 w-12 mb-2 opacity-30" />
                <p className="text-xs">Enter content below</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {finalQRValue && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={copyValue}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800/80 hover:bg-neutral-700 rounded-full text-xs transition-colors"
              >
                {copySuccess ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                {copySuccess ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() => downloadQR("svg")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800/80 hover:bg-neutral-700 rounded-full text-xs transition-colors"
              >
                <Download className="h-3 w-3" />
                SVG
              </button>
            </div>
          )}
        </div>

        {/* Type Selector - Horizontal Scroll */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-2 w-max">
            {Object.entries(QR_TYPES).map(([key, type]) => (
              <button
                key={key}
                onClick={() => { setQrType(key as keyof typeof QR_TYPES); setQrValue(""); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  qrType === key
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                    : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                )}
              >
                <type.icon className="h-4 w-4" />
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Input - Clean & Unified */}
        <div className="space-y-3">
          {/* Simple types */}
          {["url", "phone", "email", "location", "payment", "social"].includes(qrType) && (
            <input
              type={qrType === "email" ? "email" : qrType === "url" || qrType === "social" ? "url" : "text"}
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              placeholder={QR_TYPES[qrType].placeholder}
              className="w-full px-5 py-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl text-white text-lg placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 focus:bg-neutral-900 transition-all"
              autoFocus
            />
          )}

          {/* WiFi */}
          {qrType === "wifi" && (
            <div className="space-y-3">
              <input
                type="text"
                value={wifiSSID}
                onChange={(e) => setWifiSSID(e.target.value)}
                placeholder="Network name"
                className="w-full px-5 py-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 transition-all"
                autoFocus
              />
              <div className="relative">
                <input
                  type={showWifiPassword ? "text" : "password"}
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-5 py-4 pr-12 bg-neutral-900/50 border border-neutral-800 rounded-2xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 transition-all"
                />
                <button
                  onClick={() => setShowWifiPassword(!showWifiPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  {showWifiPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex gap-2">
                {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                  <button
                    key={enc}
                    onClick={() => setWifiEncryption(enc)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all",
                      wifiEncryption === enc
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/50"
                        : "bg-neutral-800/50 text-neutral-400 border border-transparent hover:bg-neutral-800"
                    )}
                  >
                    {enc === "nopass" ? "None" : enc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* vCard */}
          {qrType === "vcard" && (
            <div className="space-y-3">
              <input
                type="text"
                value={vcardName}
                onChange={(e) => setVcardName(e.target.value)}
                placeholder="Full name"
                className="w-full px-5 py-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 transition-all"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  value={vcardPhone}
                  onChange={(e) => setVcardPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 transition-all"
                />
                <input
                  type="email"
                  value={vcardEmail}
                  onChange={(e) => setVcardEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 transition-all"
                />
              </div>
              <input
                type="text"
                value={vcardCompany}
                onChange={(e) => setVcardCompany(e.target.value)}
                placeholder="Company (optional)"
                className="w-full px-5 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 transition-all"
              />
            </div>
          )}

          {/* SMS */}
          {qrType === "sms" && (
            <div className="space-y-3">
              <input
                type="tel"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full px-5 py-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 transition-all"
                autoFocus
              />
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Pre-filled message (optional)"
                rows={2}
                className="w-full px-5 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 resize-none transition-all"
              />
            </div>
          )}

          {/* Calendar */}
          {qrType === "calendar" && (
            <div className="space-y-3">
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
                className="w-full px-5 py-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 transition-all"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 mb-1.5 block px-1">Start</label>
                  <input
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-rose-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1.5 block px-1">End</label>
                  <input
                    type="datetime-local"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-rose-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expandable Panels */}
        <div className="space-y-2">
          {/* Style Panel */}
          <div className="rounded-2xl bg-neutral-900/30 border border-neutral-800/50 overflow-hidden">
            <button
              onClick={() => setShowStylePanel(!showStylePanel)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings2 className="h-5 w-5 text-neutral-400" />
                <span className="font-medium">Style & Colors</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-900" style={{ backgroundColor: fgColor }} />
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-900" style={{ backgroundColor: bgColor === "transparent" ? "#ffffff" : bgColor }} />
                </div>
                <ChevronDown className={cn("h-5 w-5 text-neutral-500 transition-transform", showStylePanel && "rotate-180")} />
              </div>
            </button>

            {showStylePanel && (
              <div className="px-5 pb-5 space-y-4">
                {/* Color Presets */}
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => { setFgColor(preset.fg); setBgColor(preset.bg); setGeneratedBgUrl(null); }}
                      className={cn(
                        "w-10 h-10 rounded-xl transition-all",
                        fgColor === preset.fg && bgColor === preset.bg
                          ? "ring-2 ring-rose-500 ring-offset-2 ring-offset-neutral-900 scale-105"
                          : "hover:scale-105"
                      )}
                      style={{ background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)` }}
                      title={preset.name}
                    />
                  ))}
                  {currentOrg?.brandColor && (
                    <button
                      onClick={applyBrandColors}
                      className="flex items-center gap-2 px-3 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm transition-colors"
                      title="Apply brand colors"
                    >
                      <Palette className="h-4 w-4" />
                      <span className="hidden sm:inline">Brand</span>
                    </button>
                  )}
                </div>

                {/* Custom Colors */}
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-neutral-800/50 rounded-xl">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-neutral-300 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-neutral-800/50 rounded-xl">
                    <input
                      type="color"
                      value={bgColor === "transparent" ? "#ffffff" : bgColor}
                      onChange={(e) => { setBgColor(e.target.value); setGeneratedBgUrl(null); }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => { setBgColor(e.target.value); setGeneratedBgUrl(null); }}
                      className="flex-1 bg-transparent text-sm text-neutral-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Background Panel */}
          <div className="rounded-2xl bg-neutral-900/30 border border-neutral-800/50 overflow-hidden">
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-rose-400" />
                <span className="font-medium">AI Background</span>
              </div>
              <div className="flex items-center gap-2">
                {generatedBgUrl && (
                  <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">Active</span>
                )}
                <ChevronDown className={cn("h-5 w-5 text-neutral-500 transition-transform", showAiPanel && "rotate-180")} />
              </div>
            </button>

            {showAiPanel && (
              <div className="px-5 pb-5 space-y-4">
                {generatedBgUrl && (
                  <button
                    onClick={() => { setGeneratedBgUrl(null); setBgColor("#ffffff"); setAiTheme(null); }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-neutral-400 hover:text-white bg-neutral-800/50 rounded-xl transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Remove background
                  </button>
                )}

                {/* Theme Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {Object.entries(AI_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => setAiTheme(key as keyof typeof AI_THEMES)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
                        aiTheme === key
                          ? "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/50"
                          : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      )}
                    >
                      <theme.icon className="h-5 w-5" />
                      <span className="text-[10px] font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>

                {aiTheme === "custom" && (
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe your ideal background..."
                    rows={2}
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500/50 resize-none"
                  />
                )}

                {aiTheme && (
                  <div className="flex justify-center">
                    <StarButton
                      onClick={generateAIBackground}
                      disabled={isGeneratingBg || (aiTheme === "custom" && !customPrompt)}
                      className="h-11 px-6"
                    >
                      {isGeneratingBg ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate
                        </>
                      )}
                    </StarButton>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom spacing for mobile */}
        <div className="h-8" />
      </div>
    </div>
  );
}
