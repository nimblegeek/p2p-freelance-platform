interface RoaringCompanyInfo {
  organizationNumber: string;
  name: string;
  legalForm: string;
  status: string;
  registrationDate: string;
}

export class RoaringService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = 'https://api.roaring.io/se/company/overview/2.0';
    this.apiKey = process.env.ROARING_API_KEY || '';
  }

  async verifyCompany(organizationNumber: string): Promise<RoaringCompanyInfo> {
    try {
      // Remove any non-digit characters from organization number
      const cleanOrgNumber = organizationNumber.replace(/\D/g, '');
      
      const response = await fetch(
        `${this.baseUrl}/${cleanOrgNumber}`,
        {
          headers: {
            'x-api-key': this.apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Company not found');
        }
        throw new Error('Failed to verify company');
      }

      const data = await response.json();
      
      return {
        organizationNumber: data.organizationNumber,
        name: data.name,
        legalForm: data.legalForm,
        status: data.status,
        registrationDate: data.registrationDate,
      };
    } catch (error) {
      console.error('Roaring API error:', error);
      throw error;
    }
  }
}
