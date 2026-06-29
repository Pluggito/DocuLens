import { NextRequest, NextResponse } from "next/server";
import { getDb, users, eq } from "@repo/db";
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Find user
    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        image: users.image,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = await generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Create response with cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      { status: 200 }
    );

    setAuthCookies(response, accessToken, refreshToken);

    console.log("✅ User logged in:", user.email);

    return response;
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
