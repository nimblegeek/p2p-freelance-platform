import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import FacebookProvider from 'next-auth/providers/facebook';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'bankid',
      name: 'BankID',
      credentials: {
        personalNumber: { label: 'Personal Number', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.personalNumber) {
          return null;
        }

        // Find user by personal number
        const user = await prisma.user.findUnique({
          where: { personalNumber: credentials.personalNumber },
          include: { profile: true },
        });

        if (!user || !user.bankIdVerified) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || '',
      clientSecret: process.env.APPLE_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID || '',
      clientSecret: process.env.FACEBOOK_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        
        // Get additional user data
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            userType: true,
            bankIdVerified: true,
            personalNumber: true,
          },
        });

        if (userData) {
          session.user.userType = userData.userType;
          session.user.bankIdVerified = userData.bankIdVerified;
          session.user.personalNumber = userData.personalNumber;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.bankIdVerified = user.bankIdVerified;
        token.personalNumber = user.personalNumber;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
};
