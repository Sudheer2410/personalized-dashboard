import { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Type augmentation for 'bio'
declare module 'next-auth' {
  interface User {
    bio?: string | null;
  }
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      bio?: string | null;
    };
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    bio?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'user' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          credentials?.username === 'user' &&
          credentials?.password === 'password'
        ) {
          return {
            id: '1',
            name: 'Demo User',
            email: 'user@example.com',
            image: 'https://i.pravatar.cc/150?img=3',
            bio: 'This is a demo user profile.'
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.picture = user.image;
        if ('bio' in user) {
          token.bio = (user as User & { bio?: string }).bio ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.bio = token.bio as string;
      }
      return session;
    },
  },
}; 