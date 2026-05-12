import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authenticateUser, readUsers, writeUsers, hashPassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';


const handler = NextAuth({
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
    async signIn({ user, account, profile: googleProfile }) {
      if (account?.provider === 'google') {
        const { data: existingUser, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!existingUser) {
          // New Google user, profile will be created by the Supabase trigger if configured, 
          // but we'll do it manually here to be safe and include extra info.
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: user.name,
            username: user.email?.split('@')[0],
            avatar_url: user.image,
            updated_at: new Date().toISOString(),
          });
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
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
});

export { handler as GET, handler as POST };

