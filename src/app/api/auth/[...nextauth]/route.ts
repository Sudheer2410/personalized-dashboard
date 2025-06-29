import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'user' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Received credentials:', credentials);
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
        token.bio = user.bio;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session.user as any).bio = token.bio as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 