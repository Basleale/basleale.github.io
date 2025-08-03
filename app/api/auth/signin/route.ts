import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST() {
    try {
        // Drop existing tables to ensure a clean slate (optional, but good for a fresh start)
        await sql`DROP TABLE IF EXISTS users, media, public_messages, private_messages, media_comments, media_likes;`;

        // Create users table
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        profile_picture TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

        // Create media table
        await sql`
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        extension VARCHAR(10),
        url TEXT NOT NULL,
        file_size BIGINT,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        uploaded_by TEXT REFERENCES users(id)
      );
    `;

        // Create public_messages table
        await sql`
      CREATE TABLE IF NOT EXISTS public_messages (
        id SERIAL PRIMARY KEY,
        content TEXT,
        media_url TEXT,
        media_type VARCHAR(50),
        sender_id TEXT REFERENCES users(id),
        sender_name VARCHAR(255),
        sender_profile_picture TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

        // Create private_messages table
        await sql`
      CREATE TABLE IF NOT EXISTS private_messages (
        id SERIAL PRIMARY KEY,
        content TEXT,
        media_url TEXT,
        media_type VARCHAR(50),
        sender_id TEXT REFERENCES users(id),
        receiver_id TEXT REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

        // Create media_comments table
        await sql`
      CREATE TABLE IF NOT EXISTS media_comments (
        id SERIAL PRIMARY KEY,
        media_id TEXT REFERENCES media(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id),
        user_name VARCHAR(255),
        user_profile_picture TEXT,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

        // Create media_likes table
        await sql`
      CREATE TABLE IF NOT EXISTS media_likes (
        id SERIAL PRIMARY KEY,
        media_id TEXT REFERENCES media(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id),
        UNIQUE(media_id, user_id)
      );
    `;

        return NextResponse.json({ message: "Database tables created successfully!" });
    } catch (error) {
        console.error("Database setup error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}