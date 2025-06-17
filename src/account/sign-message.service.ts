import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class SignMessageService {
  /**
   * Verify a signed message against an address
   * @param message - The original message that was signed
   * @param signature - The signature
   * @param address - The address that supposedly signed the message
   * @returns boolean - true if signature is valid
   */
  verifySignature(
    message: string,
    signature: string,
    address: string,
  ): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Generate a wallet with private key and address
   * @returns Object containing address and privateKey
   */
  generateWallet(): { address: string; privateKey: string } {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  /**
   * Get wallet from private key
   * @param privateKey - The private key
   * @returns Wallet instance
   */
  getWalletFromPrivateKey(privateKey: string): ethers.Wallet {
    return new ethers.Wallet(privateKey);
  }

  /**
   * Generate a standard message for signing
   * @param address - The user's address
   * @param timestamp - Optional timestamp, defaults to current time
   * @returns String message to be signed
   */
  generateAuthMessage(address: string, timestamp?: number): string {
    const time = timestamp || Date.now();
    return `Sign this message to authenticate with Kolective Backend.\n\nAddress: ${address}\nTimestamp: ${time}`;
  }

  /**
   * Validate that a signature is not too old
   * @param message - The signed message containing timestamp
   * @param maxAgeMinutes - Maximum age in minutes (default: 10)
   * @returns boolean - true if signature is still valid
   */
  isSignatureNotExpired(message: string, maxAgeMinutes: number = 10): boolean {
    try {
      const timestampMatch = message.match(/Timestamp: (\d+)/);
      if (!timestampMatch) return false;

      const messageTime = parseInt(timestampMatch[1]);
      const currentTime = Date.now();
      const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds

      return currentTime - messageTime <= maxAge;
    } catch (error) {
      console.error('Error validating signature timestamp:', error);
      return false;
    }
  }
}
