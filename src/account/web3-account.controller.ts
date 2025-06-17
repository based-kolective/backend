import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { SignMessageService } from './sign-message.service';
import { Web3Guard } from './guards/web3.guard';

/**
 * Web3-only authentication controller
 * No JWT tokens - pure signature-based authentication
 */

interface Web3Request extends Request {
  web3User: { address: string };
}

interface SignedRequest {
  signature: string;
  message: string;
  address: string;
  data?: unknown;
}

@Controller('web3-account')
export class Web3AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly signMessageService: SignMessageService,
  ) {}

  @Get('generate-message')
  generateMessage(@Body('address') address: string): { message: string } {
    if (!address) {
      throw new Error('Address is required');
    }
    const message = this.signMessageService.generateAuthMessage(address);
    return { message };
  }

  @Get('check-registration')
  async checkRegistration(@Query('address') address: string) {
    if (!address) {
      throw new Error('Address is required');
    }

    try {
      const isRegistered = await this.accountService.isUserRegistered(address);
      return {
        address: address.toLowerCase(),
        isRegistered,
      };
    } catch {
      throw new Error('Failed to check registration status');
    }
  }

  @Get('registration-status')
  async getRegistrationStatus(@Query('address') address: string) {
    if (!address) {
      throw new Error('Address is required');
    }

    try {
      const result = await this.accountService.checkUserRegistration(address);
      return {
        address: address.toLowerCase(),
        ...result,
      };
    } catch {
      throw new Error('Failed to get registration status');
    }
  }

  @Post('register')
  async register(@Body() body: SignedRequest) {
    const { address, message, signature } = body;

    // Verify signature
    if (!this.signMessageService.verifySignature(message, signature, address)) {
      throw new Error('Invalid signature');
    }

    // Check if signature is not expired with detailed error
    if (!this.signMessageService.isSignatureNotExpired(message, 10)) {
      // Extract timestamp for better error message
      const timestampMatch = message.match(/Timestamp: ([\d-T:.Z]+)/);
      if (timestampMatch) {
        const messageTime = new Date(timestampMatch[1]).getTime();
        const currentTime = Date.now();
        const ageMinutes = (currentTime - messageTime) / (60 * 1000);
        console.log('Signature age in minutes:', ageMinutes);
        throw new Error(`Signature expired xxx. Message was signed ${ageMinutes.toFixed(2)} minutes ago, but maximum age is 10 minutes.`);
      } else {
        throw new Error('Signature expired - no valid timestamp found in message');
      }
    }

    try {
      // Check if user already exists
      const existingUser = await this.accountService.getUserByAddress(address);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const wallet = this.signMessageService.generateWallet();

      // Create user and wallet
      const user = await this.accountService.createUser(address, wallet);

      return {
        success: true,
        message: 'User registered successfully',
        userAddress: address.toLowerCase(),
        generatedWallet: wallet.address,
        user,
        // Never return private key in response
      };
    } catch (error) {
      throw new Error(
        `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @UseGuards(Web3Guard)
  @Post('protected-action')
  async protectedAction(
    @Request() req: Web3Request,
    @Body() body: SignedRequest,
  ) {
    // The Web3Guard already verified the signature
    // req.web3User.address contains the verified address

    const userAddress = req.web3User.address;

    try {
      const user = await this.accountService.getUserByAddress(userAddress);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'Protected action executed',
        userAddress,
        userData: user,
        requestData: body.data || null,
      };
    } catch (error) {
      throw new Error(
        `Failed to execute protected action: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @UseGuards(Web3Guard)
  @Get('profile')
  async getProfile(@Request() req: Web3Request) {
    try {
      const user = await this.accountService.getUserByAddress(
        req.web3User.address,
      );

      if (!user) {
        throw new Error('User not found');
      }

      return { user };
    } catch (error) {
      throw new Error(
        `Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
