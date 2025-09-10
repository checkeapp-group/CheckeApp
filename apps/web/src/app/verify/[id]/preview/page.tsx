'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import QuestionsPreview from '@/components/QuestionsPreview';
import { useAuth } from '@/hooks/use-auth';
import { useAppRouter } from '@/lib/router';
import { orpc } from '@/utils/orpc';

export default function QuestionsPreviewPage() {
  const { navigate } = useAppRouter();
  const { isAuthenticated } = useAuth();
  const { id: verificationId } = useParams();
  const [questions, setQuestions] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    orpc.getGeneratedQuestions.queryOptions({
      input: { verificationId: verificationId as string },
      enabled: !!verificationId && isAuthenticated,
    })
  );

  useEffect(() => {
    if (data) {
      setQuestions(data.questions || []);
    }
  }, [data]);

  // ✅ Mutation con TanStack Query
  const confirmQuestionsMutation = useMutation(
    orpc.confirmQuestions.mutationOptions({
      onSuccess: () => {
        toast.success('Questions confirmed!');
        queryClient.invalidateQueries({
          queryKey: orpc.getGeneratedQuestions.key({
            verificationId: verificationId as string,
          }),
        });
        navigate(`/verify/${verificationId}/edit`);
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to confirm questions');
      },
    })
  );

  const handleConfirmQuestions = () => {
    confirmQuestionsMutation.mutate({
      verificationId: verificationId as string,
      questions: questions.map((q, index) => ({
        question_text: q.question_text,
        original_question: q.original_question || q.question_text,
        order_index: index,
      })),
    });
  };

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  if (error) {
    return <div>Error: {(error as any).message}</div>;
  }

  return (
    <div>
      <QuestionsPreview
        onAddQuestion={() => {
          setQuestions([
            ...questions,
            {
              question_text: '',
              original_question: '',
              order_index: questions.length,
            },
          ]);
        }}
        onEditQuestion={(index: number, newText: string) => {
          const updatedQuestions = [...questions];
          updatedQuestions[index].question_text = newText;
          setQuestions(updatedQuestions);
        }}
        onRemoveQuestion={(index: number) => {
          const updatedQuestions = questions.filter((_, i) => i !== index);
          setQuestions(updatedQuestions);
        }}
        questions={questions}
      />
    </div>
  );
}
