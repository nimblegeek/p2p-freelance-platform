'use client';

import { useState } from 'react';

type UserType = 'CLIENT' | 'FREELANCER';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<UserType>('FREELANCER');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, userType }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      setStatus('success');
      setMessage('Thanks for joining! We\'ll notify you when we launch.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setUserType('FREELANCER')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
              userType === 'FREELANCER'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            I'm a freelancer
          </button>
          <button
            type="button"
            onClick={() => setUserType('CLIENT')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
              userType === 'CLIENT'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            I'm a client
          </button>
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
        </button>
      </form>
      {message && (
        <div
          className={`mt-4 p-4 rounded-md ${
            status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
