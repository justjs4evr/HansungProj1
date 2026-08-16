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
  amenities: [String],
  imageUrl: String,
});
const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

// Custom tailored amenities for each specific Chicago hotel
const tailoredHotelAmenities = {
  'The Grand Palmer': ['Historic Tiffany Ceiling', 'Empire Dining Room', 'French Bistro', 'Fitness Center & Pool', 'Valet Parking', 'Executive Club Lounge'],
  'Palmer Hotel': ['Historic Tiffany Ceiling', 'Empire Dining Room', 'French Bistro', 'Fitness Center & Pool', 'Valet Parking', 'Executive Club Lounge'],
  'Seaside Inn': ['Riverwalk Access', 'Floor-to-Ceiling Windows', 'Rooftop Lounge', 'Craft Cocktail Bar', 'Valet Parking', '24/7 Fitness Studio'],
  'Mountain Retreat': ['Cozy Fireplace Suites', 'Heated Indoor Pool', 'Mountain View Balcony', 'Spa & Wellness Center', 'Complimentary Hot Breakfast', 'Ski & Bike Storage'],
  'Conrad Hotel': ['Rooftop Terrace Lounge', 'Bourbon & Cigar Lounge', 'Luxury Spa & Sauna', 'Skyline View Suites', 'Valet Parking', 'Personal Concierge'],
  'Hyatt Hotel': ['Regency Club Lounge', 'Heated Indoor Pool', '24-Hour Fitness Center', 'Convention Center Skywalk', 'Panoramic River Views', '24/7 In-Room Dining'],
  'Omni Hotel': ['Rooftop Pool & Deck', '676 Restaurant & Bar', 'Sundeck Lounge', 'Modern Fitness Center', 'Valet Parking', 'Pet-Friendly Amenities'],
  'Fairmont Hotel': ['Millennium Park Views', 'Signature Spa & Sauna', 'Gastropub Dining', 'Gold Executive Lounge', 'Fitness Studio', 'Valet Parking'],
  'Sheraton Hotel': ['Chicago River Views', 'Indoor Heated Pool', 'Club Level Lounge', "Shula's Steak House", '24/7 Fitness Center', 'Event Ballrooms'],
  'Knickerbocker Hotel': ['Historic Martini Bar', 'Grand Crystal Ballroom', 'Magnificent Mile Location', 'Modern Fitness Center', 'Valet Parking', 'Concierge Service'],
  'Homewood Hotel': ['All-Suite Accommodations', 'Fully Equipped Kitchens', 'Complimentary Hot Breakfast', 'Fitness Center', 'Grocery Shopping Service', 'Pet Friendly'],
  'Swissotel Hotel': ['360 Skyline Views', 'Penthouse Fitness Center', 'The Palm Restaurant', 'Full-Service Spa', 'Valet Parking', 'Family Suites'],
  'Ambassador Hotel': ['Historic Gold Coast Location', 'Boutique Lounge Bar', 'Classic Architectural Detail', 'Fitness Center', 'Valet Parking', 'Pet Friendly'],
  'Affinia Hotel': ['Boutique Suites', 'In-Room Spa Treatments', 'Fitness Center', 'Pet Amenities', 'Valet Parking', 'Complimentary Evening Wine Hour'],
  'Hardrock Hotel': ['Rock Music Museum', 'Rooftop Bar & Lounge', 'Fender Guitar Rental', 'Body Rock Fitness', 'Valet Parking', 'Live Entertainment'],
  'Talbott Hotel': ['Boutique Luxury Suites', 'Gold Coast Restaurant', 'Fireplace Lounge', 'Fitness Studio', 'Valet Parking', 'Pet Friendly'],
  'Hilton Hotel': ['Grand Ballroom', 'Athletic Club & Pool', 'Authentic Irish Pub', 'Executive Lounge', 'Valet Parking', 'Concierge Service'],
  'James Hotel': ['Primehouse Steakhouse', 'Rotating Art Gallery', 'Spa Services', 'Fitness Studio', 'Pet Friendly', 'Valet Parking'],
  'Monaco Hotel': ['Chicago River Views', 'Nightly Hosted Wine Hour', 'Pet Friendly Program', 'Yoga Mats in Room', 'Fitness Center', 'Valet Parking'],
  'Sofitel Hotel': ['French Luxury Architecture', 'CDA Fine Dining', 'Le Bar Lounge', 'Fitness Center', 'Valet Parking', 'Concierge Service'],
  'Intercontinental Hotel': ['Historic 1920s Junior Olympic Pool', 'Magnificent Mile Location', 'Michael Jordan Steak House', 'Spa & Sauna', 'Valet Parking', 'Fitness Center'],
  'Allegro Hotel': ['Classic Art Deco Design', '312 Chicago Restaurant', 'Nightly Wine Hour', 'Fitness Center', 'Pet Friendly', 'Valet Parking'],
  'Amalfi Hotel': ['Custom Luxury Bedding', 'Complimentary Nightly Cocktail Reception', 'Boutique Experience', 'Fitness Studio', 'Valet Parking', 'Concierge Service']
};

const defaultAmenities = ['Rooftop Pool', 'Luxury Spa', 'Valet Parking', '24/7 Room Service', 'Fitness Center', 'Fine Dining'];

async function applyTailoredAmenities() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const hotels = await Hotel.find({});
    console.log(`Found ${hotels.length} hotels in database.`);

    let updatedCount = 0;
    for (const hotel of hotels) {
      const tailored = tailoredHotelAmenities[hotel.name] || defaultAmenities;
      hotel.amenities = tailored;
      await hotel.save();
      console.log(`Updated ${hotel.name} (${tailored.length} tags): ${tailored.join(', ')}`);
      updatedCount++;
    }

    console.log(`Successfully updated all ${updatedCount} hotels with 5-6 realistic, tailored amenities!`);
  } catch (err) {
    console.error('Error updating amenities:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

applyTailoredAmenities();
