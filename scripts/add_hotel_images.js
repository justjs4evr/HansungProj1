import mongoose from 'mongoose';
import { Hotel } from '../src/lib/db/models.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const hotelImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80"
];

async function updateHotelImages() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const hotels = await Hotel.find({});
  console.log(`Found ${hotels.length} hotels`);

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i];
    const imageUrl = hotelImages[i % hotelImages.length];
    hotel.imageUrl = imageUrl;
    await hotel.save();
  }

  console.log('Successfully updated all hotels with image URLs!');
  process.exit(0);
}

updateHotelImages().catch(err => {
  console.error(err);
  process.exit(1);
});
