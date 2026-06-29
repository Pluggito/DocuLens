import { NextRequest, NextResponse } from "next/server";
import { getDb, users, eq } from "@repo/db";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { createId } from "@repo/db";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, phoneNumber } = await req.json();

    // Validation
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if user exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        id: createId(),
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
      })
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      });

    console.log("✅ User registered:", newUser.id);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
