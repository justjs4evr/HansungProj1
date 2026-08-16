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
    console.log(`Found ${hotels.length} hotels. Requesting AI tags...`);

    const prompt = `
    You are an expert luxury travel agent. Provide exactly 30 unique, premium hotel amenities (e.g., "Rooftop Infinity Pool", "Award-winning Spa", "Michelin-star Dining", "24/7 Butler Service").
    Do not use basic ones like WiFi or Air Conditioning.
    
    Return strictly raw JSON. It must be a single JSON array of strings. No markdown formatting, no backticks, no explanations.
    `;

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
    
    const luxuryAmenities = JSON.parse(content);
    console.log(`AI successfully generated ${luxuryAmenities.length} premium amenities!`);
    
    let updatedCount = 0;
    for (const hotel of hotels) {
      // Shuffle array and pick 3-4
      const shuffled = [...luxuryAmenities].sort(() => 0.5 - Math.random());
      const newAmenities = shuffled.slice(0, Math.floor(Math.random() * 2) + 3); // 3 or 4
      
      hotel.amenities = newAmenities;
      await hotel.save();
      console.log(`Updated ${hotel.name}: ${newAmenities.join(', ')}`);
      updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} hotels with AI generated amenities!`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

generateAmenities();
