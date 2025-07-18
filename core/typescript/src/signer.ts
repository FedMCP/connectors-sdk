import { createHash } from 'crypto';
import { subtle } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Artifact } from './types';
import { FedMCPArtifact } from './artifact';

export interface JWSHeader {
  alg: string;
  typ: string;
  kid: string;
}

export interface JWSPayload {
  iss: string;  // workspace ID
  sub: string;  // artifact ID
  iat: number;  // issued at
  exp: number;  // expiration
  artifact: any; // canonicalized artifact
}

export interface JWSEnvelope {
  protected: string;
  payload: string;
  signature: string;
}

export abstract class Signer {
  abstract sign(artifact: Artifact): Promise<string>;
  abstract getKeyId(): string;
  abstract getPublicKeyJWK(): Promise<any>;
}

export class LocalSigner extends Signer {
  private privateKey: CryptoKey | null = null;
  private publicKey: CryptoKey | null = null;
  private keyId: string;

  constructor(privateKey?: CryptoKey) {
    super();
    if (privateKey) {
      this.privateKey = privateKey;
    }
    this.keyId = '';
  }

  async initialize(): Promise<void> {
    if (!this.privateKey) {
      // Generate a new P-256 key pair
      const keyPair = await subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        true,
        ['sign', 'verify']
      );
      
      this.privateKey = keyPair.privateKey;
      this.publicKey = keyPair.publicKey;
    } else {
      // Extract public key from private key (if needed)
      // Note: Web Crypto API doesn't directly support this, would need to export/import
    }

    // Generate key ID from public key
    if (this.publicKey) {
      const publicKeyData = await subtle.exportKey('spki', this.publicKey);
      const hash = await subtle.digest('SHA-256', publicKeyData);
      this.keyId = Array.from(new Uint8Array(hash))
        .slice(0, 8)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
  }

  async sign(artifact: Artifact): Promise<string> {
    if (!this.privateKey) {
      await this.initialize();
    }

    // Validate artifact
    const fedArtifact = new FedMCPArtifact(artifact);
    fedArtifact.validate();

    // Create JWS header
    const header: JWSHeader = {
      alg: 'ES256',
      typ: 'JWT',
      kid: this.keyId
    };

    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload: JWSPayload = {
      iss: artifact.workspaceId,
      sub: artifact.id,
      iat: now,
      exp: now + (90 * 24 * 60 * 60), // 90 days
      artifact: artifact
    };

    // Encode header and payload
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(payload));

    // Create signing input
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    // Sign with ECDSA
    const signature = await subtle.sign(
      {
        name: 'ECDSA',
        hash: 'SHA-256'
      },
      this.privateKey!,
      new TextEncoder().encode(signingInput)
    );

    // Convert signature to base64url
    const encodedSignature = base64url(new Uint8Array(signature));

    // Return complete JWS
    return `${signingInput}.${encodedSignature}`;
  }

  getKeyId(): string {
    return this.keyId;
  }

  async getPublicKeyJWK(): Promise<any> {
    if (!this.publicKey) {
      await this.initialize();
    }

    const jwk = await subtle.exportKey('jwk', this.publicKey!);
    return {
      ...jwk,
      use: 'sig',
      kid: this.keyId
    };
  }
}

// Helper function to encode to base64url
function base64url(input: string | Uint8Array): string {
  let base64: string;
  
  if (typeof input === 'string') {
    base64 = btoa(input);
  } else {
    // Convert Uint8Array to string
    const binary = String.fromCharCode(...input);
    base64 = btoa(binary);
  }
  
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Helper function to decode from base64url
export function base64urlDecode(input: string): Uint8Array {
  // Add padding if necessary
  const padded = input + '=='.slice(0, (4 - input.length % 4) % 4);
  
  // Convert base64url to base64
  const base64 = padded
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  // Decode
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return bytes;
}