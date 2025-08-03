// app/api/auth/signin/route.ts
import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AuthStorage } from "@/lib/auth-storage";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    console.log(`[Sign In] Attempting to sign in user: ${email}`);
    
    const user = await AuthStorage.getUserByEmail(email.trim());
    if (!user) {
      console.log(`[Sign In] User not found: ${email}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log(`[Sign In] User found with ID: ${user.id}. Comparing passwords.`);
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      console.log(`[Sign In] Invalid password for user: ${user.id}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log(`[Sign In] Password is valid. Sign-in successful for user: ${user.id}`);
    
    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("[Sign In] Error signing in:", error);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}