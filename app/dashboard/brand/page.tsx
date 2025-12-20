"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  Building2,
  Users,
  Mic2,
  Package,
  Target,
  FileText,
  Share2,
  ChevronLeft,
  Loader2,
  Save,
  Plus,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Globe,
  Mail,
  MapPin,
  Calendar,
  Lightbulb,
  MessageSquare,
  Briefcase,
  Heart,
  GraduationCap,
  Megaphone,
  Trash2,
  Star,
  FileSpreadsheet,
  Download,
  Wand2,
  PenTool,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const BUSINESS_MODELS = [
  { value: "b2b", label: "B2B", desc: "Business to Business" },
  { value: "b2c", label: "B2C", desc: "Business to Consumer" },
  { value: "b2b2c", label: "B2B2C", desc: "Business to Business to Consumer" },
  { value: "d2c", label: "D2C", desc: "Direct to Consumer" },
  { value: "marketplace", label: "Marketplace", desc: "Platform connecting buyers & sellers" },
  { value: "saas", label: "SaaS", desc: "Software as a Service" },
  { value: "agency", label: "Agency", desc: "Service-based agency" },
  { value: "ecommerce", label: "E-commerce", desc: "Online retail" },
  { value: "content", label: "Content", desc: "Content/Media business" },
  { value: "other", label: "Other", desc: "Other business model" },
] as const;

const BRAND_VOICES = [
  { value: "professional", label: "Professional", icon: Briefcase, desc: "Formal, credible, expert" },
  { value: "friendly", label: "Friendly", icon: Heart, desc: "Warm, approachable, relatable" },
  { value: "casual", label: "Casual", icon: MessageSquare, desc: "Relaxed, conversational, easygoing" },
  { value: "authoritative", label: "Authoritative", icon: Target, desc: "Confident, commanding, trustworthy" },
  { value: "playful", label: "Playful", icon: Sparkles, desc: "Fun, witty, energetic" },
  { value: "inspirational", label: "Inspirational", icon: Lightbulb, desc: "Motivating, uplifting, empowering" },
  { value: "educational", label: "Educational", icon: GraduationCap, desc: "Informative, helpful, clear" },
  { value: "bold", label: "Bold", icon: Megaphone, desc: "Daring, provocative, confident" },
] as const;

const TONE_ATTRIBUTES = [
  "Witty", "Empathetic", "Direct", "Sophisticated", "Down-to-earth",
  "Optimistic", "Thoughtful", "Energetic", "Calm", "Curious",
  "Passionate", "Trustworthy", "Innovative", "Supportive", "Honest"
];

type Step = "basics" | "audience" | "voice" | "products" | "content" | "social";

const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Food & Beverage",
  "Manufacturing",
  "Real Estate",
  "Travel & Hospitality",
  "Media & Entertainment",
  "Professional Services",
  "Non-profit",
  "Other",
] as const;

export default function BrandContextPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  
  const businessContext = useQuery(api.businessContext.get);
  const upsertContext = useMutation(api.businessContext.upsert);
  const addProduct = useMutation(api.businessContext.addProduct);
  const removeProduct = useMutation(api.businessContext.removeProduct);
  
  const [currentStep, setCurrentStep] = useState<Step>("basics");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  
  // Welcome modal state - only show if user hasn't dismissed it
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  // Check if we should show the welcome modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("brandContext_welcomeDismissed");
      if (!dismissed) {
        setShowWelcomeModal(true);
      }
    }
  }, []);
  
  const handleDismissWelcome = () => {
    if (dontShowAgain) {
      localStorage.setItem("brandContext_welcomeDismissed", "true");
    }
    setShowWelcomeModal(false);
  };
  
  // Form state
  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [foundedYear, setFoundedYear] = useState<number | undefined>();
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [niche, setNiche] = useState("");
  const [businessModel, setBusinessModel] = useState<typeof BUSINESS_MODELS[number]["value"] | "">("");
  const [targetAudience, setTargetAudience] = useState("");
  const [audiencePainPoints, setAudiencePainPoints] = useState<string[]>([]);
  const [painPointInput, setPainPointInput] = useState("");
  const [audienceDemographics, setAudienceDemographics] = useState("");
  const [brandVoice, setBrandVoice] = useState<typeof BRAND_VOICES[number]["value"]>("professional");
  const [toneAttributes, setToneAttributes] = useState<string[]>([]);
  const [writingStyle, setWritingStyle] = useState("");
  const [uniqueValue, setUniqueValue] = useState("");
  const [competitiveAdvantages, setCompetitiveAdvantages] = useState<string[]>([]);
  const [advantageInput, setAdvantageInput] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");
  const [contentTopics, setContentTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [avoidTopics, setAvoidTopics] = useState<string[]>([]);
  const [avoidTopicInput, setAvoidTopicInput] = useState("");
  const [keyMessages, setKeyMessages] = useState<string[]>([]);
  const [keyMessageInput, setKeyMessageInput] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
  });
  const [contactEmail, setContactEmail] = useState("");
  const [location, setLocation] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  
  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPriceRange, setProductPriceRange] = useState("");
  const [productIsFlagship, setProductIsFlagship] = useState(false);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [csvImportError, setCsvImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing data
  useEffect(() => {
    if (businessContext) {
      setCompanyName(businessContext.companyName || "");
      setTagline(businessContext.tagline || "");
      setDescription(businessContext.description || "");
      setFoundedYear(businessContext.foundedYear);
      setWebsite(businessContext.website || "");
      setIndustry(businessContext.industry || "");
      setNiche(businessContext.niche || "");
      setBusinessModel((businessContext.businessModel as typeof BUSINESS_MODELS[number]["value"]) || "");
      setTargetAudience(businessContext.targetAudience || "");
      setAudiencePainPoints(businessContext.audiencePainPoints || []);
      setAudienceDemographics(businessContext.audienceDemographics || "");
      setBrandVoice((businessContext.brandVoice as typeof BRAND_VOICES[number]["value"]) || "professional");
      setToneAttributes(businessContext.toneAttributes || []);
      setWritingStyle(businessContext.writingStyle || "");
      setUniqueValue(businessContext.uniqueValue || "");
      setCompetitiveAdvantages(businessContext.competitiveAdvantages || []);
      setCompetitors(businessContext.competitors || []);
      setContentTopics(businessContext.contentTopics || []);
      setAvoidTopics(businessContext.avoidTopics || []);
      setKeyMessages(businessContext.keyMessages || []);
      setCallToAction(businessContext.callToAction || "");
      setSocialLinks({
        twitter: businessContext.socialLinks?.twitter || "",
        linkedin: businessContext.socialLinks?.linkedin || "",
        instagram: businessContext.socialLinks?.instagram || "",
        facebook: businessContext.socialLinks?.facebook || "",
        youtube: businessContext.socialLinks?.youtube || "",
        tiktok: businessContext.socialLinks?.tiktok || "",
      });
      setContactEmail(businessContext.contactEmail || "");
      setLocation(businessContext.location || "");
      setAdditionalContext(businessContext.additionalContext || "");
    }
  }, [businessContext]);

  const handleSave = async () => {
    if (!companyName || !description || !industry || !targetAudience) {
      setSaveStatus("error");
      return;
    }
    
    setIsSaving(true);
    try {
      await upsertContext({
        companyName,
        tagline: tagline || undefined,
        description,
        foundedYear,
        website: website || undefined,
        industry,
        niche: niche || undefined,
        businessModel: businessModel || undefined,
        targetAudience,
        audiencePainPoints: audiencePainPoints.length > 0 ? audiencePainPoints : undefined,
        audienceDemographics: audienceDemographics || undefined,
        brandVoice,
        toneAttributes: toneAttributes.length > 0 ? toneAttributes : undefined,
        writingStyle: writingStyle || undefined,
        uniqueValue: uniqueValue || undefined,
        competitiveAdvantages: competitiveAdvantages.length > 0 ? competitiveAdvantages : undefined,
        competitors: competitors.length > 0 ? competitors : undefined,
        contentTopics: contentTopics.length > 0 ? contentTopics : undefined,
        avoidTopics: avoidTopics.length > 0 ? avoidTopics : undefined,
        keyMessages: keyMessages.length > 0 ? keyMessages : undefined,
        callToAction: callToAction || undefined,
        socialLinks: Object.values(socialLinks).some(Boolean) ? socialLinks : undefined,
        contactEmail: contactEmail || undefined,
        location: location || undefined,
        additionalContext: additionalContext || undefined,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProduct = async () => {
    if (!productName || !productDescription) return;
    
    try {
      await addProduct({
        name: productName,
        description: productDescription,
        category: productCategory || undefined,
        priceRange: productPriceRange || undefined,
        isflagship: productIsFlagship || undefined,
      });
      setProductName("");
      setProductDescription("");
      setProductCategory("");
      setProductPriceRange("");
      setProductIsFlagship(false);
      setShowProductForm(false);
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  const handleRemoveProduct = async (index: number) => {
    try {
      await removeProduct({ index });
    } catch (error) {
      console.error("Failed to remove product:", error);
    }
  };

  // CSV Import handler
  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImportingCsv(true);
    setCsvImportError(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV must have a header row and at least one product");
      }

      // Parse header to find column indices
      const header = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
      const nameIndex = header.findIndex(h => h.includes("name") || h.includes("product") || h.includes("item"));
      const descIndex = header.findIndex(h => h.includes("desc") || h.includes("description"));
      const categoryIndex = header.findIndex(h => h.includes("category") || h.includes("type"));
      const priceIndex = header.findIndex(h => h.includes("price") || h.includes("cost"));

      if (nameIndex === -1) {
        throw new Error("CSV must have a 'name' or 'product' column");
      }

      // Parse rows
      const products: { name: string; description: string; category?: string; priceRange?: string }[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        // Handle CSV parsing with quotes
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(cell => 
          cell.replace(/^"|"$/g, "").trim()
        ) || [];
        
        if (row.length === 0 || !row[nameIndex]) continue;

        products.push({
          name: row[nameIndex] || "",
          description: descIndex !== -1 ? (row[descIndex] || row[nameIndex]) : row[nameIndex],
          category: categoryIndex !== -1 ? row[categoryIndex] : undefined,
          priceRange: priceIndex !== -1 ? row[priceIndex] : undefined,
        });
      }

      if (products.length === 0) {
        throw new Error("No valid products found in CSV");
      }

      // Add all products
      for (const product of products) {
        await addProduct({
          name: product.name,
          description: product.description,
          category: product.category,
          priceRange: product.priceRange,
        });
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("CSV import failed:", error);
      setCsvImportError(error instanceof Error ? error.message : "Failed to import CSV");
    } finally {
      setIsImportingCsv(false);
    }
  };

  // Download sample CSV
  const downloadSampleCsv = () => {
    const sample = `name,description,category,price
"Pro Plan","Our flagship subscription for growing businesses","Subscription","$99/month"
"Starter Kit","Everything you need to get started","One-time","$49"
"Enterprise Solution","Custom solutions for large teams","Custom","Contact us"`;
    
    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const steps: { key: Step; label: string; icon: typeof Building2 }[] = [
    { key: "basics", label: "Basics", icon: Building2 },
    { key: "audience", label: "Audience", icon: Users },
    { key: "voice", label: "Voice & Tone", icon: Mic2 },
    { key: "products", label: "Products", icon: Package },
    { key: "content", label: "Content", icon: FileText },
    { key: "social", label: "Social", icon: Share2 },
  ];

  const addToList = (list: string[], setList: (l: string[]) => void, value: string, setValue: (v: string) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setValue("");
    }
  };

  const removeFromList = (list: string[], setList: (l: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
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
        <Building2 className="h-16 w-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Brand Context</h1>
        <p className="text-neutral-400 mb-6">Sign in to set up your business context</p>
        <Link href="/login" className="px-6 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleDismissWelcome}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Gradient header */}
            <div className="relative h-32 bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="relative flex items-center justify-center h-full">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Wand2 className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Personalize Your AI
              </h2>
              <p className="text-neutral-400 text-center mb-6">
                Set up your brand context so all AI-generated content sounds like <span className="text-white font-medium">you</span>.
              </p>
              
              {/* Features */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-xl">
                  <div className="p-2 bg-rose-500/10 rounded-lg shrink-0">
                    <PenTool className="h-5 w-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Your Voice, Every Time</h3>
                    <p className="text-xs text-neutral-500">AI writes in your brand&apos;s unique tone and style</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-xl">
                  <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Audience Aware</h3>
                    <p className="text-xs text-neutral-500">Content tailored to your target customers</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-xl">
                  <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                    <Zap className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Instant Context</h3>
                    <p className="text-xs text-neutral-500">No more repeating yourself to AI tools</p>
                  </div>
                </div>
              </div>
              
              {/* Don't show again checkbox */}
              <label className="flex items-center gap-2 mb-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-neutral-600 rounded peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-colors">
                    {dontShowAgain && <Check className="h-4 w-4 text-white absolute top-0.5 left-0.5" />}
                  </div>
                </div>
                <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
                  Don&apos;t show this again
                </span>
              </label>
              
              {/* CTA Button */}
              <button
                onClick={handleDismissWelcome}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-colors"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-rose-500" />
                  Brand Context
                </h1>
                <p className="text-sm text-neutral-500">Your AI&apos;s knowledge about your business</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                saveStatus === "saved" 
                  ? "bg-green-500/20 text-green-400"
                  : saveStatus === "error"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-rose-500 hover:bg-rose-600 text-white"
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saveStatus === "saved" ? (
                <Check className="h-4 w-4" />
              ) : saveStatus === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Missing required fields" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Completion indicator */}
        {businessContext && (
          <div className="mb-6 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">Profile Completion</span>
              <span className="text-sm font-medium text-white">{businessContext.completionPercentage}%</span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${businessContext.completionPercentage}%` }}
              />
            </div>
            {!businessContext.isComplete && (
              <p className="text-xs text-neutral-500 mt-2">Complete at least 70% to get the best AI results</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {steps.map((step) => (
            <button
              key={step.key}
              onClick={() => setCurrentStep(step.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                currentStep === step.key
                  ? "bg-rose-500 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
              )}
            >
              <step.icon className="h-4 w-4" />
              {step.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          {/* BASICS */}
          {currentStep === "basics" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Company Basics</h2>
                <p className="text-sm text-neutral-500 mb-6">Essential information about your business</p>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-1.5 block">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Acme Inc."
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g., Making the impossible possible"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-1.5 block">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what your company does in 2-3 sentences..."
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-1.5 block">
                      Industry <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={INDUSTRY_OPTIONS.includes(industry as typeof INDUSTRY_OPTIONS[number]) ? industry : "Other"}
                      onChange={(e) => {
                        if (e.target.value === "Other") {
                          setIndustry("");
                        } else {
                          setIndustry(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="" disabled>Select industry</option>
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {/* Custom industry input when "Other" is selected */}
                    {(!INDUSTRY_OPTIONS.includes(industry as typeof INDUSTRY_OPTIONS[number]) || industry === "") && (
                      <input
                        type="text"
                        value={industry === "Other" ? "" : industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="Describe your industry..."
                        className="w-full mt-2 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Niche</label>
                    <input
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="e.g., SaaS for restaurants"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Business Model</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {BUSINESS_MODELS.map((model) => (
                      <button
                        key={model.value}
                        onClick={() => setBusinessModel(model.value)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all",
                          businessModel === model.value
                            ? "bg-rose-500/10 border-rose-500"
                            : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                        )}
                      >
                        <span className="text-sm font-medium text-white">{model.label}</span>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{model.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Founded Year
                    </label>
                    <input
                      type="number"
                      value={foundedYear || ""}
                      onChange={(e) => setFoundedYear(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="e.g., 2020"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AUDIENCE */}
          {currentStep === "audience" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Target Audience</h2>
                <p className="text-sm text-neutral-500 mb-6">Who are you trying to reach?</p>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-1.5 block">
                    Target Audience Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Describe your ideal customer in detail..."
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Demographics</label>
                  <input
                    type="text"
                    value={audienceDemographics}
                    onChange={(e) => setAudienceDemographics(e.target.value)}
                    placeholder="e.g., 25-45 years old, urban professionals, tech-savvy"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Pain Points They Have</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={painPointInput}
                      onChange={(e) => setPainPointInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addToList(audiencePainPoints, setAudiencePainPoints, painPointInput, setPainPointInput)}
                      placeholder="Add a pain point..."
                      className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                    <button
                      onClick={() => addToList(audiencePainPoints, setAudiencePainPoints, painPointInput, setPainPointInput)}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {audiencePainPoints.map((item, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-neutral-800 text-neutral-300 rounded-lg text-sm">
                        {item}
                        <button onClick={() => removeFromList(audiencePainPoints, setAudiencePainPoints, i)} className="text-neutral-500 hover:text-red-400">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VOICE */}
          {currentStep === "voice" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Brand Voice & Tone</h2>
                <p className="text-sm text-neutral-500 mb-6">How should your brand communicate?</p>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-3 block">Primary Brand Voice</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BRAND_VOICES.map((voice) => (
                      <button
                        key={voice.value}
                        onClick={() => setBrandVoice(voice.value)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          brandVoice === voice.value
                            ? "bg-rose-500/10 border-rose-500"
                            : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                        )}
                      >
                        <voice.icon className={cn("h-5 w-5 mb-2", brandVoice === voice.value ? "text-rose-400" : "text-neutral-400")} />
                        <span className="text-sm font-medium text-white block">{voice.label}</span>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{voice.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-3 block">Tone Attributes (select multiple)</label>
                  <div className="flex flex-wrap gap-2">
                    {TONE_ATTRIBUTES.map((attr) => (
                      <button
                        key={attr}
                        onClick={() => {
                          if (toneAttributes.includes(attr)) {
                            setToneAttributes(toneAttributes.filter(a => a !== attr));
                          } else {
                            setToneAttributes([...toneAttributes, attr]);
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                          toneAttributes.includes(attr)
                            ? "bg-rose-500 text-white"
                            : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                        )}
                      >
                        {attr}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Additional Writing Style Notes</label>
                  <textarea
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    placeholder="Any specific style preferences or guidelines..."
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {currentStep === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Products & Services</h2>
                  <p className="text-sm text-neutral-500">What do you offer? Add manually or import from CSV.</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* CSV Import */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCsvImport}
                    className="hidden"
                  />
                  <button
                    onClick={downloadSampleCsv}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors text-sm"
                    title="Download sample CSV template"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Template</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImportingCsv}
                    className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors text-sm"
                  >
                    {isImportingCsv ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Import CSV</span>
                  </button>
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                </div>
              </div>
              
              {/* CSV Import Error */}
              {csvImportError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{csvImportError}</p>
                  <button 
                    onClick={() => setCsvImportError(null)}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Product Form */}
              {showProductForm && (
                <div className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Product Name</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g., Pro Plan"
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Category</label>
                      <input
                        type="text"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        placeholder="e.g., Subscription"
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Description</label>
                    <textarea
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      placeholder="Describe this product/service..."
                      rows={2}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productIsFlagship}
                        onChange={(e) => setProductIsFlagship(e.target.checked)}
                        className="rounded bg-neutral-800 border-neutral-700"
                      />
                      <Star className="h-4 w-4 text-yellow-400" />
                      Flagship Product
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => setShowProductForm(false)} className="px-3 py-1.5 text-neutral-400 hover:text-white text-sm">Cancel</button>
                      <button onClick={handleAddProduct} className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm">Add</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Products List */}
              <div className="space-y-3">
                {businessContext?.products?.map((product, i) => (
                  <div key={i} className="flex items-start justify-between p-4 bg-neutral-800/50 border border-neutral-700 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{product.name}</span>
                        {product.isflagship && <Star className="h-4 w-4 text-yellow-400" />}
                        {product.category && <span className="text-xs px-2 py-0.5 bg-neutral-700 text-neutral-400 rounded">{product.category}</span>}
                      </div>
                      <p className="text-sm text-neutral-400 mt-1">{product.description}</p>
                    </div>
                    <button onClick={() => handleRemoveProduct(i)} className="p-1 text-neutral-500 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {(!businessContext?.products || businessContext.products.length === 0) && !showProductForm && (
                  <div className="text-center py-8 text-neutral-500">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No products added yet</p>
                  </div>
                )}
              </div>

              {/* Unique Value */}
              <div>
                <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Unique Value Proposition</label>
                <textarea
                  value={uniqueValue}
                  onChange={(e) => setUniqueValue(e.target.value)}
                  placeholder="What makes you different from competitors?"
                  rows={2}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300 mb-2 block">Competitive Advantages</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={advantageInput}
                    onChange={(e) => setAdvantageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addToList(competitiveAdvantages, setCompetitiveAdvantages, advantageInput, setAdvantageInput)}
                    placeholder="Add an advantage..."
                    className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                  <button onClick={() => addToList(competitiveAdvantages, setCompetitiveAdvantages, advantageInput, setAdvantageInput)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {competitiveAdvantages.map((item, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-sm">
                      {item}
                      <button onClick={() => removeFromList(competitiveAdvantages, setCompetitiveAdvantages, i)} className="text-green-500/50 hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300 mb-2 block">Main Competitors</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addToList(competitors, setCompetitors, competitorInput, setCompetitorInput)}
                    placeholder="Add a competitor..."
                    className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                  <button onClick={() => addToList(competitors, setCompetitors, competitorInput, setCompetitorInput)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {competitors.map((item, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-neutral-800 text-neutral-300 rounded-lg text-sm">
                      {item}
                      <button onClick={() => removeFromList(competitors, setCompetitors, i)} className="text-neutral-500 hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTENT */}
          {currentStep === "content" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Content Guidelines</h2>
                <p className="text-sm text-neutral-500 mb-6">What should your content focus on?</p>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Topics to Cover</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addToList(contentTopics, setContentTopics, topicInput, setTopicInput)}
                      placeholder="Add a topic..."
                      className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                    <button onClick={() => addToList(contentTopics, setContentTopics, topicInput, setTopicInput)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contentTopics.map((item, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-sm">
                        {item}
                        <button onClick={() => removeFromList(contentTopics, setContentTopics, i)} className="text-rose-400/50 hover:text-red-400">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Topics to Avoid</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={avoidTopicInput}
                      onChange={(e) => setAvoidTopicInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addToList(avoidTopics, setAvoidTopics, avoidTopicInput, setAvoidTopicInput)}
                      placeholder="Add topic to avoid..."
                      className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                    <button onClick={() => addToList(avoidTopics, setAvoidTopics, avoidTopicInput, setAvoidTopicInput)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {avoidTopics.map((item, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-sm">
                        {item}
                        <button onClick={() => removeFromList(avoidTopics, setAvoidTopics, i)} className="text-red-400/50 hover:text-red-400">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Key Messages to Reinforce</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={keyMessageInput}
                      onChange={(e) => setKeyMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addToList(keyMessages, setKeyMessages, keyMessageInput, setKeyMessageInput)}
                      placeholder="Add a key message..."
                      className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                    <button onClick={() => addToList(keyMessages, setKeyMessages, keyMessageInput, setKeyMessageInput)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keyMessages.map((item, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                        {item}
                        <button onClick={() => removeFromList(keyMessages, setKeyMessages, i)} className="text-blue-400/50 hover:text-red-400">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Default Call-to-Action</label>
                  <input
                    type="text"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    placeholder="e.g., Start your free trial, Schedule a demo"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Additional Context for AI</label>
                  <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="Any other information the AI should know when creating content..."
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SOCIAL */}
          {currentStep === "social" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Social & Contact</h2>
                <p className="text-sm text-neutral-500 mb-6">Your online presence</p>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Twitter/X</label>
                    <input
                      type="text"
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                      placeholder="@username or URL"
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-1.5 block">LinkedIn</label>
                    <input
                      type="text"
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                      placeholder="Company page URL"
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Instagram</label>
                    <input
                      type="text"
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                      placeholder="@username"
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Facebook</label>
                    <input
                      type="text"
                      value={socialLinks.facebook}
                      onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                      placeholder="Page URL"
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-1.5 block">YouTube</label>
                    <input
                      type="text"
                      value={socialLinks.youtube}
                      onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                      placeholder="Channel URL"
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-1.5 block">TikTok</label>
                    <input
                      type="text"
                      value={socialLinks.tiktok}
                      onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                      placeholder="@username"
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="hello@example.com"
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., San Francisco, CA"
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-neutral-800">
            <button
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.key === currentStep);
                if (currentIndex > 0) setCurrentStep(steps[currentIndex - 1].key);
              }}
              disabled={currentStep === "basics"}
              className="px-4 py-2 text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.key === currentStep);
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1].key);
                } else {
                  handleSave();
                }
              }}
              className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
            >
              {currentStep === "social" ? "Save" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
