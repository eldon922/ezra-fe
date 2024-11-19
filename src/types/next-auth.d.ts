import 'next-auth';

declare module 'next-auth' {
    interface User {
        accessToken: string;
        isAdmin: boolean;
    }

    interface Session {
        user: User & {
            accessToken: string;
            isAdmin: boolean;
        } & DefaultSession["user"]
    }

    interface JWT {
        accessToken: string;
        isAdmin: boolean;
    }
} 