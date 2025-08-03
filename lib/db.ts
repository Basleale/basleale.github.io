// lib/db.ts
import { sql } from "@vercel/postgres";
import { BlobUser } from "./blob-storage"; // Re-using the interface

// User Management
export async function findUserByEmail(email: string) {
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1;`;
  return rows[0] as BlobUser | undefined;
}

export async function createUser(name: string, email: string, passwordHash: string) {
  const { rows } = await sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${name}, ${email}, ${passwordHash})
    RETURNING id, name, email, created_at, profile_picture;
  `;
  return rows[0];
}

// You can expand this with more database functions as needed