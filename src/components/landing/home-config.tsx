// ==========================================
// PAGE CONFIGURATION
// ==========================================
export const HOME_PRODUCT_LIMIT = 8; 

// ==========================================
// STORE CONTACT
// ==========================================
export const STORE_CONTACT = {
  email: "hello@freshandfragrant.com",
  phone: "+1 (555) 123-4567",
  whatsapp: "+15551234567",
  address: "123 Natural Beauty Ave, New York, NY 10001",
  hours: "Mon - Fri: 9AM - 6PM",
};

// ==========================================
// IMAGE ARRAYS
// ==========================================
export const NEWIN_IMAGES = [
  "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=800&auto=format&fit=crop", // Soap
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop", // Oils
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop", // Bamboo/Zero waste
  "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop", // Hair care
];

export const BESTSELLER_IMAGES = [
  "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop",
];

// ==========================================
// HERO SLIDES
// ==========================================
export const HERO_SLIDES = [
  {
    eyebrow: "100% Natural & Organic",
    title: "Pure Ingredients, Pure Glow.",
    description: "Discover our handcrafted soaps and botanical conditioners, made with cold-pressed oils and zero synthetic fragrances.",
    action: "Shop Naturals",
    href: "/shop",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=2000&auto=format&fit=crop", 
  },
  {
    eyebrow: "New Collection 2026",
    title: "Botanical Hair Care.",
    description: "Restore your hair's natural balance with our rosemary and mint conditioners. Silicone-free, sulfate-free, earth-first.",
    action: "Explore Hair Care",
    href: "/shop?category=hair",
    image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=2000&auto=format&fit=crop", 
  },
  {
    eyebrow: "Earth-Friendly Essentials",
    title: "Zero Waste Living.",
    description: "From shampoo bars to bamboo soap dishes. Small swaps that make a massive difference for our planet.",
    action: "Shop Zero Waste",
    href: "/shop?category=zero-waste",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2000&auto=format&fit=crop",
  },
];

// ==========================================
// PRODUCT CATEGORIES
// ==========================================
export const PRODUCT_CATEGORIES = [
  {
    name: "Handcrafted Soaps",
    href: "/shop?category=soaps",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Hair Care",
    href: "/shop?category=hair-care",
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Body & Oils",
    href: "/shop?category=body-care",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Zero Waste",
    href: "/shop?category=zero-waste",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop",
  },
];

// ==========================================
// BLOG POSTS
// ==========================================
export const BLOG_POSTS = [
  {
    id: 1,
    title: "The Benefits of Cold-Pressed Soap",
    excerpt: "Why the temperature of the oils matters for your skin's natural barrier.",
    category: "Skincare",
    date: "Oct 12, 2026",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=800&auto=format&fit=crop",
    href: "/blog/cold-pressed-soap",
  },
  {
    id: 2,
    title: "Sulfate-Free vs. Traditional Shampoo",
    excerpt: "Understanding the ingredients in your hair care and why we removed the harsh ones.",
    category: "Hair Care",
    date: "Oct 05, 2026",
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop",
    href: "/blog/sulfate-free-shampoo",
  },
  {
    id: 3,
    title: "Building a Zero-Waste Bathroom",
    excerpt: "Easy swaps you can make today to reduce plastic waste in your daily routine.",
    category: "Sustainability",
    date: "Sep 28, 2026",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop",
    href: "/blog/zero-waste-bathroom",
  }
];

// ==========================================
// CATEGORIES (General Links)
// ==========================================
export const CATEGORIES = [
  { name: "Soaps", href: "/shop?category=soaps" },
  { name: "Conditioners", href: "/shop?category=conditioners" },
  { name: "Body Care", href: "/shop?category=body-care" },
  { name: "Hair Care", href: "/shop?category=hair-care" },
  { name: "Zero Waste", href: "/shop?category=zero-waste" },
];

// ==========================================
// BRAND FEATURES (Used in Footer)
// ==========================================
export const BRAND_FEATURES = [
  { icon: 'truck',    label: 'Free Delivery on Orders' },
  { icon: 'return',  label: 'Easy 30-Day Returns' },
  { icon: 'natural', label: '100% Natural Products' },
  { icon: 'support', label: '24/7 Customer Support' },
];