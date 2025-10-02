'use client';

import { useState } from 'react';
import TextInputForm from '@/components/TextInputForm';
import { useAppRouter } from '@/lib/router';

function PreviousVerifications() {
  return (
    <div className="mt-12">
      <h2 className="mb-4 text-center font-bold text-2xl text-gray-700">Previously Fact-Checked</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-48 rounded-lg border bg-gray-100 p-4">
          <p className="text-gray-500">Previous verification card placeholder...</p>
        </div>
        <div className="h-48 rounded-lg border bg-gray-100 p-4">
          <p className="text-gray-500">Previous verification card placeholder...</p>
        </div>
        <div className="h-48 rounded-lg border bg-gray-100 p-4">
          <p className="text-gray-500">Previous verification card placeholder...</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ openAuthModal }: { openAuthModal?: () => void }) {
  const [text, setText] = useState('');
  const { navigate } = useAppRouter(); 

  const handleSuccess = (verificationId: string) => {
    navigate(`/verify/${verificationId}/edit`);
  };


  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 animate-gradient bg-clip-text font-extrabold text-transparent text-xl">
          Fact-Check Your Information
        </h1>
      </div>
      <div className="w-full space-y-4">
        <TextInputForm
          onAuthAction={openAuthModal}
          onSuccess={handleSuccess}
          onTextChange={setText}
          text={text}
        />
      </div>
      <PreviousVerifications />
    </div>
  );
}
