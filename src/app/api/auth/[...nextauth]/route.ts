import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Extend types to include 'bio'
declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      bio?: string | null;
    };
  }
  interface User {
    bio?: string | null;
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    name?: string | null;
    picture?: string | null;
    bio?: string | null;
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 