import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { SignMessageService } from './sign-message.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { UserResponse, CreateUserWallet } from './types/user.types';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private signMessageService: SignMessageService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { address, message, signature } = loginDto;

    // Verify the signature
    if (!this.signMessageService.verifySignature(message, signature, address)) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Check if signature is not expired (10 minutes max)
    if (!this.signMessageService.isSignatureNotExpired(message, 10)) {
      throw new UnauthorizedException('Signature expired');
    }

    // Find user by owner address
    const user = await this.prisma.user.findUnique({
      where: { ownerAddress: address.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('User not found. Please register first.');
    }

    // Generate JWT token
    const payload = { sub: user.id, address: user.ownerAddress };
    const token = this.jwtService.sign(payload);

    // Return user info without private key
    return {
      success: true,
      token,
      user: {
        id: user.id,
        ownerAddress: user.ownerAddress,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { address, message, signature } = registerDto;

    // Verify the signature
    if (!this.signMessageService.verifySignature(message, signature, address)) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Check if signature is not expired (10 minutes max)
    if (!this.signMessageService.isSignatureNotExpired(message, 10)) {
      throw new UnauthorizedException('Signature expired');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { ownerAddress: address.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User already exists. Please login instead.');
    }

    // Generate new wallet for the user
    const wallet = this.signMessageService.generateWallet();

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        ownerAddress: address.toLowerCase(),
        walletAddress: wallet.address,
        walletPrivateKey: wallet.privateKey,
      },
    });

    // Generate JWT token
    const payload = { sub: user.id, address: user.ownerAddress };
    const token = this.jwtService.sign(payload);

    // Return user info without private key
    return {
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        ownerAddress: user.ownerAddress,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        ownerAddress: true,
        walletAddress: true,
        createdAt: true,
        updatedAt: true,
        // Explicitly exclude walletPrivateKey
      },
    });

    return user;
  }

  async getUserByAddress(address: string): Promise<UserResponse | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { ownerAddress: address.toLowerCase() },
        select: {
          id: true,
          ownerAddress: true,
          walletAddress: true,
          createdAt: true,
          updatedAt: true,
          // Explicitly exclude walletPrivateKey
        },
      });

      return user;
    } catch (error) {
      console.error('Error fetching user by address:', error);
      return null;
    }
  }

  /**
   * Check if a user is registered by their owner address
   * @param ownerAddress - The owner address to check
   * @returns boolean - true if user exists, false otherwise
   */
  async isUserRegistered(ownerAddress: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { ownerAddress: ownerAddress.toLowerCase() },
        select: { id: true }, // Only select id for efficiency
      });

      return user !== null;
    } catch (error) {
      console.error('Error checking user registration:', error);
      return false;
    }
  }

  /**
   * Alternative method that returns both registration status and user data
   * @param ownerAddress - The owner address to check
   * @returns object with isRegistered boolean and user data (if exists)
   */
  async checkUserRegistration(ownerAddress: string): Promise<{
    isRegistered: boolean;
    user?: {
      id: string;
      ownerAddress: string;
      walletAddress: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  }> {
    try {
      const user = await this.getUserByAddress(ownerAddress);

      return {
        isRegistered: user !== null,
        user: user,
      };
    } catch (error) {
      console.error('Error checking user registration:', error);
      return {
        isRegistered: false,
        user: null,
      };
    }
  }

  /**
   * Create a new user with the provided address and wallet
   * @param ownerAddress - The owner address
   * @param wallet - The generated wallet object with address and privateKey
   * @returns the created user (without private key)
   */
  async createUser(
    ownerAddress: string,
    wallet: CreateUserWallet,
  ): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.create({
        data: {
          ownerAddress: ownerAddress.toLowerCase(),
          walletAddress: wallet.address,
          walletPrivateKey: wallet.privateKey,
        },
        select: {
          id: true,
          ownerAddress: true,
          walletAddress: true,
          createdAt: true,
          updatedAt: true,
          // Explicitly exclude walletPrivateKey
        },
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new ConflictException('Failed to create user');
    }
  }
}
