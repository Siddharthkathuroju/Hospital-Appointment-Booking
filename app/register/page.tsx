import { Suspense } from 'react';
import RegisterClient from './RegisterClient.tsx';
export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClient />
    </Suspense>
  }
