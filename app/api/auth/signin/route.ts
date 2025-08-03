import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsers } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const users = await getUsers();
    const user = users.find(u => u.email === email.trim());

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const { passwordHash, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });

  } catch (error) {
    console.error("[SIGNIN ERROR]", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}