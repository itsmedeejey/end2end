export interface loginUserResponse {
  id: string;
  uniqueUserId: string;
  displayName: string;
  createdAt: Date;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
