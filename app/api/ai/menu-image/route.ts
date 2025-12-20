import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const IMAGE_MODEL = "google/gemini-3-pro-image-preview";

// Menu style presets with optimized prompts
export const MENU_STYLES = {
  elegant: {
    name: "Elegant Fine Dining",
    description: "Sophisticated, minimalist design with serif typography",
    icon: "wine",
    previewColor: "#1a1a1a",
    promptEnhancement: `Style: Elegant fine dining menu with sophisticated minimalist design. 
Use classic serif typography (like Garamond or Didot), generous white space, subtle gold or champagne accents.
Clean lines, cream or ivory paper texture background.
Professional food photography quality presentation.
Luxurious yet understated aesthetic.`,
  },
  rustic: {
    name: "Rustic Farm-to-Table",
    description: "Warm, natural textures with handwritten elements",
    icon: "wheat",
    previewColor: "#8B4513",
    promptEnhancement: `Style: Rustic farm-to-table menu with warm, organic aesthetic.
Kraft paper or wood texture background, handwritten or chalk-style typography.
Natural earth tones (browns, greens, warm whites), hand-illustrated botanical elements.
Vintage-inspired design with authentic, homemade feel.
Include subtle textures like linen or burlap.`,
  },
  modern: {
    name: "Modern Minimalist",
    description: "Clean, bold typography with striking contrast",
    icon: "square",
    previewColor: "#000000",
    promptEnhancement: `Style: Modern minimalist menu with bold, contemporary design.
Sans-serif typography (like Helvetica, Futura, or Montserrat), high contrast black and white with one accent color.
Grid-based layout, ample negative space.
Clean geometric shapes, crisp edges.
Magazine-quality editorial aesthetic.`,
  },
  bistro: {
    name: "French Bistro",
    description: "Classic Parisian cafe style with vintage charm",
    icon: "croissant",
    previewColor: "#722F37",
    promptEnhancement: `Style: Classic French bistro menu with Parisian charm.
Art deco or art nouveau inspired typography, vintage illustration style.
Deep reds, navy blues, gold accents on cream background.
Ornate borders and decorative flourishes.
Chalkboard-style elements optional.`,
  },
  asian: {
    name: "Contemporary Asian",
    description: "Zen-inspired with brush stroke elements",
    icon: "utensils",
    previewColor: "#8B0000",
    promptEnhancement: `Style: Contemporary Asian-inspired menu design.
Balance of traditional and modern elements, brush stroke calligraphy accents.
Minimalist zen aesthetic with intentional asymmetry.
Natural materials suggested (bamboo, rice paper texture).
Red and black with gold accents, or muted earth tones.`,
  },
  tropical: {
    name: "Tropical Paradise",
    description: "Vibrant, fresh with botanical illustrations",
    icon: "palmtree",
    previewColor: "#00A86B",
    promptEnhancement: `Style: Tropical paradise menu with vibrant, fresh aesthetic.
Bold tropical colors (coral, turquoise, palm green), botanical leaf illustrations.
Playful yet sophisticated typography.
Beach club or resort luxury feel.
Hand-painted watercolor elements, monstera and palm motifs.`,
  },
  industrial: {
    name: "Industrial Craft",
    description: "Urban brewery/gastropub style",
    icon: "beer",
    previewColor: "#36454F",
    promptEnhancement: `Style: Industrial craft menu for brewpubs and gastropubs.
Exposed materials aesthetic - concrete, metal, reclaimed wood textures.
Bold stencil or industrial sans-serif typography.
Dark moody palette with copper or brass accents.
Vintage industrial illustrations, craft beer aesthetic.`,
  },
  coastal: {
    name: "Coastal Seafood",
    description: "Fresh nautical theme with oceanic elements",
    icon: "fish",
    previewColor: "#1E90FF",
    promptEnhancement: `Style: Coastal seafood restaurant menu design.
Ocean blues, sandy beiges, weathered white.
Nautical rope borders, anchor motifs, fish illustrations.
Clean maritime typography, lighthouse or wave elements.
Fresh, breezy seaside atmosphere.`,
  },
  mexican: {
    name: "Vibrant Mexican",
    description: "Bold colors, folk art patterns, festive feel",
    icon: "flame",
    previewColor: "#FF6B35",
    promptEnhancement: `Style: Vibrant Mexican cantina menu design.
Bold, saturated colors (orange, pink, turquoise, yellow), traditional folk art patterns.
Hand-painted tile or papel picado inspired borders.
Festive, warm, celebratory atmosphere.
Include sugar skull or floral motifs if appropriate.`,
  },
  steakhouse: {
    name: "Classic Steakhouse",
    description: "Dark, masculine, leather-bound aesthetic",
    icon: "beef",
    previewColor: "#2F1810",
    promptEnhancement: `Style: Classic American steakhouse menu design.
Dark, rich colors (burgundy, forest green, black), leather or wood texture.
Traditional serif typography with gold embossing effect.
Sophisticated, masculine aesthetic.
Vintage illustration of cuts of meat optional.`,
  },
  italian: {
    name: "Tuscan Italian",
    description: "Warm terracotta, olive green, rustic elegance",
    icon: "pizza",
    previewColor: "#CD853F",
    promptEnhancement: `Style: Tuscan Italian trattoria menu design.
Warm Mediterranean colors (terracotta, olive green, cream, burnt sienna).
Elegant but approachable typography, hand-drawn elements.
Vintage Italian poster inspired aesthetic.
Grape vine or olive branch illustrations.`,
  },
  coffee: {
    name: "Artisan Coffee",
    description: "Hipster cafe aesthetic with coffee tones",
    icon: "coffee",
    previewColor: "#4A3728",
    promptEnhancement: `Style: Artisan coffee shop menu design.
Warm coffee tones (espresso brown, cream, caramel), chalkboard or kraft paper texture.
Hand-lettered typography, coffee bean illustrations.
Third-wave coffee aesthetic, modern but cozy.
Latte art or brewing equipment illustrations optional.`,
  },
  neon: {
    name: "Neon Nightclub",
    description: "Glowing neon on dark background",
    icon: "zap",
    previewColor: "#FF00FF",
    promptEnhancement: `Style: Neon nightclub/bar menu design.
Dark black background with glowing neon text effects.
Vibrant neon colors (pink, blue, purple, green) with glow effects.
Retro 80s/synthwave aesthetic.
Futuristic, high-energy nightlife atmosphere.`,
  },
  retro: {
    name: "Retro Diner",
    description: "1950s American diner nostalgia",
    icon: "star",
    previewColor: "#FF4500",
    promptEnhancement: `Style: Retro 1950s American diner menu design.
Classic red, white, and chrome color scheme.
Vintage diner typography with starbursts and badges.
Checkered patterns, jukebox era nostalgia.
Milkshake and burger illustrations optional.`,
  },
  garden: {
    name: "Garden Fresh",
    description: "Botanical, organic, farm-fresh aesthetic",
    icon: "leaf",
    previewColor: "#228B22",
    promptEnhancement: `Style: Garden fresh organic restaurant menu.
Natural greens, soft earth tones, botanical illustrations.
Watercolor flower and herb drawings.
Light, airy, fresh aesthetic.
Handwritten or organic typography style.`,
  },
  dark: {
    name: "Dark Luxury",
    description: "Moody, sophisticated, upscale dark theme",
    icon: "moon",
    previewColor: "#0D0D0D",
    promptEnhancement: `Style: Dark luxury high-end restaurant menu.
Deep black background with elegant gold or silver accents.
Sophisticated serif typography.
Moody, intimate, exclusive atmosphere.
Minimal decorations, maximum elegance.`,
  },
} as const;

// Seasonal/Holiday themes
export const SEASONAL_THEMES = {
  none: { name: "None", description: "No seasonal theme" },
  christmas: {
    name: "Christmas",
    description: "Festive red, green, gold with holiday elements",
    promptAddition: "Add Christmas/holiday decorations: holly, ornaments, snowflakes, candy canes. Use red, green, and gold colors.",
  },
  thanksgiving: {
    name: "Thanksgiving",
    description: "Autumn harvest with warm fall colors",
    promptAddition: "Add Thanksgiving/autumn elements: fall leaves, pumpkins, harvest imagery. Use warm orange, brown, and gold tones.",
  },
  valentines: {
    name: "Valentine's Day",
    description: "Romantic pink and red with hearts",
    promptAddition: "Add romantic Valentine's Day elements: hearts, roses, cupid imagery. Use pink, red, and gold colors.",
  },
  halloween: {
    name: "Halloween",
    description: "Spooky with orange, black, and purple",
    promptAddition: "Add Halloween elements: pumpkins, bats, spiderwebs, gothic styling. Use orange, black, and purple colors.",
  },
  spring: {
    name: "Spring",
    description: "Fresh pastels with floral elements",
    promptAddition: "Add spring elements: cherry blossoms, fresh flowers, butterflies. Use soft pastel colors.",
  },
  summer: {
    name: "Summer",
    description: "Bright, sunny, beach vibes",
    promptAddition: "Add summer elements: sun, beach imagery, tropical fruits. Use bright, vibrant, sunny colors.",
  },
  fall: {
    name: "Fall/Autumn",
    description: "Cozy autumn with warm tones",
    promptAddition: "Add autumn elements: falling leaves, acorns, warm textures. Use orange, brown, burgundy colors.",
  },
  winter: {
    name: "Winter",
    description: "Cool blues and whites with snowflakes",
    promptAddition: "Add winter elements: snowflakes, icicles, evergreen branches. Use cool blue, silver, and white colors.",
  },
  newYear: {
    name: "New Year's Eve",
    description: "Celebratory gold and black with sparkles",
    promptAddition: "Add New Year's celebration elements: champagne, confetti, fireworks, clock imagery. Use gold, black, and silver.",
  },
  stPatricks: {
    name: "St. Patrick's Day",
    description: "Irish green with shamrocks",
    promptAddition: "Add St. Patrick's Day elements: shamrocks, Celtic patterns, pot of gold. Use green and gold colors.",
  },
  easter: {
    name: "Easter",
    description: "Pastel colors with spring motifs",
    promptAddition: "Add Easter elements: eggs, bunnies, spring flowers. Use soft pastel colors.",
  },
  july4th: {
    name: "Fourth of July",
    description: "Patriotic red, white, and blue",
    promptAddition: "Add patriotic American elements: stars, stripes, fireworks. Use red, white, and blue colors.",
  },
} as const;

// Color scheme options
export const COLOR_SCHEMES = {
  default: { name: "Style Default", description: "Use the default colors for selected style", colors: null },
  monochrome: { name: "Monochrome", description: "Black, white, and grays", colors: { primary: "#000000", secondary: "#666666", accent: "#333333", background: "#FFFFFF" } },
  warmNeutral: { name: "Warm Neutral", description: "Cream, tan, and brown tones", colors: { primary: "#5C4033", secondary: "#8B7355", accent: "#D4A574", background: "#FFF8DC" } },
  coolNeutral: { name: "Cool Neutral", description: "Gray, slate, and silver tones", colors: { primary: "#2F4F4F", secondary: "#708090", accent: "#B0C4DE", background: "#F5F5F5" } },
  luxuryGold: { name: "Luxury Gold", description: "Black and gold accents", colors: { primary: "#000000", secondary: "#1a1a1a", accent: "#D4AF37", background: "#FFFEF0" } },
  forestGreen: { name: "Forest Green", description: "Deep greens with cream", colors: { primary: "#1B4332", secondary: "#2D6A4F", accent: "#40916C", background: "#F0FFF0" } },
  oceanBlue: { name: "Ocean Blue", description: "Navy and aqua tones", colors: { primary: "#003049", secondary: "#005F73", accent: "#0A9396", background: "#E0F7FA" } },
  sunsetWarm: { name: "Sunset Warm", description: "Orange, coral, and terracotta", colors: { primary: "#9C2706", secondary: "#D35400", accent: "#E67E22", background: "#FFF5E6" } },
  berryWine: { name: "Berry Wine", description: "Deep burgundy and plum", colors: { primary: "#4A0E0E", secondary: "#722F37", accent: "#8E4585", background: "#FFF0F5" } },
  midnightBlue: { name: "Midnight Blue", description: "Dark blue with silver accents", colors: { primary: "#0D1B2A", secondary: "#1B263B", accent: "#778DA9", background: "#F8F9FA" } },
  roseGold: { name: "Rose Gold", description: "Blush pink with gold accents", colors: { primary: "#B76E79", secondary: "#E8B4BC", accent: "#D4AF37", background: "#FFF5F5" } },
  emerald: { name: "Emerald Luxury", description: "Rich emerald with gold", colors: { primary: "#046307", secondary: "#0B8A0B", accent: "#FFD700", background: "#F0FFF0" } },
  lavender: { name: "Lavender Dream", description: "Soft purple and lilac", colors: { primary: "#6B5B95", secondary: "#9B8FC2", accent: "#D4A5A5", background: "#F5F0FF" } },
  terracotta: { name: "Terracotta", description: "Earthy clay tones", colors: { primary: "#C35831", secondary: "#E07850", accent: "#2F4538", background: "#FFF8F0" } },
  charcoal: { name: "Charcoal", description: "Dark grays with white", colors: { primary: "#2C2C2C", secondary: "#4A4A4A", accent: "#FFFFFF", background: "#1A1A1A" } },
} as const;

// Typography options
export const TYPOGRAPHY_STYLES = {
  classic: { name: "Classic Serif", description: "Traditional, elegant serif fonts", fonts: "Garamond, Times New Roman, Georgia" },
  modern: { name: "Modern Sans", description: "Clean, contemporary sans-serif", fonts: "Helvetica, Arial, Futura" },
  handwritten: { name: "Handwritten", description: "Casual, hand-lettered feel", fonts: "Script, handwritten style, chalk lettering" },
  bold: { name: "Bold Statement", description: "Strong, impactful typography", fonts: "Heavy weight, condensed, impact style" },
  elegant: { name: "Elegant Script", description: "Sophisticated script accents", fonts: "Didot, Bodoni with script headers" },
  rustic: { name: "Rustic Vintage", description: "Weathered, vintage letterpress", fonts: "Slab serif, wood type, vintage signage" },
  art_deco: { name: "Art Deco", description: "1920s geometric elegance", fonts: "Art deco geometric, Broadway style" },
  playful: { name: "Playful", description: "Fun, casual, friendly", fonts: "Rounded sans-serif, bouncy lettering" },
  luxe: { name: "Ultra Luxe", description: "High fashion magazine style", fonts: "Thin elegant serifs, fashion typography" },
} as const;

// Dietary/allergy icons
export const DIETARY_LABELS = {
  vegetarian: { symbol: "V", name: "Vegetarian", color: "#228B22" },
  vegan: { symbol: "VG", name: "Vegan", color: "#32CD32" },
  glutenFree: { symbol: "GF", name: "Gluten-Free", color: "#DAA520" },
  dairyFree: { symbol: "DF", name: "Dairy-Free", color: "#4169E1" },
  nutFree: { symbol: "NF", name: "Nut-Free", color: "#FF6347" },
  spicy: { symbol: "🌶", name: "Spicy", color: "#FF4500" },
  mild: { symbol: "○", name: "Mild", color: "#90EE90" },
  medium: { symbol: "●", name: "Medium Spicy", color: "#FFA500" },
  hot: { symbol: "●●", name: "Hot", color: "#FF4500" },
  extraHot: { symbol: "●●●", name: "Extra Hot", color: "#8B0000" },
  organic: { symbol: "ORG", name: "Organic", color: "#228B22" },
  locallySourced: { symbol: "L", name: "Locally Sourced", color: "#2E8B57" },
  sustainable: { symbol: "♻", name: "Sustainable", color: "#3CB371" },
  halal: { symbol: "H", name: "Halal", color: "#006400" },
  kosher: { symbol: "K", name: "Kosher", color: "#0000CD" },
  raw: { symbol: "R", name: "Raw", color: "#32CD32" },
  keto: { symbol: "KT", name: "Keto-Friendly", color: "#8B4513" },
  paleo: { symbol: "P", name: "Paleo", color: "#CD853F" },
} as const;

// Aspect ratio options for menus
export const ASPECT_RATIOS = {
  "3:4": { name: "Portrait Menu", description: "Standard menu format", icon: "portrait" },
  "4:3": { name: "Landscape Menu", description: "Wide format, table tents", icon: "landscape" },
  "1:1": { name: "Square", description: "Social media, digital displays", icon: "square" },
  "9:16": { name: "Tall Portrait", description: "Digital menu boards, stories", icon: "tall" },
  "16:9": { name: "Wide Landscape", description: "TV displays, banners", icon: "wide" },
  "2:3": { name: "Tall Menu", description: "Slim elegant menus", icon: "slim" },
  "4:5": { name: "Instagram Portrait", description: "Instagram feed optimal", icon: "instagram" },
  "21:9": { name: "Ultra Wide", description: "Panoramic displays", icon: "ultrawide" },
} as const;

// Social media export presets
export const SOCIAL_PRESETS = {
  instagramPost: { name: "Instagram Post", ratio: "1:1", description: "Square 1080x1080" },
  instagramStory: { name: "Instagram Story", ratio: "9:16", description: "Vertical 1080x1920" },
  facebookPost: { name: "Facebook Post", ratio: "4:5", description: "Portrait 1080x1350" },
  twitterPost: { name: "Twitter/X Post", ratio: "16:9", description: "Landscape 1200x675" },
  pinterestPin: { name: "Pinterest Pin", ratio: "2:3", description: "Vertical 1000x1500" },
  menuBoard: { name: "Digital Menu Board", ratio: "9:16", description: "Vertical display" },
  tableTent: { name: "Table Tent", ratio: "4:3", description: "Tabletop display" },
  printMenu: { name: "Print Menu", ratio: "3:4", description: "Standard print format" },
} as const;

// Menu templates with pre-filled content
export const MENU_TEMPLATES = {
  fineDining: {
    name: "Fine Dining",
    description: "Upscale restaurant with tasting menu",
    restaurantName: "The Gilded Table",
    cuisine: "Contemporary French",
    priceRange: "$$$$",
    suggestedStyle: "elegant",
    content: `AMUSE-BOUCHE
Chef's daily creation

FIRST COURSE
Foie Gras Terrine - Sauternes gelée, brioche - $28
Oysters Rockefeller - Spinach, Pernod, breadcrumbs - $24
Lobster Bisque - Cognac cream, chive oil - $22

SECOND COURSE
Beef Tartare - Quail egg, capers, mustard aioli - $26
Tuna Crudo - Citrus, avocado, sesame - $28
Wild Mushroom Risotto - Truffle, aged parmesan (V) - $24

MAIN COURSE
Wagyu Ribeye - Bone marrow butter, potato gratin - $85
Dover Sole Meunière - Brown butter, capers, lemon - $65
Rack of Lamb - Herb crust, ratatouille, jus - $58
Duck Breast - Cherry gastrique, polenta - $48

CHEESE COURSE
Selection of Artisanal Cheeses - $24

DESSERT
Chocolate Soufflé - Crème anglaise - $18
Tarte Tatin - Vanilla ice cream - $16
Petit Fours - Chef's selection - $12`,
  },
  casualBistro: {
    name: "Casual Bistro",
    description: "Neighborhood restaurant with comfort food",
    restaurantName: "Corner Bistro",
    cuisine: "American Comfort",
    priceRange: "$$",
    suggestedStyle: "bistro",
    content: `STARTERS
French Onion Soup - Gruyère crouton - $9
Caesar Salad - House-made dressing, parmesan - $12
Crispy Calamari - Lemon aioli, marinara - $14
Charcuterie Board - Cured meats, pickles, mustard - $18

SANDWICHES
Classic Burger - Cheddar, lettuce, tomato, fries - $16
Croque Monsieur - Ham, gruyère, béchamel - $14
Club Sandwich - Turkey, bacon, avocado - $15
Grilled Cheese - Three cheese blend, tomato soup (V) - $12

ENTRÉES
Steak Frites - 8oz sirloin, herb butter - $28
Roasted Chicken - Mashed potatoes, pan jus - $22
Pan-Seared Salmon - Seasonal vegetables - $26
Mushroom Pasta - Cream sauce, parmesan (V) - $18

SIDES
French Fries - $6
Seasonal Vegetables (V) - $7
Mac & Cheese (V) - $8

DESSERTS
Crème Brûlée - $9
Chocolate Mousse - $8
Apple Pie à la Mode - $9`,
  },
  pizzeria: {
    name: "Italian Pizzeria",
    description: "Authentic pizza and pasta restaurant",
    restaurantName: "Bella Napoli",
    cuisine: "Italian",
    priceRange: "$$",
    suggestedStyle: "italian",
    content: `ANTIPASTI
Bruschetta Classica - Tomato, basil, garlic (V) - $10
Caprese Salad - Buffalo mozzarella, tomatoes (V) - $14
Arancini - Risotto balls, marinara (V) - $12
Carpaccio di Manzo - Beef, arugula, parmesan - $16

PIZZE
Margherita - Tomato, mozzarella, basil (V) - $16
Pepperoni - Spicy pepperoni, mozzarella - $18
Quattro Formaggi - Four cheese blend (V) - $18
Prosciutto e Rucola - Prosciutto, arugula, parmesan - $20
Diavola - Spicy salami, chili, olives 🌶 - $19
Vegetariana - Seasonal vegetables, mozzarella (V) - $17

PASTA
Spaghetti Carbonara - Guanciale, egg, pecorino - $18
Penne Arrabbiata - Spicy tomato sauce (V) 🌶 - $15
Fettuccine Alfredo - Cream, parmesan (V) - $16
Lasagna Bolognese - House-made, béchamel - $19

DOLCI
Tiramisu - $9
Panna Cotta (GF) - $8
Cannoli - $7
Gelato - Two scoops - $6`,
  },
  sushiBar: {
    name: "Sushi Bar",
    description: "Japanese sushi and izakaya dishes",
    restaurantName: "Sakura Sushi",
    cuisine: "Japanese",
    priceRange: "$$$",
    suggestedStyle: "asian",
    content: `STARTERS
Edamame (V)(GF) - Sea salt - $6
Miso Soup (V) - Tofu, wakame, scallion - $5
Gyoza - Pork dumplings, ponzu - $9
Agedashi Tofu (V) - Dashi broth, bonito - $8

SASHIMI (GF)
Salmon - 5 pieces - $16
Tuna - 5 pieces - $18
Yellowtail - 5 pieces - $17
Chef's Selection - 12 pieces - $38

NIGIRI (GF) - 2 pieces
Sake (Salmon) - $7
Maguro (Tuna) - $8
Hamachi (Yellowtail) - $8
Unagi (Eel) - $9
Tamago (Egg) (V) - $5

SPECIALTY ROLLS
Dragon Roll - Eel, avocado, cucumber - $18
Rainbow Roll - Assorted fish, California base - $20
Spicy Tuna Roll 🌶 - Spicy tuna, cucumber - $14
Spider Roll - Soft shell crab, avocado - $17
Volcano Roll 🌶 - Baked seafood, spicy mayo - $16

ENTRÉES
Teriyaki Salmon (GF) - Rice, vegetables - $24
Chicken Katsu - Tonkatsu sauce, cabbage - $18
Beef Negimaki (GF) - Scallion, teriyaki - $22

DESSERT
Mochi Ice Cream - 3 pieces - $7
Green Tea Cheesecake - $8`,
  },
  coffeeCafe: {
    name: "Coffee Café",
    description: "Artisan coffee shop with pastries",
    restaurantName: "The Daily Grind",
    cuisine: "Café",
    priceRange: "$",
    suggestedStyle: "coffee",
    content: `ESPRESSO
Espresso - Single / Double - $3 / $4
Americano - $4
Cappuccino - $5
Latte - $5.50
Flat White - $5
Mocha - $6
Macchiato - $4.50

SPECIALTY DRINKS
Vanilla Bean Latte - $6
Caramel Macchiato - $6
Honey Lavender Latte - $6.50
Matcha Latte (V) - $6
Chai Latte (V) - $5.50
Hot Chocolate - $5

COLD DRINKS
Iced Coffee - $4.50
Cold Brew - $5
Iced Latte - $6
Nitro Cold Brew - $6
Iced Matcha (V) - $6

BREAKFAST
Avocado Toast (V) - Poached egg, everything spice - $12
Açaí Bowl (V)(GF) - Granola, fresh fruit - $13
Croissant - Butter or chocolate - $4
Bagel (V) - Cream cheese - $5
Overnight Oats (V) - Maple, berries - $8

PASTRIES
Blueberry Muffin (V) - $4
Cinnamon Roll (V) - $5
Scone - Various flavors (V) - $4
Brownie (V)(GF) - $4
Cookie (V) - $3

LUNCH
Turkey & Brie Sandwich - $12
Caprese Panini (V) - $11
Quinoa Salad (V)(GF) - $10
Soup of the Day - $7`,
  },
  tacoShop: {
    name: "Taco Shop",
    description: "Authentic Mexican street food",
    restaurantName: "Taquería El Sol",
    cuisine: "Mexican",
    priceRange: "$",
    suggestedStyle: "mexican",
    content: `ANTOJITOS
Guacamole & Chips (V)(GF) - Fresh-made, pico de gallo - $10
Queso Fundido (GF) - Melted cheese, chorizo - $11
Elote (V)(GF) - Grilled corn, mayo, cotija, chili - $6
Nachos (V) - Beans, cheese, jalapeños, crema - $12

TACOS (3 per order) (GF)
Carne Asada - Grilled steak, onion, cilantro - $12
Carnitas - Slow-cooked pork, salsa verde - $11
Pollo - Grilled chicken, pico de gallo - $10
Al Pastor 🌶 - Marinated pork, pineapple - $11
Barbacoa - Braised beef, onion, cilantro - $12
Pescado - Beer-battered fish, cabbage slaw - $13
Vegetariano (V) - Grilled vegetables, beans - $9

BURRITOS
California Burrito - Carne asada, fries, guac - $14
Classic Burrito - Choice of meat, rice, beans - $12
Veggie Burrito (V) - Rice, beans, vegetables - $10

QUESADILLAS
Cheese Quesadilla (V) - $8
Chicken Quesadilla - $11
Steak Quesadilla - $13

SIDES
Rice & Beans (V)(GF) - $5
Chips & Salsa (V)(GF) - $4

DRINKS
Horchata (V) - $4
Jamaica (V)(GF) - $4
Mexican Coke - $3
Jarritos - $3`,
  },
  brunchMenu: {
    name: "Weekend Brunch",
    description: "Late morning brunch menu",
    restaurantName: "The Sunny Side",
    cuisine: "American Brunch",
    priceRange: "$$",
    suggestedStyle: "modern",
    content: `STARTERS
Fresh Fruit Platter (V)(GF) - Seasonal fruits, honey - $12
Pastry Basket (V) - Croissants, muffins, scones - $14
Smoked Salmon Board - Capers, cream cheese, bagel - $18

EGGS
Classic Eggs Benedict - English muffin, hollandaise - $16
Florentine Benedict (V) - Spinach, tomato - $15
Avocado Toast (V) - Poached eggs, microgreens - $14
Three Egg Omelette - Choice of fillings - $14
Shakshuka (V)(GF) - Poached eggs, spiced tomato - $15

MAINS
Buttermilk Pancakes (V) - Maple syrup, butter - $13
French Toast (V) - Brioche, berries, whipped cream - $14
Chicken & Waffles - Maple glaze, hot sauce - $18
Steak & Eggs (GF) - 6oz sirloin, two eggs any style - $24
Crab Cake Benedict - Lump crab, Old Bay hollandaise - $22

LIGHTER FARE
Greek Yogurt Parfait (V)(GF) - Granola, berries - $10
Quinoa Power Bowl (V)(GF) - Vegetables, tahini - $14
Smashed Avo (V) - Sourdough, feta, chili flakes - $12

SIDES
Bacon (GF) - $5
Sausage Links (GF) - $5
Hash Browns (V)(GF) - $4
Toast (V) - $3

BEVERAGES
Mimosa - $8
Bellini - $10
Bloody Mary - $12
Fresh Squeezed OJ - $5
Cold Brew Coffee - $5`,
  },
  dessertMenu: {
    name: "Dessert Menu",
    description: "Sweet endings and after-dinner treats",
    restaurantName: "Sweet Finale",
    cuisine: "Desserts",
    priceRange: "$$",
    suggestedStyle: "elegant",
    content: `SIGNATURE DESSERTS
Chocolate Lava Cake - Molten center, vanilla bean ice cream - $14
Crème Brûlée - Madagascar vanilla, caramelized sugar - $12
New York Cheesecake - Graham crust, berry compote - $13
Tiramisu - Espresso-soaked ladyfingers, mascarpone - $12

TARTS & PIES
Apple Tarte Tatin - Caramelized apples, crème fraîche - $11
Lemon Tart - Buttery crust, torched meringue - $10
Chocolate Ganache Tart - Dark chocolate, sea salt - $12
Key Lime Pie - Graham crust, whipped cream - $10

ICE CREAM & SORBET
Artisan Ice Cream - Three scoops, choice of flavors - $9
Sorbet Trio (V)(GF) - Seasonal fruit flavors - $8
Affogato - Vanilla gelato, hot espresso - $7
Banana Split - Classic preparation - $12

LIGHTER OPTIONS
Fresh Berries (V)(GF) - Chantilly cream - $9
Cheese Plate - Artisan cheeses, honeycomb, nuts - $16
Chocolate Truffles - Assorted flavors - $8
Petit Fours - Chef's selection - $10

BEVERAGES
Espresso - $4
Cappuccino - $5
Dessert Wine - Glass - $12
Port - Glass - $14
After Dinner Cocktail - $15`,
  },
  barMenu: {
    name: "Cocktail Bar",
    description: "Craft cocktails and bar bites",
    restaurantName: "The Velvet Room",
    cuisine: "Cocktail Bar",
    priceRange: "$$$",
    suggestedStyle: "dark",
    content: `SIGNATURE COCKTAILS
The Velvet - Bourbon, amaretto, cherry, bitters - $16
Midnight Garden - Gin, elderflower, cucumber, basil - $15
Smoky Old Fashioned - Mezcal, maple, orange - $17
Lavender Martini - Vodka, lavender, lemon - $15
Tokyo Drift - Japanese whisky, yuzu, shiso - $18

CLASSIC COCKTAILS
Manhattan - Rye, sweet vermouth, bitters - $14
Negroni - Gin, Campari, sweet vermouth - $14
Martini - Gin or vodka, dry vermouth - $14
Margarita - Tequila, lime, agave - $13
Mojito - Rum, mint, lime, soda - $13

WINE BY THE GLASS
Champagne - Veuve Clicquot - $18
Chardonnay - Sonoma Coast - $14
Pinot Noir - Willamette Valley - $15
Cabernet - Napa Valley - $16

BEER
Craft IPA - Local brewery - $8
Pilsner - Imported - $7
Stout - Nitro pour - $9

BAR BITES
Truffle Fries (V) - Parmesan, herbs - $12
Wagyu Sliders - Three, caramelized onion - $18
Oysters - Half dozen, mignonette - $24
Charcuterie - Cured meats, cheese, pickles - $22
Lobster Roll Bites - Butter, chive - $20`,
  },
  veganMenu: {
    name: "Plant-Based Restaurant",
    description: "Fully vegan menu",
    restaurantName: "Green Garden",
    cuisine: "Vegan",
    priceRange: "$$",
    suggestedStyle: "garden",
    content: `STARTERS
Cauliflower Wings (V)(GF) - Buffalo or BBQ sauce - $12
Avocado Tartare (V)(GF) - Citrus, radish, microgreens - $14
Mushroom Ceviche (V)(GF) - Coconut, lime, chili - $13
Loaded Sweet Potato Skins (V)(GF) - Cashew cream, chives - $11

SOUPS & SALADS
Tom Yum Soup (V)(GF) - Lemongrass, coconut, vegetables - $9
Kale Caesar (V) - Cashew dressing, hemp seeds - $13
Rainbow Buddha Bowl (V)(GF) - Quinoa, tahini, vegetables - $16
Mediterranean Salad (V)(GF) - Falafel, hummus, olives - $15

MAINS
Mushroom Wellington (V) - Puff pastry, mashed potatoes - $24
Jackfruit Tacos (V)(GF) - Slaw, lime crema, cilantro - $16
Thai Curry (V)(GF) - Coconut milk, vegetables, rice - $18
Pasta Primavera (V) - Seasonal vegetables, garlic olive oil - $17
BBQ Cauliflower Steak (V)(GF) - Chimichurri, roasted vegetables - $20

SIDES (V)(GF)
Truffle Fries - $7
Roasted Brussels Sprouts - $8
Coconut Rice - $5
Grilled Asparagus - $8

DESSERTS (V)
Chocolate Avocado Mousse (GF) - $10
Coconut Panna Cotta (GF) - Berry compote - $9
Vegan Cheesecake - Cashew base - $11
Sorbet Trio (GF) - Seasonal flavors - $8`,
  },
} as const;

// Build the optimized menu prompt
function buildMenuPrompt(params: {
  restaurantName: string;
  menuItems: string;
  style: keyof typeof MENU_STYLES;
  colorScheme?: keyof typeof COLOR_SCHEMES;
  typography?: keyof typeof TYPOGRAPHY_STYLES;
  seasonalTheme?: keyof typeof SEASONAL_THEMES;
  additionalInstructions?: string;
  cuisine?: string;
  priceRange?: string;
  includeDecorations?: boolean;
  paperTexture?: string;
  tagline?: string;
  showDietaryLegend?: boolean;
  featuredItems?: string[];
  logoDescription?: string;
  menuType?: string;
  language?: string;
}): string {
  const styleConfig = MENU_STYLES[params.style];
  const colorConfig = params.colorScheme && params.colorScheme !== "default" 
    ? COLOR_SCHEMES[params.colorScheme] 
    : null;
  const typographyConfig = params.typography 
    ? TYPOGRAPHY_STYLES[params.typography] 
    : null;
  const seasonalConfig = params.seasonalTheme && params.seasonalTheme !== "none"
    ? SEASONAL_THEMES[params.seasonalTheme]
    : null;
  
  let colorInstructions = "";
  if (colorConfig?.colors) {
    colorInstructions = `
COLOR PALETTE:
- Primary color: ${colorConfig.colors.primary}
- Secondary color: ${colorConfig.colors.secondary}
- Accent color: ${colorConfig.colors.accent}
- Background color: ${colorConfig.colors.background}
Use these colors consistently throughout the design.`;
  }

  let typographyInstructions = "";
  if (typographyConfig) {
    typographyInstructions = `
TYPOGRAPHY:
Use ${typographyConfig.name} style typography: ${typographyConfig.fonts}
${typographyConfig.description}`;
  }

  let seasonalInstructions = "";
  if (seasonalConfig && 'promptAddition' in seasonalConfig) {
    seasonalInstructions = `
SEASONAL THEME:
${seasonalConfig.promptAddition}`;
  }

  let decorationInstructions = "";
  if (params.includeDecorations !== false) {
    decorationInstructions = `
DECORATIVE ELEMENTS:
Include subtle decorative elements that match the style:
- Elegant dividers between sections
- Small icons or illustrations relevant to the cuisine
- Decorative borders or frames if appropriate
- Logo placeholder area at the top`;
  }

  let textureInstructions = "";
  if (params.paperTexture) {
    textureInstructions = `
PAPER/BACKGROUND TEXTURE:
Use a ${params.paperTexture} texture for the background.`;
  }

  let taglineInstructions = "";
  if (params.tagline) {
    taglineInstructions = `
TAGLINE:
Include the tagline "${params.tagline}" below the restaurant name in a complementary style.`;
  }

  let legendInstructions = "";
  if (params.showDietaryLegend) {
    legendInstructions = `
DIETARY LEGEND:
Include a small legend at the bottom explaining dietary symbols:
(V) = Vegetarian, (VG) = Vegan, (GF) = Gluten-Free, 🌶 = Spicy`;
  }

  let featuredInstructions = "";
  if (params.featuredItems && params.featuredItems.length > 0) {
    featuredInstructions = `
FEATURED ITEMS:
Highlight these items with special styling (star, badge, or decorative element):
${params.featuredItems.map(item => `- ${item}`).join('\n')}`;
  }

  let logoInstructions = "";
  if (params.logoDescription) {
    logoInstructions = `
LOGO:
Include a stylized logo at the top based on: ${params.logoDescription}`;
  }

  let menuTypeInstructions = "";
  if (params.menuType) {
    menuTypeInstructions = `
MENU TYPE:
This is a ${params.menuType} menu. Style accordingly.`;
  }

  let languageInstructions = "";
  if (params.language && params.language !== "english") {
    languageInstructions = `
LANGUAGE STYLE:
Incorporate ${params.language} language styling and cultural design elements where appropriate.`;
  }
  
  return `Create a professional restaurant menu image for "${params.restaurantName}".

${styleConfig.promptEnhancement}
${colorInstructions}
${typographyInstructions}
${seasonalInstructions}
${textureInstructions}
${decorationInstructions}
${taglineInstructions}
${logoInstructions}
${menuTypeInstructions}
${languageInstructions}
${legendInstructions}
${featuredInstructions}

MENU CONTENT:
${params.menuItems}

${params.cuisine ? `Cuisine type: ${params.cuisine}` : ""}
${params.priceRange ? `Price range: ${params.priceRange}` : ""}

CRITICAL REQUIREMENTS:
- This must be a complete, print-ready menu design
- All text must be PERFECTLY LEGIBLE and properly spelled - this is the #1 priority
- Maintain consistent spacing and alignment throughout
- Include the restaurant name prominently at the top in a stylized header
- Organize items into clear sections with decorative headers
- Include prices aligned to the right of each item
- Professional typography with proper hierarchy:
  * Restaurant name: Largest, most decorative
  * Section headers: Medium size, distinctive style
  * Item names: Clear, readable
  * Descriptions: Smaller, lighter weight
  * Prices: Aligned, consistent format
- The menu should look like it was designed by a professional graphic designer
- High resolution, crisp text rendering
- Realistic menu card/paper appearance
- Proper margins on all sides
- Visual balance and harmony
- Preserve dietary symbols like (V), (GF), (VG), 🌶 next to items

${params.additionalInstructions ? `ADDITIONAL REQUIREMENTS: ${params.additionalInstructions}` : ""}

Generate a single, complete, beautiful menu image that is ready for printing or digital display.`;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      restaurantName,
      menuItems,
      style = "modern",
      aspectRatio = "3:4",
      colorScheme = "default",
      typography,
      seasonalTheme = "none",
      additionalInstructions,
      cuisine,
      priceRange,
      includeDecorations = true,
      paperTexture,
      tagline,
      showDietaryLegend = false,
      featuredItems,
      logoDescription,
      menuType,
      language,
      // Multi-generation
      generateVariations = 1,
    } = body;

    if (!restaurantName || !menuItems) {
      return NextResponse.json(
        { error: "Restaurant name and menu items are required" },
        { status: 400 }
      );
    }

    if (!MENU_STYLES[style as keyof typeof MENU_STYLES]) {
      return NextResponse.json(
        { error: "Invalid menu style" },
        { status: 400 }
      );
    }

    const prompt = buildMenuPrompt({
      restaurantName,
      menuItems,
      style: style as keyof typeof MENU_STYLES,
      colorScheme: colorScheme as keyof typeof COLOR_SCHEMES,
      typography: typography as keyof typeof TYPOGRAPHY_STYLES,
      seasonalTheme: seasonalTheme as keyof typeof SEASONAL_THEMES,
      additionalInstructions,
      cuisine,
      priceRange,
      includeDecorations,
      paperTexture,
      tagline,
      showDietaryLegend,
      featuredItems,
      logoDescription,
      menuType,
      language,
    });

    // Generate single or multiple variations
    const numVariations = Math.min(Math.max(1, generateVariations), 4);
    const results = [];

    for (let i = 0; i < numVariations; i++) {
      const variationPrompt = numVariations > 1 
        ? `${prompt}\n\nVARIATION ${i + 1} of ${numVariations}: Create a unique interpretation while keeping the same content.`
        : prompt;

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "CherryCap Menu Maker",
        },
        body: JSON.stringify({
          model: IMAGE_MODEL,
          messages: [{ role: "user", content: variationPrompt }],
          modalities: ["image", "text"],
          image_config: { aspect_ratio: aspectRatio },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const message = result.choices?.[0]?.message;
        const images = message?.images || [];
        
        if (images.length > 0) {
          results.push({
            image: images[0]?.image_url?.url || images[0]?.imageUrl?.url,
            message: message?.content || "",
          });
        }
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "No images were generated. Try adjusting your prompt." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: results[0].image,
      message: results[0].message,
      variations: results.length > 1 ? results : undefined,
      prompt: prompt,
    });
  } catch (error) {
    console.error("Menu image API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to return available styles and options
export async function GET() {
  return NextResponse.json({
    styles: Object.entries(MENU_STYLES).map(([key, value]) => ({ id: key, ...value })),
    aspectRatios: Object.entries(ASPECT_RATIOS).map(([key, value]) => ({ id: key, ...value })),
    colorSchemes: Object.entries(COLOR_SCHEMES).map(([key, value]) => ({ id: key, ...value })),
    typographyStyles: Object.entries(TYPOGRAPHY_STYLES).map(([key, value]) => ({ id: key, ...value })),
    seasonalThemes: Object.entries(SEASONAL_THEMES).map(([key, value]) => ({ id: key, ...value })),
    dietaryLabels: Object.entries(DIETARY_LABELS).map(([key, value]) => ({ id: key, ...value })),
    socialPresets: Object.entries(SOCIAL_PRESETS).map(([key, value]) => ({ id: key, ...value })),
    templates: Object.entries(MENU_TEMPLATES).map(([key, value]) => ({ id: key, ...value })),
    model: IMAGE_MODEL,
  });
}
