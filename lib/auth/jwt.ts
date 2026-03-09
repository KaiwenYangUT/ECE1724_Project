import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@prisma/client";

type TokenRole = `${UserRole}`;

export interface AuthTokenPayload {
  sub: string;
  role: TokenRole;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

function getEncodedSecret(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}

export async function generateToken(
  userId: string,
  role: TokenRole,
): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedSecret());
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedSecret(), {
      algorithms: ["HS256"],
    });

    const subject = payload.sub;
    const role = payload.role;

    if (!subject || typeof role !== "string") {
      return null;
    }

    return {
      sub: subject,
      role: role as TokenRole,
    };
  } catch {
    return null;
  }
}
