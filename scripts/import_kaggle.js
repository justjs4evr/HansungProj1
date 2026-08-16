import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import csv from 'csv-parser';
import { User, Hotel, Review, Booking } from '../src/lib/db/models.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const CSV_FILE_PATH = path.resolve(__dirname, '../deceptive-opinion.csv');

async function importKaggleData() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`CSV file not found at ${CSV_FILE_PATH}.`);
    console.error('Please download the dataset from Kaggle and place it as "deceptive-opinion.csv" in the root directory.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // We won't delete everything, just in case. Or maybe we should?
  // Let's create dummy users for the dataset
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // Use a map to keep track of hotels
  const hotelMap = new Map();
  
  // Use maps to keep track of users (e.g. 1 user per source to keep it simple, or generate unique users)
  // We'll generate a random user per review to make it realistic, or a pool of users.
  const userPool = [];
  for (let i = 0; i < 50; i++) {
    const isVerified = Math.random() > 0.5;
    userPool.push({
      username: `kaggle_user_${i}`,
      password: passwordHash,
      displayName: `Reviewer ${i}`,
      verificationStatus: isVerified,
      reviewLimit: isVerified ? 10 : 3
    });
  }
  const insertedUsers = await User.insertMany(userPool);

  const reviewsToInsert = [];
  let hotelCount = 0;

  console.log('Reading CSV...');

  fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv())
    .on('data', async (row) => {
      // row: { deceptive, hotel, polarity, source, text }
      let hotelName = row.hotel.trim();
      
      // Ensure hotel exists
      if (!hotelMap.has(hotelName)) {
        hotelMap.set(hotelName, {
          name: hotelName.charAt(0).toUpperCase() + hotelName.slice(1) + ' Hotel',
          location: 'Chicago, IL',
          priceCategory: '$$',
          rating: 0,
          amenities: ['WiFi', 'Air Conditioning']
        });
      }

      // Assign a random user from the pool
      const randomUser = insertedUsers[Math.floor(Math.random() * insertedUsers.length)];

      reviewsToInsert.push({
        userId: randomUser._id,
        hotelName: hotelName,
        text: row.text,
        rating: row.polarity === 'positive' ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 2) + 1, // positive: 4-5, negative: 1-2
        verifiedBooking: row.deceptive === 'truthful',
        // Mock the AI Trust score based on the true label for demo purposes
        aiTrustScore: row.deceptive === 'truthful' ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 20,
        aiAnalysis: {
          reasoning_summary: row.deceptive === 'truthful' ? 'Review appears grounded and truthful.' : 'Review exhibits patterns of deceptive opinion spam.',
        }
      });
    })
    .on('end', async () => {
      console.log('CSV parsed successfully. Inserting to DB...');
      
      // Insert Hotels
      const hotelsData = Array.from(hotelMap.values());
      const insertedHotels = await Hotel.insertMany(hotelsData);
      
      // Map hotel names to IDs
      const hotelIdMap = {};
      insertedHotels.forEach(h => {
        // Find the original name key
        for (let [key, val] of hotelMap.entries()) {
          if (val.name === h.name) hotelIdMap[key] = h._id;
        }
      });

      // Prepare reviews
      const finalReviews = reviewsToInsert.map(r => ({
        userId: r.userId,
        hotelId: hotelIdMap[r.hotelName],
        text: r.text,
        rating: r.rating,
        verifiedBooking: r.verifiedBooking,
        aiTrustScore: r.aiTrustScore,
        aiAnalysis: r.aiAnalysis
      }));

      await Review.insertMany(finalReviews);
      
      console.log(`Inserted ${insertedUsers.length} users, ${insertedHotels.length} hotels, and ${finalReviews.length} reviews from Kaggle dataset.`);
      process.exit(0);
    });
}

importKaggleData().catch(err => {
  console.error(err);
  process.exit(1);
});
