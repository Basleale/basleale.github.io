// lib/blob-storage.ts
// This file is now simplified. Database interactions are in lib/db.ts
// We can keep the user interface here for type consistency across the app.

export interface BlobUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  profile_picture?: string;
  created_at: string;
}