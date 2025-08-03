// app/api/auth/signup/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { AuthStorage } from "@/lib/auth-storage";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    console.log(`[Sign Up] Attempting to sign up user with email: ${email}`);

    const existingUser = await AuthStorage.getUserByEmail(email.trim());
    if (existingUser) {
      console.log(`[Sign Up] User already exists: ${email}`);
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    console.log("[Sign Up] Creating user...");
    const user = await AuthStorage.createUser(name.trim(), email.trim(), password);

    console.log(`[Sign Up] User created successfully with ID: ${user.id}`);
    
    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("[Sign Up] Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}