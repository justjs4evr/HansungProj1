import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const HotelSchema = new mongoose.Schema({
  name: String,
  location: String,
  priceCategory: String,
  amenities: [String],
  imageUrl: String,
});
const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

const luxuryTags = [
  "Rooftop Pool", "Award-winning Spa", "Valet Parking", "Michelin Dining", 
  "In-room Massage", "Private Balcony", "Lake View", "Historic Architecture",
  "24/7 Room Service", "Fitness Center", "Live Jazz Bar", "Helipad Access",
  "Concierge Service", "Pet Friendly", "EV Charging", "Premium Bedding",
  "Smart Room Tech", "Personal Butler", "Art Collection", "Heated Floors",
  "Infinity Pool", "Wine Cellar", "Gourmet Breakfast", "Executive Lounge"
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  const hotels = await Hotel.find({});
  
  for (const hotel of hotels) {
    const shuffled = [...luxuryTags].sort(() => 0.5 - Math.random());
    hotel.amenities = shuffled.slice(0, 3);
    await hotel.save();
    console.log(`Updated ${hotel.name}: ${hotel.amenities.join(', ')}`);
  }
  
  console.log("Done!");
  process.exit(0);
}
run();
