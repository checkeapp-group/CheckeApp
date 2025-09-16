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
import { AlertCircle, GripVertical, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/hooks/use-i18n';
import { type Question, useQuestionsEditor } from '@/hooks/use-questions-editor';

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
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div className="flex items-start gap-2" ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        className="mt-4 cursor-grab touch-none p-2 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-grow">
        <QuestionCard question={question} {...props} />
      </div>
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
          <Card className="p-4" key={i}>
            <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <p className="mb-4 font-medium text-destructive">{error.message}</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-muted-foreground text-sm">
            {t('questions_edit.questions_count', { count: questions.length })}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('questions_edit.add_question')}
        </Button>
      </div>

      {questions.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {questions.map((question) => (
                <SortableQuestionItem
                  isEditing={editingId === question.id}
                  isSaving={false}
                  key={question.id}
                  onCancel={() => setEditingId(null)}
                  onDelete={deleteQuestion}
                  onEdit={() => setEditingId(question.id)}
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
      ) : (
        <Card className="border-2 border-muted-foreground/20 border-dashed bg-muted/10">
          <CardContent className="pt-8 text-center">
            <h3 className="mb-1 font-medium text-lg">{t('questions_edit.no_questions_title')}</h3>
            <p className="mx-auto mb-4 max-w-md text-muted-foreground">
              {t('questions_edit.no_questions_description')}
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('questions_edit.add_first_question')}
            </Button>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <h3 className="font-medium text-lg">{t('questions_edit.add_new_question')}</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              autoFocus
              onChange={(e) => setNewQuestionText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
              placeholder={t('questions_edit.new_question_placeholder')}
              value={newQuestionText}
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowAddForm(false)} variant="outline">
                {t('common.cancel')}
              </Button>
              <Button disabled={newQuestionText.trim().length < 5} onClick={handleAddQuestion}>
                {t('questions_edit.add')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {onComplete && (
        <div className="flex justify-end border-t pt-6">
          <Button disabled={!canContinue || isContinuing} onClick={onComplete} size="lg">
            {isContinuing ? 'Buscando fuentes...' : 'Confirmar Preguntas y Continuar'}
          </Button>
        </div>
      )}
    </div>
  );
}
