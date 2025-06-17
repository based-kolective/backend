import { SignMessageService } from '../sign-message.service';

/**
 * Example usage of SignMessageService
 * This shows how to use the reusable sign message component
 */

// Initialize the service
const signMessageService = new SignMessageService();

// Example 1: Generate a wallet
const wallet = signMessageService.generateWallet();
console.log('Generated wallet:', {
  address: wallet.address,
  // privateKey should be kept secret in real applications
});

// Example 2: Generate an authentication message
const userAddress = '0x742d35Cc6645C2c9c91b4B4A4E4E5A8f3D22bbC3';
const authMessage = signMessageService.generateAuthMessage(userAddress);
console.log('Auth message to sign:', authMessage);

// Example 3: Verify a signature (this would be done after user signs the message)
const exampleSignature = '0x...'; // This would be the actual signature from the user
const isValid = signMessageService.verifySignature(
  authMessage,
  exampleSignature,
  userAddress,
);
console.log('Signature is valid:', isValid);

// Example 4: Check if signature is not expired
const isNotExpired = signMessageService.isSignatureNotExpired(authMessage, 10); // 10 minutes
console.log('Signature is not expired:', isNotExpired);

/**
 * How to use in other services:
 *
 * 1. Import the module in your module:
 *    imports: [AccountModule]
 *
 * 2. Inject the service in your service constructor:
 *    constructor(private signMessageService: SignMessageService) {}
 *
 * 3. Use any of the methods:
 *    - verifySignature(message, signature, address)
 *    - generateWallet()
 *    - getWalletFromPrivateKey(privateKey)
 *    - generateAuthMessage(address, timestamp?)
 *    - isSignatureNotExpired(message, maxAgeMinutes?)
 */
