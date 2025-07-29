import crypto from "crypto"

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export function createToken(user: any): string {
  const payload = {
    userId: user.id,
    username: user.username,
    display_name: user.display_name,
    email: user.email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  return btoa(JSON.stringify(payload))
}

export function verifyToken(token: string): any {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}
