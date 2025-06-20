# Web3 Authentication API

This module provides Web3 authentication endpoints for your NestJS backend.

## Endpoints

### 1. Generate Authentication Message
**GET** `/account/generate-message?address={userAddress}`

Generates a message that the user needs to sign with their wallet.

**Query Parameters:**
- `address` (string): The user's wallet address

**Response:**
```json
{
  "message": "Sign this message to authenticate with Kolective Backend.\n\nAddress: 0x742d35Cc6645C2c9c91b4B4A4E4E5A8f3D22bbC3\nTimestamp: 1718644800000"
}
```

### 2. Register User
**POST** `/account/register`

Creates a new user account and generates a wallet for them.

**Request Body:**
```json
{
  "address": "0x742d35Cc6645C2c9c91b4B4A4E4E5A8f3D22bbC3",
  "message": "Sign this message to authenticate with Kolective Backend.\n\nAddress: 0x742d35Cc6645C2c9c91b4B4A4E4E5A8f3D22bbC3\nTimestamp: 1718644800000",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx...",
    "ownerAddress": "0x742d35cc6645c2c9c91b4b4a4e4e5a8f3d22bbc3",
    "walletAddress": "0x...",
    "createdAt": "2025-06-17T...",
    "updatedAt": "2025-06-17T..."
  }
}
```

### 3. Login User
**POST** `/account/login`

Authenticates an existing user.

**Request Body:**
```json
{
  "address": "0x742d35Cc6645C2c9c91b4B4A4E4E5A8f3D22bbC3",
  "message": "Sign this message to authenticate with Kolective Backend.\n\nAddress: 0x742d35Cc6645C2c9c91b4B4A4E4E5A8f3D22bbC3\nTimestamp: 1718644800000",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx...",
    "ownerAddress": "0x742d35cc6645c2c9c91b4b4a4e4e5a8f3d22bbc3",
    "walletAddress": "0x...",
    "createdAt": "2025-06-17T...",
    "updatedAt": "2025-06-17T..."
  }
}
```

### 4. Get User Profile (Protected)
**GET** `/account/profile`

Gets the current user's profile information.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "ownerAddress": "0x742d35cc6645c2c9c91b4b4a4e4e5a8f3d22bbc3",
    "walletAddress": "0x...",
    "createdAt": "2025-06-17T...",
    "updatedAt": "2025-06-17T..."
  }
}
```

### 5. Get Current User Info (Protected)
**GET** `/account/me`

Gets basic information about the current authenticated user.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "userId": "clx...",
  "address": "0x742d35cc6645c2c9c91b4b4a4e4e5a8f3d22bbc3"
}
```

## Authentication Flow

1. **Frontend requests authentication message:**
   ```javascript
   const response = await fetch('/account/generate-message?address=' + userAddress);
   const { message } = await response.json();
   ```

2. **User signs the message with their wallet:**
   ```javascript
   const signature = await window.ethereum.request({
     method: 'personal_sign',
     params: [message, userAddress],
   });
   ```

3. **Frontend sends signed message for registration or login:**
   ```javascript
   const authResponse = await fetch('/account/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       address: userAddress,
       message: message,
       signature: signature
     })
   });
   ```

4. **Store the JWT token for authenticated requests:**
   ```javascript
   const { token } = await authResponse.json();
   localStorage.setItem('authToken', token);
   ```

5. **Use token for protected endpoints:**
   ```javascript
   const profileResponse = await fetch('/account/profile', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   ```

## SignMessageService

The `SignMessageService` is a reusable component that can be used anywhere in your application:

### Available Methods:

- `verifySignature(message, signature, address)` - Verify a signed message
- `generateWallet()` - Generate a new wallet with address and private key
- `getWalletFromPrivateKey(privateKey)` - Get wallet instance from private key
- `generateAuthMessage(address, timestamp?)` - Generate standard auth message
- `isSignatureNotExpired(message, maxAgeMinutes?)` - Check if signature is still valid

### Usage in Other Services:

```typescript
import { SignMessageService } from './account/sign-message.service';

@Injectable()
export class YourService {
  constructor(private signMessageService: SignMessageService) {}

  someMethod() {
    const isValid = this.signMessageService.verifySignature(message, signature, address);
    // ... your logic
  }
}
```

Don't forget to import `AccountModule` in your module to use `SignMessageService`.

## Environment Variables

Make sure to set these environment variables:

```env
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=your-postgresql-connection-string
```

## Security Notes

- Signatures expire after 10 minutes by default
- Private keys are stored securely in the database (consider encryption for production)
- JWT tokens expire after 24 hours
- All addresses are stored in lowercase for consistency
