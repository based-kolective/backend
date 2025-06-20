import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccountController } from './account.controller';
import { Web3AccountController } from './web3-account.controller';
import { AccountService } from './account.service';
import { SignMessageService } from './sign-message.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Web3Guard } from './guards/web3.guard';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AccountController, Web3AccountController],
  providers: [
    AccountService,
    SignMessageService,
    JwtStrategy,
    Web3Guard,
    PrismaService,
  ],
  exports: [SignMessageService, AccountService],
})
export class AccountModule {}
