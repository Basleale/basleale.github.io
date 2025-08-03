import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "@/lib/db";
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ error: "Invalid input provided." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email.trim());
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists." }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = randomUUID();
    const newUser = await createUser(userId, name.trim(), email.trim(), passwordHash);

    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error("[SIGNUP ERROR]", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}