import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Hotel, Review, Booking } from '../src/lib/db/models.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Hotel.deleteMany({});
  await Review.deleteMany({});
  await Booking.deleteMany({});

  console.log('Cleared existing data');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Create Users
  const users = await User.insertMany([
    { username: 'alice', password: passwordHash, displayName: 'Alice Verified', verificationStatus: true, reviewLimit: 10 },
    { username: 'bob', password: passwordHash, displayName: 'Bob Standard', verificationStatus: false, reviewLimit: 3 },
    { username: 'spammer99', password: passwordHash, displayName: 'Spammy Sam', verificationStatus: false, reviewLimit: 3 },
    { username: 'testuser', password: passwordHash, displayName: 'Test User', verificationStatus: true, reviewLimit: 10 },
  ]);

  // Set up some trust relationships
  users[0].trustedUsers.push(users[1]._id);
  users[1].trustedUsers.push(users[0]._id);
  users[3].trustedUsers.push(users[0]._id);
  await Promise.all(users.map(u => u.save()));

  // 2. Create Hotels
  const hotels = await Hotel.insertMany([
    { name: 'The Grand Palmer', location: 'Chicago, IL', priceCategory: '$$$', rating: 4.5, amenities: ['Pool', 'Spa', 'Free WiFi', 'Gym'] },
    { name: 'Seaside Inn', location: 'Miami, FL', priceCategory: '$$', rating: 3.8, amenities: ['Beachfront', 'Free Breakfast', 'WiFi'] },
    { name: 'Mountain Retreat', location: 'Denver, CO', priceCategory: '$$', rating: 4.2, amenities: ['Hiking Trails', 'Fireplace', 'Pet Friendly'] }
  ]);

  // 3. Create Bookings (to allow reviews)
  await Booking.insertMany([
    { userId: users[0]._id, hotelId: hotels[0]._id, status: 'completed', verified: true },
    { userId: users[1]._id, hotelId: hotels[0]._id, status: 'completed', verified: true },
    { userId: users[3]._id, hotelId: hotels[1]._id, status: 'completed', verified: true },
    { userId: users[2]._id, hotelId: hotels[2]._id, status: 'completed', verified: false } // unverified booking
  ]);

  // 4. Create Reviews (Synthetic Kaggle-like deceptive and truthful)
  const reviews = [
    {
      userId: users[0]._id,
      hotelId: hotels[0]._id,
      text: 'I stayed at the Grand Palmer for 3 nights. The pool was well maintained and the free WiFi was fast. The room was clean, though the gym was a bit small. Overall a very solid experience matching what they advertised.',
      rating: 4,
      verifiedBooking: true,
      aiTrustScore: 92,
      aiAnalysis: {
        specificity: 0.9, consistency: 0.95, spam_likelihood: 0.05, template_likelihood: 0.1, hotel_fact_consistency: 0.9, reasoning_summary: 'Highly specific and consistent with amenities.'
      }
    },
    {
      userId: users[1]._id,
      hotelId: hotels[0]._id,
      text: 'Good hotel. Nice pool. Had a good time.',
      rating: 4,
      verifiedBooking: true,
      aiTrustScore: 70,
      aiAnalysis: {
        specificity: 0.3, consistency: 0.8, spam_likelihood: 0.2, template_likelihood: 0.4, hotel_fact_consistency: 0.8, reasoning_summary: 'Generic but consistent.'
      }
    },
    {
      userId: users[2]._id, // spammer
      hotelId: hotels[0]._id,
      text: 'WOW THE GRAND PALMER IS THE BEST HOTEL EVER!! I LOVE THE GRAND PALMER! EVERYONE SHOULD STAY AT THE GRAND PALMER. BEST SERVICE. BEST ROOMS. BEST FOOD. GRAND PALMER GRAND PALMER GRAND PALMER!!!!',
      rating: 5,
      verifiedBooking: false,
      aiTrustScore: 15,
      aiAnalysis: {
        specificity: 0.1, consistency: 0.5, spam_likelihood: 0.95, template_likelihood: 0.2, hotel_fact_consistency: 0.5, reasoning_summary: 'Highly repetitive and promotional language.'
      }
    },
    {
      userId: users[2]._id, // deceptive negative
      hotelId: hotels[1]._id,
      text: 'Terrible place. My wife and I stayed here on our anniversary. The bed was made of rocks and the front desk clerk literally yelled at us. Do not stay here under any circumstances. I usually love hotels in this area but this was a nightmare.',
      rating: 1,
      verifiedBooking: false,
      aiTrustScore: 35,
      aiAnalysis: {
        specificity: 0.5, consistency: 0.4, spam_likelihood: 0.6, template_likelihood: 0.7, hotel_fact_consistency: 0.4, reasoning_summary: 'Matches common deceptive negative review templates. Lacks specific hotel details.'
      }
    }
  ];

  await Review.insertMany(reviews);

  console.log('Seed data inserted successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
