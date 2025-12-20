"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Wine,
  Wheat,
  Square,
  Croissant,
  UtensilsCrossed,
  Palmtree,
  Beer,
  Fish,
  Flame,
  Beef,
  Pizza,
  Coffee,
  Download,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Palette,
  Type,
  FileText,
  Image,
  Wand2,
  Loader2,
  Check,
  Copy,
  Trash2,
  Clock,
  Zap,
  Settings2,
  Star,
  Snowflake,
  Sun,
  Leaf,
  Heart,
  Ghost,
  Gift,
  TreeDeciduous,
  Moon,
  Share2,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { StarButton } from "@/components/ui/star-button";

// Types
interface MenuStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
  previewColor: string;
}

interface AspectRatio {
  id: string;
  name: string;
  description: string;
}

interface ColorScheme {
  id: string;
  name: string;
  description: string;
  colors: { primary: string; secondary: string; accent: string; background: string } | null;
}

interface TypographyStyle {
  id: string;
  name: string;
  description: string;
}

interface SeasonalTheme {
  id: string;
  name: string;
  description: string;
}

interface DietaryLabel {
  id: string;
  symbol: string;
  name: string;
  color: string;
}

interface SocialPreset {
  id: string;
  name: string;
  ratio: string;
  description: string;
}

interface MenuTemplate {
  id: string;
  name: string;
  description: string;
  restaurantName: string;
  cuisine: string;
  priceRange: string;
  suggestedStyle: string;
  content: string;
}

interface MenuConfig {
  styles: MenuStyle[];
  aspectRatios: AspectRatio[];
  colorSchemes: ColorScheme[];
  typographyStyles: TypographyStyle[];
  seasonalThemes: SeasonalTheme[];
  dietaryLabels: DietaryLabel[];
  socialPresets: SocialPreset[];
  templates: MenuTemplate[];
}

interface GeneratedMenu {
  id: string;
  image: string;
  restaurantName: string;
  style: string;
  timestamp: number;
}

// Icon mapping
type LucideIcon = React.ComponentType<{ className?: string }>;
const STYLE_ICONS: Record<string, LucideIcon> = {
  wine: Wine,
  wheat: Wheat,
  square: Square,
  croissant: Croissant,
  utensils: UtensilsCrossed,
  palmtree: Palmtree,
  beer: Beer,
  fish: Fish,
  flame: Flame,
  beef: Beef,
  pizza: Pizza,
  coffee: Coffee,
  zap: Zap,
  star: Star,
  leaf: Leaf,
  moon: Moon,
};

const SEASONAL_ICONS: Record<string, LucideIcon> = {
  christmas: Gift,
  thanksgiving: TreeDeciduous,
  valentines: Heart,
  halloween: Ghost,
  spring: Leaf,
  summer: Sun,
  fall: TreeDeciduous,
  winter: Snowflake,
  newYear: Sparkles,
  stPatricks: Leaf,
  easter: Star,
  july4th: Star,
  none: Square,
};

const SAMPLE_MENU = `STARTERS
Crispy Calamari - Lemon aioli, marinara - $14
Bruschetta Trio - Tomato basil, olive tapenade, ricotta (V) - $12
Soup of the Day - Chef's selection - $8

MAINS
Grilled Salmon (GF) - Herb butter, seasonal vegetables - $32
Filet Mignon (GF) - Red wine reduction, truffle mash - $45
Mushroom Risotto (V)(GF) - Parmesan, fresh herbs - $24
Pan-Seared Duck - Cherry glaze, roasted potatoes - $38

DESSERTS
Tiramisu - House-made, espresso - $10
Crème Brûlée (GF) - Madagascar vanilla - $9
Chocolate Lava Cake - Vanilla gelato - $11`;

// Tab Component
function TabButton({
  active,
  onClick,
  children,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: LucideIcon;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-rose-500 text-white"
          : "text-neutral-400 hover:text-white hover:bg-neutral-800"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-rose-500" />
          <span className="font-medium text-white">{title}</span>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-neutral-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Style Card Component
function StyleCard({
  style,
  isSelected,
  onClick,
}: {
  style: MenuStyle;
  isSelected: boolean;
  onClick: () => void;
}) {
  const IconComponent = STYLE_ICONS[style.icon] || UtensilsCrossed;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-xl border text-left transition-all overflow-hidden group",
        isSelected
          ? "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20"
          : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/50"
      )}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${style.previewColor}40 0%, transparent 60%)`,
        }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              isSelected ? "bg-rose-500/20" : "bg-neutral-800"
            )}
          >
            <IconComponent
              className={cn(
                "h-4 w-4",
                isSelected ? "text-rose-400" : "text-neutral-400"
              )}
            />
          </div>
          {isSelected && <Check className="h-4 w-4 text-rose-500 ml-auto" />}
        </div>
        <div className="font-medium text-white text-sm">{style.name}</div>
        <div className="text-xs text-neutral-500 mt-1 line-clamp-2">
          {style.description}
        </div>
      </div>
    </motion.button>
  );
}

// Color Scheme Card Component
function ColorSchemeCard({
  scheme,
  isSelected,
  onClick,
}: {
  scheme: ColorScheme;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colorValues = scheme.colors ? Object.values(scheme.colors) : [];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl border text-left transition-all",
        isSelected
          ? "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20"
          : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/50"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {scheme.colors ? (
          <div className="flex -space-x-1">
            {colorValues.slice(0, 4).map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-neutral-700"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-purple-500" />
        )}
        {isSelected && <Check className="h-4 w-4 text-rose-500 ml-auto" />}
      </div>
      <div className="font-medium text-white text-sm">{scheme.name}</div>
      <div className="text-xs text-neutral-500 mt-0.5">{scheme.description}</div>
    </motion.button>
  );
}

// Template Card Component
function TemplateCard({
  template,
  onClick,
}: {
  template: MenuTemplate;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 rounded-xl border border-neutral-800 hover:border-rose-500/50 bg-neutral-900/50 text-left transition-all group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-white">{template.name}</span>
        <Zap className="h-4 w-4 text-neutral-500 group-hover:text-rose-500 transition-colors" />
      </div>
      <p className="text-xs text-neutral-500 mb-2">{template.description}</p>
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
          {template.cuisine}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
          {template.priceRange}
        </span>
      </div>
    </motion.button>
  );
}

// Dietary Label Chip
function DietaryChip({
  label,
  isSelected,
  onClick,
}: {
  label: DietaryLabel;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        isSelected
          ? "ring-2 ring-rose-500/50"
          : "opacity-70 hover:opacity-100"
      )}
      style={{
        backgroundColor: `${label.color}20`,
        color: label.color,
        borderColor: isSelected ? label.color : "transparent",
      }}
    >
      <span>{label.symbol}</span>
      <span>{label.name}</span>
      {isSelected && <Check className="h-3 w-3" />}
    </button>
  );
}

// History Item Component
function HistoryItem({
  menu,
  onLoad,
  onDelete,
}: {
  menu: GeneratedMenu;
  onLoad: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 transition-colors group">
      <img
        src={menu.image}
        alt={menu.restaurantName}
        className="w-12 h-16 object-cover rounded-lg border border-neutral-700"
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-sm truncate">
          {menu.restaurantName}
        </div>
        <div className="text-xs text-neutral-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(menu.timestamp).toLocaleDateString()}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onLoad}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-400 hover:text-red-300"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Variation Gallery
function VariationGallery({
  variations,
  selectedIndex,
  onSelect,
}: {
  variations: Array<{ image: string; message: string }>;
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  if (variations.length <= 1) return null;

  return (
    <div className="flex gap-2 p-2 bg-neutral-900 rounded-lg">
      {variations.map((v, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={cn(
            "relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all",
            selectedIndex === i
              ? "border-rose-500 ring-2 ring-rose-500/30"
              : "border-neutral-700 hover:border-neutral-600"
          )}
        >
          <img src={v.image} alt={`Variation ${i + 1}`} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs text-center py-0.5">
            #{i + 1}
          </div>
        </button>
      ))}
    </div>
  );
}

// Main Component
export function MenuImageMaker() {
  // Config state
  const [config, setConfig] = useState<MenuConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"design" | "content" | "export">("content");

  // Form state
  const [restaurantName, setRestaurantName] = useState("");
  const [tagline, setTagline] = useState("");
  const [menuItems, setMenuItems] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [selectedRatio, setSelectedRatio] = useState("3:4");
  const [selectedColorScheme, setSelectedColorScheme] = useState("default");
  const [selectedTypography, setSelectedTypography] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState("none");
  const [cuisine, setCuisine] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [includeDecorations, setIncludeDecorations] = useState(true);
  const [showDietaryLegend, setShowDietaryLegend] = useState(false);
  const [paperTexture, setPaperTexture] = useState("");
  const [logoDescription, setLogoDescription] = useState("");
  const [menuType, setMenuType] = useState("");
  const [language, setLanguage] = useState("english");
  const [featuredItems, setFeaturedItems] = useState<string[]>([]);
  const [newFeaturedItem, setNewFeaturedItem] = useState("");
  const [generateVariations, setGenerateVariations] = useState(1);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [variations, setVariations] = useState<Array<{ image: string; message: string }>>([]);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<GeneratedMenu[]>([]);

  // Fetch config on mount
  useEffect(() => {
    fetch("/api/ai/menu-image")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("menuHistory");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = useCallback((menu: GeneratedMenu) => {
    setHistory((prev) => {
      const updated = [menu, ...prev].slice(0, 20);
      localStorage.setItem("menuHistory", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem("menuHistory", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleGenerate = async () => {
    if (!restaurantName.trim() || !menuItems.trim()) {
      setError("Please enter a restaurant name and menu items");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setVariations([]);
    setSelectedVariation(0);

    try {
      const response = await fetch("/api/ai/menu-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName,
          tagline,
          menuItems,
          style: selectedStyle,
          aspectRatio: selectedRatio,
          colorScheme: selectedColorScheme,
          typography: selectedTypography,
          seasonalTheme: selectedSeason,
          cuisine: cuisine || undefined,
          priceRange: priceRange || undefined,
          additionalInstructions: additionalInstructions || undefined,
          includeDecorations,
          showDietaryLegend,
          paperTexture: paperTexture || undefined,
          logoDescription: logoDescription || undefined,
          menuType: menuType || undefined,
          language: language !== "english" ? language : undefined,
          featuredItems: featuredItems.length > 0 ? featuredItems : undefined,
          generateVariations,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate menu image");
      }

      setGeneratedImage(data.image);
      setGeneratedPrompt(data.prompt);

      if (data.variations) {
        setVariations(data.variations);
      }

      // Save to history
      saveToHistory({
        id: Date.now().toString(),
        image: data.image,
        restaurantName,
        style: selectedStyle,
        timestamp: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (format: "png" | "jpg" = "png") => {
    const imageToDownload = variations.length > 0 ? variations[selectedVariation]?.image : generatedImage;
    if (!imageToDownload) return;

    const link = document.createElement("a");
    link.href = imageToDownload;
    link.download = `${restaurantName.replace(/\s+/g, "-").toLowerCase()}-menu.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyImage = async () => {
    const imageToCopy = variations.length > 0 ? variations[selectedVariation]?.image : generatedImage;
    if (!imageToCopy) return;

    try {
      const response = await fetch(imageToCopy);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch (err) {
      console.error("Failed to copy image:", err);
    }
  };

  const loadSampleMenu = () => {
    setRestaurantName("The Golden Fork");
    setMenuItems(SAMPLE_MENU);
    setCuisine("Contemporary American");
    setPriceRange("$$$");
    setTagline("Farm to Table Excellence");
  };

  const loadTemplate = (template: MenuTemplate) => {
    setRestaurantName(template.restaurantName);
    setMenuItems(template.content);
    setCuisine(template.cuisine);
    setPriceRange(template.priceRange);
    setSelectedStyle(template.suggestedStyle);
  };

  const loadFromHistory = (menu: GeneratedMenu) => {
    setGeneratedImage(menu.image);
    setRestaurantName(menu.restaurantName);
    setSelectedStyle(menu.style);
  };

  const addFeaturedItem = () => {
    if (newFeaturedItem.trim() && !featuredItems.includes(newFeaturedItem.trim())) {
      setFeaturedItems([...featuredItems, newFeaturedItem.trim()]);
      setNewFeaturedItem("");
    }
  };

  const removeFeaturedItem = (item: string) => {
    setFeaturedItems(featuredItems.filter((i) => i !== item));
  };

  const applySocialPreset = (preset: SocialPreset) => {
    setSelectedRatio(preset.ratio);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  const currentImage = variations.length > 0 ? variations[selectedVariation]?.image : generatedImage;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-red-600">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Menu Image Maker</h1>
            <p className="text-neutral-400">
              Create stunning menus with AI - 16 styles, 15 color schemes, seasonal themes & more
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4 p-1 bg-neutral-900 rounded-xl w-fit">
          <TabButton
            active={activeTab === "content"}
            onClick={() => setActiveTab("content")}
            icon={FileText}
          >
            Content
          </TabButton>
          <TabButton
            active={activeTab === "design"}
            onClick={() => setActiveTab("design")}
            icon={Palette}
          >
            Design
          </TabButton>
          <TabButton
            active={activeTab === "export"}
            onClick={() => setActiveTab("export")}
            icon={Share2}
          >
            Export & Advanced
          </TabButton>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left Column - Form (3 cols) */}
        <div className="xl:col-span-3 space-y-4">
          {/* Content Tab */}
          {activeTab === "content" && (
            <>
              {/* Quick Start Templates */}
              <CollapsibleSection title="Quick Start Templates" icon={Zap} defaultOpen={!restaurantName} badge={`${config?.templates.length || 0} templates`}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {config?.templates.map((template) => (
                    <TemplateCard key={template.id} template={template} onClick={() => loadTemplate(template)} />
                  ))}
                </div>
              </CollapsibleSection>

              {/* Restaurant Info */}
              <CollapsibleSection title="Restaurant Information" icon={FileText}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="restaurantName" className="text-neutral-300">Restaurant Name</Label>
                        <Button variant="ghost" size="sm" onClick={loadSampleMenu} className="text-xs text-neutral-400 hover:text-white">
                          Load Sample
                        </Button>
                      </div>
                      <Input
                        id="restaurantName"
                        placeholder="e.g., The Golden Fork"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tagline" className="text-neutral-300">Tagline (optional)</Label>
                      <Input
                        id="tagline"
                        placeholder="e.g., Farm to Table Excellence"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cuisine" className="text-neutral-300">Cuisine Type</Label>
                      <Input
                        id="cuisine"
                        placeholder="e.g., Italian, Japanese"
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceRange" className="text-neutral-300">Price Range</Label>
                      <Input
                        id="priceRange"
                        placeholder="e.g., $$, $$$"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="menuItems" className="text-neutral-300">Menu Items</Label>
                    <Textarea
                      id="menuItems"
                      placeholder={`Enter menu items with dietary labels...

STARTERS
Bruschetta (V) - Fresh tomatoes, basil - $12

MAINS
Grilled Salmon (GF) - Herb butter - $28`}
                      value={menuItems}
                      onChange={(e) => setMenuItems(e.target.value)}
                      className="min-h-[250px] font-mono text-sm bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                    />
                    <p className="text-xs text-neutral-500">
                      Use (V) Vegetarian, (VG) Vegan, (GF) Gluten-Free, (DF) Dairy-Free, or any emoji icons in your menu
                    </p>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Featured Items */}
              <CollapsibleSection title="Featured Items" icon={Star} defaultOpen={false}>
                <div className="space-y-3">
                  <p className="text-sm text-neutral-400">Highlight special dishes with badges or decorations</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter item name to highlight"
                      value={newFeaturedItem}
                      onChange={(e) => setNewFeaturedItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addFeaturedItem()}
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                    <Button onClick={addFeaturedItem} variant="outline">Add</Button>
                  </div>
                  {featuredItems.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {featuredItems.map((item) => (
                        <span key={item} className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">
                          <Star className="h-3 w-3" />
                          {item}
                          <button onClick={() => removeFeaturedItem(item)} className="ml-1 hover:text-white">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            </>
          )}

          {/* Design Tab */}
          {activeTab === "design" && (
            <>
              {/* Style Selection */}
              <CollapsibleSection title="Menu Style" icon={Palette} badge={`${config?.styles.length || 0} styles`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {config?.styles.map((style) => (
                    <StyleCard
                      key={style.id}
                      style={style}
                      isSelected={selectedStyle === style.id}
                      onClick={() => setSelectedStyle(style.id)}
                    />
                  ))}
                </div>
              </CollapsibleSection>

              {/* Color Scheme */}
              <CollapsibleSection title="Color Scheme" icon={Palette} badge={`${config?.colorSchemes.length || 0} schemes`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {config?.colorSchemes.map((scheme) => (
                    <ColorSchemeCard
                      key={scheme.id}
                      scheme={scheme}
                      isSelected={selectedColorScheme === scheme.id}
                      onClick={() => setSelectedColorScheme(scheme.id)}
                    />
                  ))}
                </div>
              </CollapsibleSection>

              {/* Typography */}
              <CollapsibleSection title="Typography Style" icon={Type} defaultOpen={false}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {config?.typographyStyles.map((typo) => (
                    <motion.button
                      key={typo.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTypography(selectedTypography === typo.id ? null : typo.id)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        selectedTypography === typo.id
                          ? "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20"
                          : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white text-sm">{typo.name}</span>
                        {selectedTypography === typo.id && <Check className="h-4 w-4 text-rose-500" />}
                      </div>
                      <p className="text-xs text-neutral-500">{typo.description}</p>
                    </motion.button>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Seasonal Themes */}
              <CollapsibleSection title="Seasonal Theme" icon={Gift} defaultOpen={false} badge="12 themes">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {config?.seasonalThemes.map((theme) => {
                    const IconComp = SEASONAL_ICONS[theme.id] || Square;
                    return (
                      <motion.button
                        key={theme.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSeason(theme.id)}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all",
                          selectedSeason === theme.id
                            ? "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20"
                            : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/50"
                        )}
                      >
                        <IconComp className={cn("h-5 w-5 mx-auto mb-1", selectedSeason === theme.id ? "text-rose-400" : "text-neutral-400")} />
                        <span className="text-xs text-white">{theme.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </CollapsibleSection>
            </>
          )}

          {/* Export Tab */}
          {activeTab === "export" && (
            <>
              {/* Aspect Ratio */}
              <CollapsibleSection title="Size & Format" icon={LayoutGrid}>
                <div className="space-y-4">
                  <div>
                    <Label className="text-neutral-300 mb-2 block">Quick Presets</Label>
                    <div className="flex flex-wrap gap-2">
                      {config?.socialPresets?.map((preset) => (
                        <Button
                          key={preset.id}
                          variant="outline"
                          size="sm"
                          onClick={() => applySocialPreset(preset)}
                          className={cn(
                            "text-xs",
                            selectedRatio === preset.ratio && "border-rose-500 bg-rose-500/10"
                          )}
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-neutral-300 mb-2 block">Aspect Ratio</Label>
                    <div className="flex flex-wrap gap-2">
                      {config?.aspectRatios.map((ratio) => (
                        <motion.button
                          key={ratio.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedRatio(ratio.id)}
                          className={cn(
                            "px-4 py-2 rounded-xl border text-sm transition-all",
                            selectedRatio === ratio.id
                              ? "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20"
                              : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/50"
                          )}
                        >
                          <span className="font-medium text-white">{ratio.id}</span>
                          <span className="text-neutral-500 ml-2">{ratio.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Generate Variations */}
              <CollapsibleSection title="Multiple Variations" icon={Layers} defaultOpen={false}>
                <div className="space-y-3">
                  <p className="text-sm text-neutral-400">Generate multiple unique designs to choose from</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        size="sm"
                        onClick={() => setGenerateVariations(num)}
                        className={cn(generateVariations === num && "border-rose-500 bg-rose-500/10")}
                      >
                        {num} {num === 1 ? "Image" : "Images"}
                      </Button>
                    ))}
                  </div>
                  {generateVariations > 1 && (
                    <p className="text-xs text-amber-400">Generating {generateVariations} variations will take longer</p>
                  )}
                </div>
              </CollapsibleSection>

              {/* Advanced Options */}
              <CollapsibleSection title="Advanced Options" icon={Settings2} defaultOpen={false}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50">
                      <div>
                        <Label className="text-neutral-300">Decorations</Label>
                        <p className="text-xs text-neutral-500">Dividers & illustrations</p>
                      </div>
                      <button
                        onClick={() => setIncludeDecorations(!includeDecorations)}
                        className={cn("w-12 h-6 rounded-full transition-colors", includeDecorations ? "bg-rose-500" : "bg-neutral-700")}
                      >
                        <motion.div animate={{ x: includeDecorations ? 24 : 2 }} className="w-5 h-5 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50">
                      <div>
                        <Label className="text-neutral-300">Dietary Legend</Label>
                        <p className="text-xs text-neutral-500">Show symbol key</p>
                      </div>
                      <button
                        onClick={() => setShowDietaryLegend(!showDietaryLegend)}
                        className={cn("w-12 h-6 rounded-full transition-colors", showDietaryLegend ? "bg-rose-500" : "bg-neutral-700")}
                      >
                        <motion.div animate={{ x: showDietaryLegend ? 24 : 2 }} className="w-5 h-5 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-neutral-300">Paper Texture</Label>
                      <Input
                        placeholder="e.g., linen, marble, kraft"
                        value={paperTexture}
                        onChange={(e) => setPaperTexture(e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-300">Menu Type</Label>
                      <Input
                        placeholder="e.g., Dinner, Brunch, Drinks"
                        value={menuType}
                        onChange={(e) => setMenuType(e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-neutral-300">Logo Description</Label>
                      <Input
                        placeholder="e.g., Fork with vine leaves"
                        value={logoDescription}
                        onChange={(e) => setLogoDescription(e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-300">Language Style</Label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white"
                      >
                        <option value="english">English</option>
                        <option value="french">French</option>
                        <option value="italian">Italian</option>
                        <option value="spanish">Spanish</option>
                        <option value="japanese">Japanese</option>
                        <option value="chinese">Chinese</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-neutral-300">Custom Instructions</Label>
                    <Textarea
                      placeholder="Any specific requirements..."
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      className="min-h-[80px] bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                </div>
              </CollapsibleSection>
            </>
          )}

          {/* Generate Button */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="flex justify-center">
            <StarButton
              onClick={handleGenerate}
              disabled={isGenerating}
              className="h-12 px-8"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Generate Menu
                </span>
              )}
            </StarButton>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </motion.div>
          )}
        </div>

        {/* Right Column - Preview (2 cols) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="sticky top-4 space-y-4">
            {/* Preview */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-rose-500" />
                  <span className="font-medium text-white">Preview</span>
                </div>
                {currentImage && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCopyImage} className="text-neutral-400 hover:text-white">
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload("png")} className="text-neutral-400 hover:text-white">
                      <Download className="h-4 w-4 mr-1" />
                      PNG
                    </Button>
                  </div>
                )}
              </div>

              {/* Variation Gallery */}
              {variations.length > 1 && (
                <div className="px-4 py-2 border-b border-neutral-800">
                  <VariationGallery
                    variations={variations}
                    selectedIndex={selectedVariation}
                    onSelect={setSelectedVariation}
                  />
                </div>
              )}

              <div
                className={cn(
                  "relative flex items-center justify-center overflow-hidden bg-neutral-950",
                  selectedRatio === "3:4" && "aspect-[3/4]",
                  selectedRatio === "4:3" && "aspect-[4/3]",
                  selectedRatio === "1:1" && "aspect-square",
                  selectedRatio === "9:16" && "aspect-[9/16] max-h-[500px]",
                  selectedRatio === "16:9" && "aspect-video",
                  selectedRatio === "2:3" && "aspect-[2/3]",
                  selectedRatio === "4:5" && "aspect-[4/5]",
                  selectedRatio === "21:9" && "aspect-[21/9]"
                )}
              >
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-8">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-4">
                        <Sparkles className="w-16 h-16 mx-auto text-rose-500" />
                      </motion.div>
                      <p className="text-neutral-300 font-medium">
                        {generateVariations > 1 ? `Creating ${generateVariations} variations...` : "Creating your menu design..."}
                      </p>
                      <p className="text-xs text-neutral-500 mt-2">This usually takes {generateVariations > 1 ? "30-60" : "15-30"} seconds</p>
                      <div className="mt-4 flex justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div key={i} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} className="w-2 h-2 rounded-full bg-rose-500" />
                        ))}
                      </div>
                    </motion.div>
                  ) : currentImage ? (
                    <motion.img key="image" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} src={currentImage} alt="Generated menu" className="w-full h-full object-contain" />
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-8">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-neutral-800 flex items-center justify-center">
                        <UtensilsCrossed className="w-10 h-10 text-neutral-600" />
                      </div>
                      <p className="text-neutral-400 font-medium">Your menu preview will appear here</p>
                      <p className="text-xs text-neutral-600 mt-2">Fill in the details and click Generate</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
                  <Clock className="h-4 w-4 text-rose-500" />
                  <span className="font-medium text-white">Recent Menus</span>
                  <span className="text-xs text-neutral-500">({history.length})</span>
                </div>
                <div className="p-2 max-h-[250px] overflow-y-auto">
                  {history.map((menu) => (
                    <HistoryItem key={menu.id} menu={menu} onLoad={() => loadFromHistory(menu)} onDelete={() => deleteFromHistory(menu.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Debug */}
            {generatedPrompt && (
              <details className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
                <summary className="px-4 py-3 text-sm text-neutral-400 cursor-pointer hover:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View Generated Prompt
                </summary>
                <pre className="p-4 text-xs text-neutral-500 whitespace-pre-wrap overflow-auto max-h-[200px] border-t border-neutral-800">
                  {generatedPrompt}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
