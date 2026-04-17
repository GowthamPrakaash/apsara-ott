import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';
import { users, permissions } from './schema.js';
import { eq } from 'drizzle-orm';

type Permission = typeof schema.permissionEnum.enumValues[number];

const DATABASE_URL = process.env.DATABASE_URL ?? '';
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? 'gowthamprakaash@gmail.com';

if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL is not set. Run: npm run db:seed (not npx tsx directly)');
	process.exit(1);
}

async function seed() {
	const client = postgres(DATABASE_URL);
	const db = drizzle(client, { schema });

	console.log('🌱 Seeding database...');

	const existing = await db.query.users.findFirst({
		where: eq(users.email, SUPER_ADMIN_EMAIL)
	});

	if (existing) {
		await db
			.update(users)
			.set({ role: 'super_admin' })
			.where(eq(users.id, existing.id));

		const allPermissions: Permission[] = [
			'edit_movies', 'edit_series', 'edit_episodes',
			'edit_genres', 'manage_users'
		];

		for (const perm of allPermissions) {
			await db
				.insert(permissions)
				.values({ userId: existing.id, permission: perm })
				.onConflictDoNothing();
		}
		console.log(`✅ Super admin updated: ${SUPER_ADMIN_EMAIL}`);
	} else {
		console.log(`ℹ️  ${SUPER_ADMIN_EMAIL} not found — sign in with Google first, then re-run seed.`);
	}

	await client.end();
	console.log('✅ Done!');
}

seed().catch((err) => {
	console.error('Seed failed:', err?.message ?? err);
	process.exit(1);
});
