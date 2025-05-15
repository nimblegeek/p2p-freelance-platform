import axios from 'axios';

interface BankIDAuthResponse {
  orderRef: string;
  autoStartToken: string;
  qrStartToken: string;
  qrStartSecret: string;
}

interface BankIDCollectResponse {
  orderRef: string;
  status: 'pending' | 'complete' | 'failed';
  hintCode?: string;
  completionData?: {
    user: {
      personalNumber: string;
      name: string;
      givenName: string;
      surname: string;
    };
    device: {
      ipAddress: string;
    };
    cert: {
      notBefore: string;
      notAfter: string;
    };
    signature: string;
    ocspResponse: string;
  };
}

export class BankIDService {
  private baseUrl: string;
  private apiUrl: string;
  private pfx: string;
  private passphrase: string;
  private ca: string;

  constructor() {
    // Initialize with environment variables
    this.baseUrl = process.env.BANKID_API_URL || '';
    this.apiUrl = `${this.baseUrl}/rp/v6.0`;
    this.pfx = process.env.BANKID_PFX || '';
    this.passphrase = process.env.BANKID_PASSPHRASE || '';
    this.ca = process.env.BANKID_CA || '';
  }

  private getAxiosConfig() {
    return {
      pfx: Buffer.from(this.pfx, 'base64'),
      passphrase: this.passphrase,
      ca: this.ca,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  async initializeAuth(personalNumber?: string): Promise<BankIDAuthResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/auth`,
        {
          endUserIp: '127.0.0.1', // In production, use the actual client IP
          personalNumber, // Optional: If provided, prefill the BankID app
        },
        this.getAxiosConfig()
      );

      return response.data;
    } catch (error) {
      console.error('BankID initialization error:', error);
      throw new Error('Failed to initialize BankID authentication');
    }
  }

  async collectAuth(orderRef: string): Promise<BankIDCollectResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/collect`,
        { orderRef },
        this.getAxiosConfig()
      );

      return response.data;
    } catch (error) {
      console.error('BankID collect error:', error);
      throw new Error('Failed to collect BankID authentication status');
    }
  }

  async cancel(orderRef: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/cancel`,
        { orderRef },
        this.getAxiosConfig()
      );
    } catch (error) {
      console.error('BankID cancel error:', error);
      throw new Error('Failed to cancel BankID authentication');
    }
  }
}
