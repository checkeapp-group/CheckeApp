'use client';

import { Card } from '@/components/ui/card';

type SubmittedTextDisplayProps = {
  text: string;
};

const SubmittedTextDisplay = ({ text }: SubmittedTextDisplayProps) => {
  return (
    <Card className="bg-muted/30 p-4 sm:p-6">
      <p className="whitespace-pre-wrap text-lg text-muted-foreground">{text}</p>
    </Card>
  );
};

export default SubmittedTextDisplay;
