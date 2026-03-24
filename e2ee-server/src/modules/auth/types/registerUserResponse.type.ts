export interface RegisterUserResponse {
  id: string;
  uniqueUserId: string;
  displayName: string;
  createdAt: Date;
  recoveryKey: string;//one time
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

