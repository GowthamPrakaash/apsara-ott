import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { db } from '$lib/server/db';
import {
	accounts,
	sessions,
	users,
	verificationTokens
} from '$lib/server/db/schema';
import { SUPER_ADMIN_EMAIL } from '$lib/server/config';
import { eq } from 'drizzle-orm';

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens
	}),
	providers: [Google],
	callbacks: {
		async session({ session, user }) {
			const userId = (user as { id?: string })?.id;
			if (userId && session.user) {
				session.user.id = userId;
				const dbUser = await db.query.users.findFirst({
					where: eq(users.id, userId),
					columns: { role: true }
				});
				if (dbUser) {
					(session.user as unknown as Record<string, unknown>).role = dbUser.role;
				}
			}
			return session;
		},
		async signIn({ user }) {
			if (!user.email) return false;
			if (user.email === SUPER_ADMIN_EMAIL) {
				// Update role to super_admin on first login
				await db
					.update(users)
					.set({ role: 'super_admin' })
					.where(eq(users.email, SUPER_ADMIN_EMAIL));
			}
			return true;
		}
	},
	pages: {
		signIn: '/login'
	},
	trustHost: true
});
