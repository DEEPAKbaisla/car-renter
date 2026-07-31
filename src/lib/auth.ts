import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDb from "./db";
import User from "@/model/userModel";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        let email = credentials?.email;
        let password = credentials?.password;
        if (!email || !password) {
          throw new Error("email or password is not found");
        }
        await connectDb();
        let user = await User.findOne({ email });
        if (!user) {
          throw new Error("user not found");
        }
        let isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error("incorrect Password");
        }
        if (user.isBlocked) {
          throw new Error("Account is not available");
        }
        if (user.isVerified !== true) {
          throw new Error("Please verify your email before logging in");
        }
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === "google") {
        await connectDb();
        let existUser = await User.findOne({ email: user.email });
        if (!existUser) {
          existUser = await User.create({
            email: user?.email,
            name: user?.name,
            role: "user",
            isVerified: true,
          });
        }
        user.id = existUser._id as string;
        (user as any).role = existUser.role;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = (user as any).role;
        token.isBlocked = false;
      } else if (token.id) {
        await connectDb();
        const dbUser = await User.findById(token.id).select("isBlocked");
        token.isBlocked = dbUser?.isBlocked ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXT_AUTH_SECRET,
};

export default authOptions;
