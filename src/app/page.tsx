'use client';

import Link from "next/link";
import WaitlistForm from "@/components/WaitlistForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Connect Directly with Top Talent
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            A peer-to-peer freelancing platform that eliminates intermediaries,
            reduces fees, and puts you in control.
          </p>
          
          {/* Waitlist Section */}
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-6">
              Join the Waitlist
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Be the first to know when we launch and get early access to our platform.
            </p>
            <WaitlistForm />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg md:px-10"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:text-lg md:px-10"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Direct Connections</h3>
            <p className="text-gray-600 dark:text-gray-300">Connect and communicate directly with clients or freelancers without platform interference.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Lower Fees</h3>
            <p className="text-gray-600 dark:text-gray-300">Enjoy significantly lower fees compared to traditional platforms, keeping more money in your pocket.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Secure Payments</h3>
            <p className="text-gray-600 dark:text-gray-300">Built-in escrow system ensures safe and timely payments for completed work.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
