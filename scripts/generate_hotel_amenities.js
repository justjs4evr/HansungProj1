import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!MONGODB_URI || !OPENROUTER_API_KEY) {
  console.error('Missing MONGODB_URI or OPENROUTER_API_KEY in .env.local');
  process.exit(1);
}

const HotelSchema = new mongoose.Schema({
  name: String,
  location: String,
  priceCategory: String,
  amenities: [String],
  imageUrl: String,
});
const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

async function generateAmenities() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const hotels = await Hotel.find({});
    console.log(`Found ${hotels.length} hotels. Requesting tailored AI tags one by one...`);

    let updatedCount = 0;
    
    for (const hotel of hotels) {
      console.log(`Asking Nemotron for tailored amenities for: ${hotel.name}...`);
      
      const prompt = `
      You are an expert luxury travel agent. Based on the real-world characteristics of the hotel "${hotel.name}" located in ${hotel.location}, provide exactly 3 specific, realistic premium amenities that this specific hotel is known for or would likely have.
      Do not use basic ones like WiFi or Air Conditioning. 
      EACH AMENITY MUST BE SHORT AND PUNCHY (MAX 2-4 WORDS). Example: "Historic Tea Service", "Lake View Balcony", "Rooftop Pool".
      
      Return strictly raw JSON. It must be a single JSON array of strings. No markdown formatting, no backticks, no explanations.
      `;

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'nvidia/nemotron-3.5-lightning:free',
            messages: [{ role: 'user', content: prompt }],
          })
        });

        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        
        // Clean up potential markdown wrapper
        if (content.startsWith('```json')) {
          content = content.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (content.startsWith('```')) {
          content = content.replace(/^```/, '').replace(/```$/, '').trim();
        }
        
        const tailoredAmenities = JSON.parse(content);
        
        if (Array.isArray(tailoredAmenities) && tailoredAmenities.length > 0) {
          hotel.amenities = tailoredAmenities;
          await hotel.save();
          console.log(`✅ Updated ${hotel.name}: ${tailoredAmenities.join(', ')}`);
          updatedCount++;
        }
        
        // Sleep for 1 second to avoid rate limiting on the free tier
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`❌ Failed to parse or fetch for ${hotel.name}:`, err.message);
      }
    }

    console.log(`Successfully updated ${updatedCount} hotels with TAILORED AI generated amenities!`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

generateAmenities();
