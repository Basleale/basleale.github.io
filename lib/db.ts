import { sql } from "@vercel/postgres";
import type { User as AuthUser } from 'next-auth';

// Define interfaces for your data structures
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  profile_picture?: string;
  created_at: string;
}

export interface MediaItem {
  id: string;
  name: string;
  original_name?: string;
  type: 'image' | 'video';
  extension?: string;
  url: string;
  file_size?: number;
  uploaded_at: string;
  uploaded_by: string;
  tags?: string[];
}

// --- USER FUNCTIONS ---
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const { rows } = await sql<User>`SELECT * FROM users WHERE email = ${email} LIMIT 1;`;
  return rows[0];
}

export async function findUserById(id: string): Promise<User | undefined> {
    const { rows } = await sql<User>`SELECT * FROM users WHERE id = ${id} LIMIT 1;`;
    return rows[0];
}


export async function createUser(id: string, name: string, email: string, passwordHash: string): Promise<User> {
  const { rows } = await sql<User>`
    INSERT INTO users (id, name, email, password_hash)
    VALUES (${id}, ${name}, ${email}, ${passwordHash})
    RETURNING id, name, email, created_at, profile_picture;
  `;
  return rows[0];
}

export async function getAllUsers(currentUserId: string): Promise<Omit<User, 'password_hash'>[]> {
    const { rows } = await sql`SELECT id, name, email, profile_picture FROM users WHERE id != ${currentUserId};`;
    return rows;
}


// --- MEDIA FUNCTIONS ---
export async function getAllMedia(): Promise<MediaItem[]> {
    const { rows } = await sql<MediaItem>`SELECT * FROM media ORDER BY uploaded_at DESC;`;
    return rows;
}

export async function insertMedia(item: Omit<MediaItem, 'uploaded_at' | 'tags'>): Promise<void> {
    await sql`
        INSERT INTO media (id, name, original_name, type, extension, url, file_size, uploaded_by)
        VALUES (${item.id}, ${item.name}, ${item.original_name}, ${item.type}, ${item.extension}, ${item.url}, ${item.file_size}, ${item.uploaded_by});
    `;
}

export async function deleteMediaItems(ids: string[]): Promise<void> {
    await sql`DELETE FROM media WHERE id = ANY(${ids});`;
}


// --- LIKES AND COMMENTS ---
export async function getLikes(mediaId: string) {
    const { rows } = await sql`SELECT user_id FROM media_likes WHERE media_id = ${mediaId};`;
    return rows;
}

export async function addLike(mediaId: string, userId: string) {
    await sql`INSERT INTO media_likes (media_id, user_id) VALUES (${mediaId}, ${userId}) ON CONFLICT DO NOTHING;`;
}

export async function removeLike(mediaId: string, userId: string) {
    await sql`DELETE FROM media_likes WHERE media_id = ${mediaId} AND user_id = ${userId};`;
}

export async function getComments(mediaId: string) {
    const { rows } = await sql`SELECT * FROM media_comments WHERE media_id = ${mediaId} ORDER BY created_at ASC;`;
    return rows;
}

export async function addComment(mediaId: string, userId: string, userName: string, profilePicture: string | undefined, content: string) {
    const { rows } = await sql`
        INSERT INTO media_comments (media_id, user_id, user_name, user_profile_picture, content)
        VALUES (${mediaId}, ${userId}, ${userName}, ${profilePicture}, ${content})
        RETURNING *;
    `;
    return rows[0];
}

// --- CHAT FUNCTIONS ---

export async function getPublicMessages() {
    const { rows } = await sql`SELECT * FROM public_messages ORDER BY created_at ASC;`;
    return rows;
}

export async function addPublicMessage(message: any) {
    const { rows } = await sql`
        INSERT INTO public_messages (content, media_url, media_type, sender_id, sender_name, sender_profile_picture)
        VALUES (${message.content}, ${message.mediaUrl}, ${message.mediaType}, ${message.senderId}, ${message.senderName}, ${message.senderProfilePicture})
        RETURNING *;
    `;
    return rows[0];
}

export async function getPrivateMessages(user1Id: string, user2Id: string) {
    const { rows } = await sql`
        SELECT * FROM private_messages 
        WHERE (sender_id = ${user1Id} AND receiver_id = ${user2Id}) OR (sender_id = ${user2Id} AND receiver_id = ${user1Id})
        ORDER BY created_at ASC;
    `;
    return rows;
}

export async function addPrivateMessage(message: any) {
    const { rows } = await sql`
        INSERT INTO private_messages (content, media_url, media_type, sender_id, receiver_id)
        VALUES (${message.content}, ${message.mediaUrl}, ${message.mediaType}, ${message.senderId}, ${message.receiverId})
        RETURNING *;
    `;
    return rows[0];
}

export async function getConversations(userId: string) {
    const { rows } = await sql`
        SELECT DISTINCT ON (u.id)
            u.id,
            u.name,
            u.email,
            u.profile_picture
        FROM users u
        JOIN private_messages pm ON u.id = pm.sender_id OR u.id = pm.receiver_id
        WHERE (pm.sender_id = ${userId} OR pm.receiver_id = ${userId}) AND u.id != ${userId};
    `;
    return rows;
}