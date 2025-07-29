export function hashPassword(password: string): string {
  // Simple hash function for demo - in production use bcrypt
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

export function createToken(user: any): string {
  const payload = {
    userId: user.id,
    username: user.username,
    display_name: user.display_name,
    email: user.email,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
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
