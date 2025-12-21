"use client";

import { useSearchParams } from 'next/navigation';

export default function RegisterClient() {
  const searchParams = useSearchParams();

  // Example usage of searchParams
  const referrer = searchParams.get('referrer');

  return (
    <div>
      <h1>Register Page</h1>
      {referrer && <p>Referred by: {referrer}</p>}
      {/* Add your registration form here */}
    </div>
  );
}