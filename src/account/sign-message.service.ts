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
  generateAuthMessage(address: string, timestamp?: string): string {
    const time = timestamp || new Date().toISOString();
    return `Welcome to Kolective!

By signing this message, you agree to register your wallet with Kolective.

Wallet: ${address}
Timestamp: ${time}

This signature will expire in 10 minutes.`;
  }

  /**
   * Validate that a signature is not too old
   * @param message - The signed message containing timestamp
   * @param maxAgeMinutes - Maximum age in minutes (default: 10)
   * @returns boolean - true if signature is still valid
   */
  isSignatureNotExpired(message: string, maxAgeMinutes: number = 10): boolean {
    try {
      // Try to match timestamp in ISO format (e.g., Timestamp: 2025-06-17T15:39:07.157Z)
      const timestampMatch = message.match(
        /Timestamp: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/,
      );
      if (!timestampMatch) {
        console.log('No timestamp found in message:', message);
        return false;
      }

      console.log('Found ISO timestamp:', timestampMatch[1]);
      const messageTime = new Date(timestampMatch[1]).getTime();
      if (isNaN(messageTime)) {
        console.log('Invalid timestamp format:', timestampMatch[1]);
        return false;
      }

      const currentTime = Date.now();
      const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
      const ageMs = currentTime - messageTime;
      const ageMinutes = ageMs / (60 * 1000);

      console.log('Timestamp validation:', {
        messageTime,
        currentTime,
        ageMs,
        ageMinutes,
        maxAgeMinutes,
        isValid: ageMs <= maxAge,
      });

      return ageMs <= maxAge;
    } catch (error) {
      console.error('Error validating signature timestamp:', error);
      return false;
    }
  }
}
