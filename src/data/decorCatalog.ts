import type { CatalogEntry } from './vegFruitCatalog';

// These tables only had English/Tamil columns (no Thanglish) — thanglish
// falls back to the English name for display purposes.
function entry(en: string, ta: string): CatalogEntry {
  return { en, ta, thanglish: en };
}

export const poojaAndDiya: CatalogEntry[] = [
  entry('Diya', 'அகல் விளக்கு'),
  entry('Clay Diya', 'மண் அகல் விளக்கு'),
  entry('Brass Diya', 'பித்தளை விளக்கு'),
  entry('Hanging Diya', 'தொங்கும் விளக்கு'),
  entry('Diya Stand', 'விளக்கு ஸ்டாண்ட்'),
  entry('Diya Set', 'விளக்கு தொகுப்பு'),
  entry('Decorative Diya', 'அலங்கார விளக்கு'),
  entry('Urli', 'உருளி'),
  entry('Pooja Thali', 'பூஜை தட்டு'),
  entry('Pooja Bell', 'பூஜை மணி'),
  entry('Brass Bell', 'பித்தளை மணி'),
  entry('Incense Holder', 'ஊதுபத்தி ஸ்டாண்ட்'),
  entry('Camphor Holder', 'கற்பூர தட்டு'),
  entry('Kumkum Box', 'குங்குமச் சிமிழ்'),
  entry('Pooja Box', 'பூஜை பெட்டி'),
  entry('God Idol', 'சாமி சிலை'),
  entry('Temple Door Decor', 'பூஜை அறை அலங்காரம்'),
  entry('Toran', 'தோரணம்'),
  entry('Bandhanwar', 'பந்தன்வார்'),
];

export const bambooCaneJute: CatalogEntry[] = [
  entry('Bamboo Basket', 'மூங்கில் கூடை'),
  entry('Cane Basket', 'பிரம்புக் கூடை'),
  entry('Storage Basket', 'சேமிப்பு கூடை'),
  entry('Jute Basket', 'சணல் கூடை'),
  entry('Bamboo Tray', 'மூங்கில் தட்டு'),
  entry('Cane Tray', 'பிரம்புத் தட்டு'),
  entry('Bamboo Wall Decor', 'மூங்கில் சுவர் அலங்காரம்'),
  entry('Jute Wall Hanging', 'சணல் சுவர் அலங்காரம்'),
  entry('Jute Rope Decor', 'சணல் கயிறு அலங்காரம்'),
  entry('Bamboo Lamp', 'மூங்கில் விளக்கு'),
  entry('Cane Lamp', 'பிரம்பு விளக்கு'),
  entry('Bamboo Planter', 'மூங்கில் செடி கூடை'),
];

export const homeTextiles: CatalogEntry[] = [
  entry('Cushion Cover', 'மெத்தை உறை'),
  entry('Cushion', 'மெத்தை'),
  entry('Throw Pillow', 'அலங்கார தலையணை'),
  entry('Floor Cushion', 'தரை மெத்தை'),
  entry('Table Runner', 'மேசை விரிப்பு'),
  entry('Table Mat', 'மேசை விரிப்பு'),
  entry('Placemat', 'உணவு மேசை விரிப்பு'),
  entry('Curtain', 'திரை'),
  entry('Door Curtain', 'கதவு திரை'),
  entry('Door Mat', 'கதவு மிதியடி'),
  entry('Floor Mat', 'தரை மிதியடி'),
  entry('Rug', 'கம்பளம்'),
  entry('Dhurrie', 'தரைவிரிப்பு'),
  entry('Carpet', 'கம்பளம்'),
  entry('Throw', 'போர்வை'),
  entry('Bedspread', 'படுக்கை விரிப்பு'),
  entry('Decorative Blanket', 'அலங்கார போர்வை'),
];
