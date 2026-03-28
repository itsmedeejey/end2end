
export interface JwtPayload {
  sub: string;          // userId
  uid: string;          // uniqueUserId
  name: string;         // displayName
  type?: 'access' | 'refresh';
}
