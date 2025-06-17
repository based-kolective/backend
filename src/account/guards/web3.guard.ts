import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SignMessageService } from '../sign-message.service';

/**
 * Web3 Guard that verifies signatures on each request
 * No JWT tokens needed - pure Web3 authentication
 */
@Injectable()
export class Web3Guard implements CanActivate {
  constructor(private signMessageService: SignMessageService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { signature, message, address } = request.body || request.query;

    if (!signature || !message || !address) {
      throw new UnauthorizedException(
        'Signature, message, and address are required',
      );
    }

    // Verify signature
    if (!this.signMessageService.verifySignature(message, signature, address)) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Check if signature is not expired (5 minutes for better UX)
    if (!this.signMessageService.isSignatureNotExpired(message, 5)) {
      throw new UnauthorizedException('Signature expired');
    }

    // Add verified address to request for use in controllers
    request.web3User = { address: address.toLowerCase() };

    return true;
  }
}
