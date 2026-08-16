import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const HotelSchema = new mongoose.Schema({
  name: String,
  location: String,
  priceCategory: String,
  pricePerNight: Number,
  amenities: [String],
});
const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

// Realistic average nightly rates in Chicago (USD)
const realisticPrices = {
  'The Grand Palmer': 285,
  'Palmer Hotel': 285,
  'Seaside Inn': 190,
  'Mountain Retreat': 220,
  'Conrad Hotel': 415,
  'Hyatt Hotel': 260,
  'Omni Hotel': 320,
  'Fairmont Hotel': 350,
  'Sheraton Hotel': 245,
  'Knickerbocker Hotel': 210,
  'Homewood Hotel': 185,
  'Swissotel Hotel': 295,
  'Ambassador Hotel': 230,
  'Affinia Hotel': 205,
  'Hardrock Hotel': 275,
  'Talbott Hotel': 240,
  'Hilton Hotel': 265,
  'James Hotel': 310,
  'Monaco Hotel': 255,
  'Sofitel Hotel': 340,
  'Intercontinental Hotel': 380,
  'Allegro Hotel': 215,
  'Amalfi Hotel': 250
};

async function updateHotelPrices() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const hotels = await Hotel.find({});
    console.log(`Found ${hotels.length} hotels in database.`);

    for (const hotel of hotels) {
      const price = realisticPrices[hotel.name] || 250;
      hotel.pricePerNight = price;
      await hotel.save();
      console.log(`Updated ${hotel.name}: $${price}/night`);
    }

    console.log(`Successfully updated numerical pricing for all hotels!`);
  } catch (err) {
    console.error('Error updating prices:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateHotelPrices();
