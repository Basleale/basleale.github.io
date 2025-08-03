// lib/blob-storage.ts
import {
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand
} from "@aws-sdk/client-s3";
import {
  R2,
  R2_BUCKET_NAME,
  streamToString,
} from "@/lib/r2-client";

// Interfaces remain the same
export interface BlobMessage {
  id: string;
  content?: string;
  voiceUrl?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  senderId: string;
  senderName: string;
  senderProfilePicture?: string;
  receiverId?: string;
  receiverName?: string;
  type: "text" | "voice" | "image" | "video";
  createdAt: string;
}

export interface BlobComment {
  id: string;
  mediaId: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  content: string;
  createdAt: string;
}

export interface BlobLike {
  id: string;
  mediaId: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface BlobUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  profilePicture?: string;
  createdAt: string;
}

async function listAndFetch(prefix: string) {
  const listCommand = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: prefix,
  });
  const { Contents } = await R2.send(listCommand);
  if (!Contents) return [];

  const objects = await Promise.all(
    Contents.map(async (item) => {
      try {
        const getCommand = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: item.Key,
        });
        const response = await R2.send(getCommand);
        const content = await streamToString(response.Body);
        return JSON.parse(content);
      } catch (e) {
        console.error(`Failed to fetch or parse ${item.Key}:`, e);
        return null;
      }
    })
  );
  return objects.filter(Boolean); // Filter out nulls from failed fetches
}

export class BlobStorage {
  // Public Messages
  static async getPublicMessages(): Promise<BlobMessage[]> {
    const messages = await listAndFetch("public-messages/");
    return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static async addPublicMessage(message: Omit<BlobMessage, "id" | "createdAt">): Promise<BlobMessage> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullMessage: BlobMessage = { ...message, id, createdAt: new Date().toISOString() };
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: `public-messages/${id}.json`,
      Body: JSON.stringify(fullMessage),
      ContentType: "application/json",
    });
    await R2.send(command);
    return fullMessage;
  }

  // Private Messages
  static async getAllPrivateMessages(): Promise<BlobMessage[]> {
    return await listAndFetch("private-messages/");
  }

  static async getPrivateMessages(user1Id: string, user2Id: string): Promise<BlobMessage[]> {
    const allMessages = await this.getAllPrivateMessages();
    const conversationMessages = allMessages.filter(
      (message) =>
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
    );
    return conversationMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static async addPrivateMessage(message: Omit<BlobMessage, "id" | "createdAt">): Promise<BlobMessage> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullMessage: BlobMessage = { ...message, id, createdAt: new Date().toISOString() };
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: `private-messages/${id}.json`,
      Body: JSON.stringify(fullMessage),
      ContentType: "application/json",
    });
    await R2.send(command);
    return fullMessage;
  }

  // Comments
  static async getComments(mediaId: string): Promise<BlobComment[]> {
    const sanitizedMediaId = mediaId.replace(/[^a-zA-Z0-9._-]/g, '_');
    const comments = await listAndFetch(`comments/${sanitizedMediaId}/`);
    return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static async addComment(comment: Omit<BlobComment, "id" | "createdAt">): Promise<BlobComment> {
    const id = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullComment: BlobComment = { ...comment, id, createdAt: new Date().toISOString() };
    const sanitizedMediaId = comment.mediaId.replace(/[^a-zA-Z0-9._-]/g, '_');
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: `comments/${sanitizedMediaId}/${id}.json`,
      Body: JSON.stringify(fullComment),
      ContentType: "application/json",
    });
    await R2.send(command);
    return fullComment;
  }

  // Likes
  static async getLikes(mediaId: string): Promise<BlobLike[]> {
    const sanitizedMediaId = mediaId.replace(/[^a-zA-Z0-9._-]/g, '_');
    return await listAndFetch(`likes/${sanitizedMediaId}/`);
  }

  static async addLike(like: Omit<BlobLike, "id" | "createdAt">): Promise<BlobLike> {
    const id = `like_${like.userId}_${Date.now()}`;
    const fullLike: BlobLike = { ...like, id, createdAt: new Date().toISOString() };
    const sanitizedMediaId = like.mediaId.replace(/[^a-zA-Z0-9._-]/g, '_');
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: `likes/${sanitizedMediaId}/${id}.json`,
      Body: JSON.stringify(fullLike),
      ContentType: "application/json",
    });
    await R2.send(command);
    return fullLike;
  }

  static async removeLike(mediaId: string, userId: string): Promise<void> {
    const sanitizedMediaId = mediaId.replace(/[^a-zA-Z0-9._-]/g, '_');
    const likes = await listAndFetch(`likes/${sanitizedMediaId}/`);
    const likeToRemove = likes.find((l) => l.userId === userId);

    if (likeToRemove) {
      const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: `likes/${sanitizedMediaId}/${likeToRemove.id}.json`,
      });
      await R2.send(command);
    }
  }
  
  // Users
  static async getUsers(): Promise<BlobUser[]> {
    return await listAndFetch("users/");
  }

  static async getUserById(id: string): Promise<BlobUser | null> {
    const users = await this.getUsers();
    return users.find((user) => user.id === id) || null;
  }
  
  static async getUserByEmail(email: string): Promise<BlobUser | null> {
    const users = await this.getUsers();
    return users.find((user) => user.email === email) || null;
  }

  static async addUser(user: Omit<BlobUser, "id" | "createdAt" | 'profilePicture'>): Promise<BlobUser> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullUser: BlobUser = { ...user, id, profilePicture: '', createdAt: new Date().toISOString() };
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: `users/${id}.json`,
        Body: JSON.stringify(fullUser),
        ContentType: 'application/json'
    });
    await R2.send(command);
    return fullUser;
  }

  static async updateUser(userId: string, updates: Partial<BlobUser>): Promise<BlobUser | null> {
    const listCommand = new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, Prefix: `users/` });
    const { Contents } = await R2.send(listCommand);
    const userObjectKey = Contents?.find(c => c.Key?.endsWith(`${userId}.json`))?.Key;

    if (!userObjectKey) {
        // Fallback for older user IDs that might not be in the key
        const users = await this.getUsers();
        const userToUpdate = users.find(u => u.id === userId);
        if(!userToUpdate) return null;
        
        // This is tricky, we don't know the original Key. We can try to guess or handle it.
        // For now, let's assume this path won't be hit if user IDs are consistent.
        return null;
    }

    const getCmd = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: userObjectKey });
    const response = await R2.send(getCmd);
    const user = JSON.parse(await streamToString(response.Body));

    const updatedUser = { ...user, ...updates };
    
    const putCmd = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: userObjectKey,
        Body: JSON.stringify(updatedUser),
        ContentType: 'application/json'
    });
    await R2.send(putCmd);
    return updatedUser;
  }
}