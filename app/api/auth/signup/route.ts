import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsers, saveUsers } from "@/lib/storage";
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ error: "Invalid input provided." }, { status: 400 });
    }

    const users = await getUsers();
    const existingUser = users.find(u => u.email === email.trim());

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = {
      id: randomUUID(),
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
      profilePicture: ""
    };

    users.push(newUser);
    await saveUsers(users);
    
    const { passwordHash: _, ...safeUser } = newUser;
    return NextResponse.json({ user: safeUser });

  } catch (error) {
    console.error("[SIGNUP ERROR]", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}