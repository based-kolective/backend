export class LoginDto {
  address: string;
  message: string;
  signature: string;
}

export class RegisterDto {
  address: string;
  message: string;
  signature: string;
}

export class AuthResponseDto {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    ownerAddress: string;
    walletAddress?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}
