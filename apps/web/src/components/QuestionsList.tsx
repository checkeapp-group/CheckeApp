'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/hooks/use-i18n';
import { type Question, useQuestionsEditor } from '@/hooks/use-questions-editor';
import { QuestionCard } from './QuestionCard';

type QuestionsListProps = {
  verificationId: string;
  onComplete?: () => void;
  isContinuing?: boolean;
};

function SortableQuestionItem({
  question,
  ...props
}: { question: Question } & Omit<React.ComponentProps<typeof QuestionCard>, 'question'>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <QuestionCard question={question} {...props} />
    </div>
  );
}

export default function QuestionsList({
  verificationId,
  onComplete,
  isContinuing = false,
}: QuestionsListProps) {
  const { t } = useI18n();
  const {
    questions,
    error,
    isLoading,
    updateQuestion,
    deleteQuestion,
    addQuestion,
    reorderQuestions,
    canContinue,
    refetch,
  } = useQuestionsEditor({ verificationId });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      reorderQuestions(arrayMove(questions, oldIndex, newIndex));
    }
  };

  const handleAddQuestion = () => {
    if (newQuestionText.trim().length >= 5) {
      addQuestion(newQuestionText);
      setNewQuestionText('');
      setShowAddForm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton className="h-24 w-full" key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <p className="mb-4 font-semibold text-destructive">{error.message}</p>
        <Button onClick={() => refetch()} outline variant="destructive">
          <RefreshCw className="mr-2 h-4 w-4" /> {t('common.retry')}
        </Button>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {questions.map((question) => (
              <SortableQuestionItem
                isEditing={editingId === question.id}
                isSaving={false}
                key={question.id}
                onCancel={() => setEditingId(null)}
                onDelete={deleteQuestion}
                onEdit={setEditingId}
                onSave={(id, text) => {
                  updateQuestion(id, text);
                  setEditingId(null);
                }}
                onTextChange={() => {}}
                question={question}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Formulario para añadir nueva pregunta */}
      {showAddForm ? (
        <Card className="border-primary/50 bg-primary/5 p-4">
          <div className="space-y-3">
            <Input
              autoFocus
              onChange={(e) => setNewQuestionText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
              placeholder={t('questions_edit.new_question_placeholder')}
              value={newQuestionText}
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowAddForm(false)} variant="ghost">
                {t('common.cancel')}
              </Button>
              <Button disabled={newQuestionText.trim().length < 5} onClick={handleAddQuestion}>
                {t('questions_edit.add')}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          className="w-full border-dashed"
          onClick={() => setShowAddForm(true)}
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" /> {t('questions_edit.add_question')}
        </Button>
      )}

      {onComplete && (
        <div className="flex justify-end border-border border-t pt-6">
          <Button
            disabled={!canContinue || isContinuing}
            loading={isContinuing}
            onClick={onComplete}
            size="lg"
          >
            Confirmar Preguntas y Continuar
          </Button>
        </div>
      )}
    </div>
  );
}
