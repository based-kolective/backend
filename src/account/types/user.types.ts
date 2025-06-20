export interface UserResponse {
  id: string;
  ownerAddress: string;
  walletAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserWallet {
  address: string;
  privateKey: string;
}
