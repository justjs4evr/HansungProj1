import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import dbConnect from "@/lib/db/mongodb";
import { User } from "@/lib/db/models";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Generate a clean username from email
            const baseUsername = user.email?.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user";
            let username = baseUsername;
            let counter = 1;
            
            // Ensure username is unique
            while (await User.findOne({ username })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }

            // Create new user via Google
            await User.create({
              username,
              email: user.email,
              googleId: account.providerAccountId,
              displayName: user.name,
              avatarUrl: user.image,
              verificationStatus: true,
              reviewLimit: 10,
              bio: "I just joined TrustHotel via Google!"
            });
          }
          return true;
        } catch (error) {
          console.error("SignIn Database Error:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: session.user.email }).lean();
        if (dbUser) {
          (session.user as any).id = dbUser._id.toString();
          (session.user as any).username = dbUser.username;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
});
