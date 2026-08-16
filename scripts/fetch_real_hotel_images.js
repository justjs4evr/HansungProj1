import mongoose from 'mongoose';
import { Hotel } from '../src/lib/db/models.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

// Fallback images if Wikipedia search fails
const fallbackImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
];

async function fetchWikipediaImage(hotelName) {
  try {
    // Clean up the name to improve search results
    let searchQuery = hotelName.replace(' Hotel', '').replace(' Chicago', '') + ' Hotel Chicago';
    console.log(`Searching Wikipedia for: ${searchQuery}`);
    
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=1&prop=pageimages&piprop=original&format=json`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TrustHotelPlatformBot/1.0 (contact@trusthotel.test)'
      }
    });
    const data = await response.json();
    
    if (data.query && data.query.pages) {
      const pages = data.query.pages;
      const firstPageId = Object.keys(pages)[0];
      const page = pages[firstPageId];
      
      if (page.original && page.original.source) {
        return page.original.source;
      }
    }
    console.log(`No Wikipedia image found for ${hotelName}`);
    return null;
  } catch (error) {
    console.error(`Error fetching Wikipedia image for ${hotelName}:`, error);
    return null;
  }
}

async function updateRealHotelImages() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const hotels = await Hotel.find({});
  console.log(`Found ${hotels.length} hotels`);

  let successCount = 0;

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i];
    
    // Some manual overrides for common problematic names in the dataset to ensure we get good pictures
    let searchName = hotel.name;
    if (searchName.includes('Palmer')) searchName = 'Palmer House Hilton';
    if (searchName.includes('Hard Rock')) searchName = 'Hard Rock Hotel Chicago';
    if (searchName.includes('Hyatt Regency')) searchName = 'Hyatt Regency Chicago';
    if (searchName.includes('Conrad')) searchName = 'Conrad Chicago';
    if (searchName.includes('Knickerbocker')) searchName = 'Millennium Knickerbocker Hotel';
    if (searchName.includes('Sheraton')) searchName = 'Sheraton Grand Chicago';
    if (searchName.includes('Swissotel')) searchName = 'Swissôtel Chicago';
    if (searchName.includes('Omni')) searchName = 'Omni Chicago Hotel';
    if (searchName.includes('Amalfi')) searchName = 'Amalfi Hotel Chicago';
    if (searchName.includes('Homewood Suites')) searchName = 'Homewood Suites by Hilton Chicago Downtown';
    if (searchName.includes('InterContinental')) searchName = 'InterContinental Chicago Magnificent Mile';

    const imageUrl = await fetchWikipediaImage(searchName);
    
    if (imageUrl) {
      hotel.imageUrl = imageUrl;
      await hotel.save();
      successCount++;
      console.log(`Updated ${hotel.name} with ${imageUrl}`);
    } else {
      // Keep existing Unsplash image or use a fallback
      hotel.imageUrl = hotel.imageUrl || fallbackImages[i % fallbackImages.length];
      await hotel.save();
    }
    
    // Be nice to Wikipedia API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`Successfully updated ${successCount}/${hotels.length} hotels with real Wikipedia images!`);
  process.exit(0);
}

updateRealHotelImages().catch(err => {
  console.error(err);
  process.exit(1);
});
