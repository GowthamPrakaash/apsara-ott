import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { DATABASE_URL } from '$lib/server/config';

const client = postgres(DATABASE_URL);
export const db = drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' });
