import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for Google OAuth users
  email: { type: String, unique: true, sparse: true },
  googleId: { type: String, unique: true, sparse: true },
  displayName: { type: String },
  bio: { type: String, default: "I am a new reviewer on TrustHotel!" },
  avatarUrl: { type: String },
  verificationStatus: { type: Boolean, default: false },
  reviewLimit: { type: Number, default: 3 }, // 3 per day standard, 10 if verified
  trustedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  amenities: [String],
  priceCategory: { type: String }, // Legacy e.g. "$", "$$", "$$$"
  pricePerNight: { type: Number, default: 250 }, // Real numerical price
  rating: { type: Number, default: 0 },
  imageUrl: { type: String },
});

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  verifiedBooking: { type: Boolean, default: false },
  aiTrustScore: { type: Number, default: null }, // 0-100
  aiAnalysis: { type: Object, default: {} },
  moderationStatus: { type: String, enum: ['approved', 'flagged', 'rejected'], default: 'approved' },
  createdAt: { type: Date, default: Date.now },
});

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'completed' },
  verified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
