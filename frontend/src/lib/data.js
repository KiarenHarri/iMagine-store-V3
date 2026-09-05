const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const IMAGES = {
  hero: img("photo-1727093493864-0bcbd16c7e6d"),
  iphone17promax: img("photo-1759203302534-c6e71c93e886"),
  iphone17pro: img("photo-1758186361602-c3f23037eb95"),
  iphone17: img("photo-1758467700578-7491a5c7eedd"),
  iphone16pro: img("photo-1727093493864-0bcbd16c7e6d"),
  iphone15pro: img("photo-1773414422103-7aa2623de1fa"),
  iphonePreOwned: img("photo-1663408261842-016bae520a0c"),
  storefront: "https://images.unsplash.com/photo-1621768216002-5ac171876625?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  macbookAirM4: img("photo-1767097587570-206837933fe0"),
  macbook: img("photo-1611186871348-b1ce696e52c9"),
  macbookAlt: img("photo-1517336714731-489689fd1ca8"),
  macMini: img("photo-1717632464003-eac734ef76d9"),
  imacLineup: "https://www.imaginestore.co.za/wp-content/uploads/2023/05/WhatsApp-Image-2023-05-18-at-15.53.25-PhotoRoom.png-PhotoRoom.png",
  watch: img("photo-1616353329366-b5546ca70b1a"),
  watchS10: img("photo-1546868871-7041f2a55e12"),
  watchUltra: "https://www.imaginestore.co.za/wp-content/uploads/brizy/imgs/WhatsApp_Image_2023-05-18_at_15.53.47-removebg-preview-490x196x4x0x483x196x1684704024.png",
  watchSE: img("photo-1570791086173-1f3c8fec4a07"),
  watchAlt: img("photo-1434493789847-2f02dc6ca35d"),
  ipadPro: img("photo-1585786463769-8e46e2639b57"),
  ipadAir: img("photo-1744215328316-3e3a79b20d28"),
  ipad: img("photo-1544244015-9c72fd9c866d"),
  ipadMini: img("photo-1557825835-74a0a4f14a52"),
  ipadPencil: img("photo-1544244015-0df4b3ffc6b0"),
  iphoneAlt: img("photo-1510557880182-3d4d3cba35a5"),
  iphoneBlue: img("photo-1616348436168-de43ad0db179"),
  airpods: img("photo-1600294037681-c80b4cb5b434"),
  airpodsPro: img("photo-1770292170233-5d9e235ec739"),
  headphones: img("photo-1505740420928-5e560c06d30e"),
  headphonesDark: img("photo-1583394838336-acd977736f90"),
  earbuds: img("photo-1590658268037-6bf12165a8df"),
  laptopDesk: img("photo-1496181133206-80ce9b88a853"),
  desk: img("photo-1541807084-5c52b6b3adef"),
  watchStudio: img("photo-1523275335684-37898b6baf30"),
  ecosystem: "https://www.imaginestore.co.za/wp-content/uploads/brizy/imgs/WhatsApp_Image_2023-05-18_at_15.53.48-removebg-preview-382x160x0x1x382x158x1684711884.png",
};

export const BRAND = {
  name: "iMagine Store",
  legal: "iMagine Store (Pty) Ltd",
  role: "Apple Reseller & Apple Service Centre",
  established: "2014",
  location: "Westville, Durban, KwaZulu-Natal, South Africa",
  philosophy: "Educate. Innovate. Entertain.",
  facebook: "https://www.facebook.com/imaginestoreza/",
  website: "https://www.imaginestore.co.za",
  phone: "+27 83 777 3051",
  email: "seni@imaginestore.co.za",
  hours: "Monday – Friday: 09:00 – 16:30 · Saturday & Sunday: Closed",
};

export const MARQUEE_ITEMS = [
  "Apple Reseller",
  "Est. 2014",
  "Educate · Innovate · Entertain",
  "Apple Service Centre — Westville",
  "New Devices",
  "Pre-Owned Devices",
  "Reliable Repairs",
  "Software Development",
  "Consulting Services",
];

export const categories = [
  { slug: "iphone", name: "iPhone", tagline: "Pro cameras. ProMotion. Pure power.", image: IMAGES.iphone16pro },
  { slug: "mac", name: "Mac", tagline: "Apple silicon. Silent speed.", image: IMAGES.macbookAirM4 },
  { slug: "ipad", name: "iPad", tagline: "A canvas that goes anywhere.", image: IMAGES.ipadPro },
  { slug: "watch", name: "Watch", tagline: "Health, fitness and focus on your wrist.", image: IMAGES.watchS10 },
  { slug: "accessories", name: "Accessories", tagline: "Finish the ecosystem.", image: IMAGES.airpodsPro },
];

export const products = [
  { id: "ip17promax", name: "iPhone 17 Pro Max", category: "iphone", tagline: "Cosmic Orange. The biggest Pro ever.", image: IMAGES.iphone17promax, specs: ["A19 Pro", "Full-width camera plateau", "Best battery ever"] },
  { id: "ip17pro", name: "iPhone 17 Pro", category: "iphone", tagline: "Deep blue. Unibody aluminium.", image: IMAGES.iphone17pro, specs: ["A19 Pro", "48MP Fusion cameras", "Vapor chamber"] },
  { id: "ip17", name: "iPhone 17", category: "iphone", tagline: "Lavender. ProMotion for everyone.", image: IMAGES.iphone17, specs: ["A19", "120Hz ProMotion", "Dual Fusion camera"] },
  { id: "ip16pro", name: "iPhone 16 Pro", category: "iphone", tagline: "Titanium build. A18 Pro chip.", image: IMAGES.iphone16pro, specs: ["A18 Pro", "ProMotion 120Hz", "48MP Fusion camera"] },
  { id: "ip16", name: "iPhone 16", category: "iphone", tagline: "Camera Control. All-day battery.", image: IMAGES.iphoneBlue, specs: ["A18", "Camera Control", "USB-C"] },
  { id: "ip15", name: "iPhone 15 Pro", category: "iphone", tagline: "Titanium. A17 Pro. Pro camera system.", image: IMAGES.iphone15pro, specs: ["A17 Pro", "48MP camera", "USB-C"] },
  { id: "ip-pre", name: "Pre-Owned iPhone", category: "iphone", tagline: "Certified pre-owned, graded & checked.", image: IMAGES.iphonePreOwned, specs: ["Quality graded", "Battery health checked", "Warranty options"] },
  { id: "mbair", name: "MacBook Air", category: "mac", tagline: "Impossibly thin. Apple silicon.", image: IMAGES.macbookAirM4, specs: ["M-series chip", "Up to 18h battery", "Fanless design"] },
  { id: "mbpro", name: "MacBook Pro", category: "mac", tagline: "For pro workflows, anywhere.", image: IMAGES.macbookAlt, specs: ["M Pro/Max chips", "Liquid Retina XDR", "Pro I/O"] },
  { id: "imac", name: "iMac", category: "mac", tagline: "An all-in-one statement.", image: IMAGES.imacLineup, specs: ["24-inch 4.5K", "M-series chip", "Seven colours"] },
  { id: "macmini", name: "Mac mini", category: "mac", tagline: "Tiny footprint. Huge capability.", image: IMAGES.macMini, specs: ["M-series chip", "Compact design", "Gigabit Ethernet"] },
  { id: "ipp", name: "iPad Pro", category: "ipad", tagline: "The ultimate iPad experience.", image: IMAGES.ipadPro, specs: ["M-series chip", "Ultra Retina XDR", "Apple Pencil Pro"] },
  { id: "ipa", name: "iPad Air", category: "ipad", tagline: "Serious power, light carry.", image: IMAGES.ipadAir, specs: ["M-series chip", "Liquid Retina", "5G option"] },
  { id: "ipd", name: "iPad", category: "ipad", tagline: "Lovable. Capable. Everyday essential.", image: IMAGES.ipad, specs: ["A-series chip", "10.9-inch display", "USB-C"] },
  { id: "ipm", name: "iPad mini", category: "ipad", tagline: "Full iPad, pocket size.", image: IMAGES.ipadMini, specs: ["8.3-inch display", "Apple Pencil support", "All-day battery"] },
  { id: "aws10", name: "Apple Watch Series 10", category: "watch", tagline: "Thinner. Brighter. Smarter.", image: IMAGES.watchS10, specs: ["Wide-angle OLED", "Health sensors", "watchOS"] },
  { id: "awu2", name: "Apple Watch Ultra 2", category: "watch", tagline: "Built for the extremes.", image: IMAGES.watchUltra, specs: ["Titanium case", "36h battery", "Precision GPS"] },
  { id: "awse", name: "Apple Watch SE", category: "watch", tagline: "Essentials, beautifully done.", image: IMAGES.watchSE, specs: ["Retina display", "Sleep tracking", "Family Setup"] },
];

export const accessories = [
  { id: "app2", name: "AirPods Pro", tagline: "Active Noise Cancellation, redefined.", image: IMAGES.airpodsPro, group: "Audio" },
  { id: "ap", name: "AirPods", tagline: "Effortless listening, all day.", image: IMAGES.earbuds, group: "Audio" },
  { id: "beats", name: "Beats Headphones", tagline: "Big sound, bold style.", image: IMAGES.headphonesDark, group: "Audio" },
  { id: "pencil", name: "Apple Pencil Pro", tagline: "Pixel-perfect precision.", image: IMAGES.ipadPencil, group: "iPad" },
  { id: "mk", name: "Magic Keyboard", tagline: "A floating cantilever design.", image: IMAGES.ipadPro, group: "iPad" },
  { id: "magsafe", name: "MagSafe Chargers & Cases", tagline: "Snap. Charge. Go.", image: IMAGES.iphoneBlue, group: "iPhone" },
  { id: "straps", name: "Watch Straps", tagline: "Change your look in a click.", image: IMAGES.watchStudio, group: "Watch" },
  { id: "cables", name: "Cables & Adapters", tagline: "Genuine connectivity.", image: IMAGES.desk, group: "Essentials" },
];

export const repairServices = [
  "In-warranty & out-of-warranty Apple repairs",
  "Mac desktop & laptop servicing and upgrades",
  "iPhone, iPad, iPod, Apple Watch & Beats service",
  "Screen, battery & board-level diagnostics",
  "On-site fleet support for schools & business",
  "Quick training options in our service centre",
];

export const repairDevices = ["Mac", "iPhone", "iPad", "Apple Watch", "iPod", "Beats"];

export const chapters = [
  { n: "01", title: "New Devices", body: "The latest Apple hardware — iPhone, Mac, iPad and Watch — through an authorised South African reseller." },
  { n: "02", title: "Pre-Owned Devices", body: "Carefully graded pre-owned Apple devices, checked by certified technicians before they reach the shelf." },
  { n: "03", title: "Reliable Repairs", body: "A leading KwaZulu-Natal Apple Service Provider. Warranty and out-of-warranty repairs by certified technicians." },
  { n: "04", title: "Software & Consulting", body: "Application development, IT consultancy and managed services for enterprises, education and professionals." },
];

export const STATUS_FLOWS = {
  product: ["Received", "Quoting", "Quote sent", "Confirmed", "Completed"],
  repair: ["Received — awaiting assessment", "Assessing", "Quote sent", "Approved — in repair", "Ready for collection", "Completed"],
};

export const CANCEL_STATUS = "Cancelled";

export const TRADE_IN = {
  iPhone: [
    { label: "iPhone 15 / 16 series", base: [9000, 14000] },
    { label: "iPhone 13 / 14 series", base: [5000, 9000] },
    { label: "iPhone 11 / 12 series", base: [2500, 5000] },
    { label: "iPhone X or older", base: [800, 2500] },
  ],
  Mac: [
    { label: "Apple-silicon MacBook Pro", base: [9000, 16000] },
    { label: "Apple-silicon MacBook Air", base: [7000, 12000] },
    { label: "Intel Mac / iMac", base: [2500, 6000] },
    { label: "Mac mini / older desktops", base: [1500, 4500] },
  ],
  iPad: [
    { label: "iPad Pro (M-series)", base: [5000, 9000] },
    { label: "iPad Air / iPad mini", base: [3000, 5500] },
    { label: "Standard / older iPad", base: [1000, 3000] },
  ],
  "Apple Watch": [
    { label: "Ultra / Series 9 – 10", base: [2500, 5000] },
    { label: "Series 6 – 8 / SE", base: [1200, 2500] },
    { label: "Series 5 or older", base: [400, 1200] },
  ],
};

export const CONDITION_MULTIPLIERS = [
  { id: "like-new", label: "Like new", desc: "No marks, battery healthy, box & accessories", m: 1 },
  { id: "good", label: "Good", desc: "Light wear, fully working", m: 0.85 },
  { id: "fair", label: "Fair", desc: "Visible wear or ageing battery", m: 0.7 },
  { id: "damaged", label: "Damaged", desc: "Cracks, faults or heavy wear", m: 0.4 },
];
