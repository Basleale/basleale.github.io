-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media table to store metadata
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  type VARCHAR(50) NOT NULL,
  extension VARCHAR(10),
  blob_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by VARCHAR(255)
);

-- Create public_messages table
CREATE TABLE IF NOT EXISTS public_messages (
  id SERIAL PRIMARY KEY,
  content TEXT,
  media_url TEXT,
  media_type VARCHAR(50),
  sender_id VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create private_messages table
CREATE TABLE IF NOT EXISTS private_messages (
  id SERIAL PRIMARY KEY,
  content TEXT,
  media_url TEXT,
  media_type VARCHAR(50),
  sender_id VARCHAR(255) NOT NULL,
  receiver_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media_comments table
CREATE TABLE IF NOT EXISTS media_comments (
  id SERIAL PRIMARY KEY,
  media_id TEXT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_profile_picture TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media_likes table
CREATE TABLE IF NOT EXISTS media_likes (
  id SERIAL PRIMARY KEY,
  media_id TEXT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  UNIQUE(media_id, user_id)
);