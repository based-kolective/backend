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
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly signMessageService: SignMessageService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.accountService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.accountService.register(registerDto);
  }
  @Get('generate-message')
  generateMessage(@Query('address') address: string): { message: string } {
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
    const isRegistered = await this.accountService.isUserRegistered(address);
    return {
      address: address.toLowerCase(),
      isRegistered,
    };
  }

  @Get('registration-status')
  async getRegistrationStatus(@Query('address') address: string) {
    if (!address) {
      throw new Error('Address is required');
    }
    const result = await this.accountService.checkUserRegistration(address);
    return {
      address: address.toLowerCase(),
      ...result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.accountService.getUserById(req.user.sub);
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req) {
    return {
      userId: req.user.sub,
      address: req.user.address,
    };
  }
}
