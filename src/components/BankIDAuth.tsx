'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

interface BankIDAuthProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

export default function BankIDAuth({ onSuccess, onError }: BankIDAuthProps) {
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [personalNumber, setPersonalNumber] = useState<string>('');

  const initializeAuth = async () => {
    try {
      setStatus('initializing');
      const response = await fetch('/api/auth/bankid/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalNumber: personalNumber || undefined }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setOrderRef(data.orderRef);
        setQrCode(data.qrStartToken);
        setStatus('pending');
        pollStatus(data.orderRef);
      } else {
        onError(data.error || 'Failed to initialize BankID');
        setStatus('error');
      }
    } catch (error) {
      onError('Failed to initialize BankID');
      setStatus('error');
    }
  };

  const pollStatus = async (ref: string) => {
    try {
      const response = await fetch('/api/auth/bankid/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderRef: ref }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status === 'pending') {
          // Continue polling after a short delay
          setTimeout(() => pollStatus(ref), 2000);
        } else if (data.status === 'complete') {
          setStatus('complete');
          onSuccess(data.user);
        } else {
          setStatus('error');
          onError('Authentication failed');
        }
      } else {
        setStatus('error');
        onError(data.error || 'Failed to check authentication status');
      }
    } catch (error) {
      setStatus('error');
      onError('Failed to check authentication status');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">BankID Authentication</h2>
      
      {status === 'idle' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Personal Number (optional)
            </label>
            <input
              type="text"
              value={personalNumber}
              onChange={(e) => setPersonalNumber(e.target.value)}
              placeholder="YYYYMMDDXXXX"
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
            />
          </div>
          <button
            onClick={initializeAuth}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Start BankID Authentication
          </button>
        </div>
      )}

      {status === 'initializing' && (
        <div className="text-center">
          <p>Initializing BankID...</p>
        </div>
      )}

      {status === 'pending' && qrCode && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-48 h-48">
            <QRCode value={qrCode} size={192} />
          </div>
          <p className="text-sm text-gray-600">
            Scan the QR code with your BankID app or open your BankID app if you're on mobile
          </p>
          <p className="text-sm text-gray-600">
            Waiting for authentication...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center space-y-4">
          <p className="text-red-600">Authentication failed</p>
          <button
            onClick={() => {
              setStatus('idle');
              setOrderRef(null);
              setQrCode(null);
            }}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
