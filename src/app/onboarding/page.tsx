'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    organizationNumber: '',
    companyName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // First, validate with Bolagsverket API (mock for now)
      const validationResponse = await fetch('/api/verify-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationNumber: formData.organizationNumber,
        }),
      });

      if (!validationResponse.ok) {
        throw new Error('Invalid organization number');
      }

      // If validation successful, create business verification record
      const response = await fetch('/api/business-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit verification');
      }

      // Redirect to dashboard or profile completion
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Business Verification
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                <p>
                  To ensure the quality of our platform, we need to verify your business
                  registration with Bolagsverket. This helps maintain trust and
                  professionalism in our community.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="mt-5 space-y-6">
                <div>
                  <label
                    htmlFor="organizationNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Organization Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="organizationNumber"
                      id="organizationNumber"
                      value={formData.organizationNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, organizationNumber: e.target.value })
                      }
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="XXXXXX-XXXX"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Enter your 10-digit Swedish organization number
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Company Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="companyName"
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Error
                        </h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Business'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
