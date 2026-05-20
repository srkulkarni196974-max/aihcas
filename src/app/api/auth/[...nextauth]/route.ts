import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authenticateUser, authenticateGoogle } from '@/lib/auth';

import { supabase } from '@/lib/supabase';

import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const result = await authenticateUser(credentials.email, credentials.password);
        if (result.success && result.user) {
          return {
            id: result.user.userId,
            name: result.user.name,
            email: result.user.email,
          };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // 1. Resolve canonical usr_... ID using authenticateGoogle
        const result = await authenticateGoogle(user.email || '', user.name || '');
        const canonicalId = result.user.userId;
        const legacyId = user.id; // Google numeric ID

        // Update the user object's ID so NextAuth uses the canonical ID
        user.id = canonicalId;

        // 2. Load profiles to check if we need to migrate/upsert
        const { data: canonicalProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', canonicalId)
          .maybeSingle();

        const { data: legacyProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', legacyId)
          .maybeSingle();

        if (legacyProfile) {
          if (!canonicalProfile) {
            // Update the legacy profile to use the canonical ID
            await supabase
              .from('profiles')
              .update({ id: canonicalId, updated_at: new Date().toISOString() })
              .eq('id', legacyId);
          } else {
            // Both exist. Merge clinical data if canonical is empty, and delete legacy
            const mergedHistory = [canonicalProfile.medical_history, legacyProfile.medical_history]
              .filter(Boolean)
              .join(', ');
            
            await supabase
              .from('profiles')
              .update({
                medical_history: mergedHistory || undefined,
                age: canonicalProfile.age || legacyProfile.age || undefined,
                gender: canonicalProfile.gender || legacyProfile.gender || undefined,
                blood_group: canonicalProfile.blood_group || legacyProfile.blood_group || undefined,
                height: canonicalProfile.height || legacyProfile.height || undefined,
                weight: canonicalProfile.weight || legacyProfile.weight || undefined,
                allergies: canonicalProfile.allergies || legacyProfile.allergies || undefined,
                emergency_contact_name: canonicalProfile.emergency_contact_name || legacyProfile.emergency_contact_name || undefined,
                emergency_contact_phone: canonicalProfile.emergency_contact_phone || legacyProfile.emergency_contact_phone || undefined,
                updated_at: new Date().toISOString()
              })
              .eq('id', canonicalId);

            await supabase
              .from('profiles')
              .delete()
              .eq('id', legacyId);
          }
        } else if (!canonicalProfile) {
          // No profile at all, create a new one under canonical ID
          await supabase.from('profiles').upsert({
            id: canonicalId,
            full_name: user.name,
            username: user.email?.split('@')[0],
            avatar_url: user.image,
            updated_at: new Date().toISOString(),
          });
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google') {
          // Double-check we use the canonical ID for Google sign-in
          const result = await authenticateGoogle(user.email || '', user.name || '');
          token.userId = result.user.userId;
        } else {
          token.userId = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).userId = token.userId;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'aihcas-secret-2026',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

