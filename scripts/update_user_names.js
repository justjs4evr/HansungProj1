import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  verificationStatus: { type: Boolean, default: false },
  reviewLimit: { type: Number, default: 3 },
  trustedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const realisticNames = [
  "Sarah Jenkins", "Michael Chen", "Elena Rostova", "David Miller", "Sophia Martinez",
  "Marcus Vance", "Olivia Taylor", "James Wilson", "Emma Watson", "Alexander Wright",
  "Isabella Garcia", "Liam O'Connor", "Ava Robinson", "Ethan Hunt", "Mia Zhang",
  "Benjamin Scott", "Charlotte Harris", "Lucas Dubois", "Amelia Patel", "Henry Cavill",
  "Harper Lee", "Sebastian Vance", "Evelyn Reed", "Jack Shepard", "Abigail Adams",
  "Daniel Craig", "Emily Blunt", "Matthew Ross", "Elizabeth Olsen", "Jackson Pollock",
  "Sofia Vergara", "Samuel Jackson", "Victoria Beckham", "David Sterling", "Grace Kelly",
  "Oliver Stone", "Chloe Bennett", "Leo DiCaprio", "Penelope Cruz", "Julian Alvarez",
  "Layla Hassan", "Gabriel Silva", "Nora Jones", "Anthony Vance", "Hannah Abbott",
  "Dylan O'Brien", "Zoe Saldana", "Caleb McLaughlin", "Stella McCartney", "Ryan Gosling",
  "Audrey Hepburn", "Nathan Drake", "Claire Danes", "Christian Bale", "Rachel McAdams",
  "Aaron Paul", "Samantha Fox", "Tyler Durden", "Jessica Chastain", "Brandon Stark"
];

async function updateReviewerNames() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users in database.`);

    let nameIdx = 0;
    for (const user of users) {
      // Don't rename Alice if it's our main demo profile, or rename display name nicely
      if (user.username === 'alice') {
        user.displayName = 'Alice Smith';
        await user.save();
        console.log(`Updated Alice -> Alice Smith`);
        continue;
      }

      const newDisplayName = realisticNames[nameIdx % realisticNames.length];
      // Generate clean username from display name
      const cleanUsername = newDisplayName.toLowerCase().replace(/[^a-z0-9]/g, '_') + `_${user._id.toString().slice(-4)}`;
      
      user.displayName = newDisplayName;
      user.username = cleanUsername;
      await user.save();

      console.log(`Updated user ${user._id} -> DisplayName: "${newDisplayName}", Username: "${cleanUsername}"`);
      nameIdx++;
    }

    console.log('Successfully updated all reviewer names with realistic, distinct human names!');
  } catch (err) {
    console.error('Error updating reviewer names:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateReviewerNames();
