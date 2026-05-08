
export type JwtPayload = {
  sub: string;          // userId
  uid: string;          // uniqueUserId
  name: string;         // displayName
  type?: 'access' | 'refresh';
}
export type refreshTokenPayload = JwtPayload & {
  sessionId: string;
}
