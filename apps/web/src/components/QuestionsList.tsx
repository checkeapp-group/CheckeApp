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
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/hooks/use-i18n';
import { type Question, useQuestionsEditor } from '@/hooks/use-questions-editor';

type ExtendedQuestion = Question & { isActive?: boolean };

type QuestionsListProps = {
  verificationId: string;
  reviewMode?: boolean;
  questions?: ExtendedQuestion[];
  onQuestionsUpdate?: (questions: ExtendedQuestion[]) => void;
};

function SortableQuestionCard({
  question,
  ...props
}: { question: ExtendedQuestion } & Omit<
  React.ComponentProps<typeof QuestionCard>,
  'dragAttributes' | 'dragListeners' | 'question'
>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      : 'none',
  };

  return (
    <div className="w-full transition-all duration-200" ref={setNodeRef} style={style}>
      <div className="group flex w-full items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-2 flex cursor-grab items-center justify-center rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <div className="w-full flex-1 overflow-hidden">
          <QuestionCard
            dragAttributes={attributes}
            dragListeners={listeners}
            question={question}
            {...props}
          />
        </div>
      </div>
    </div>
  );
}

export default function QuestionsList({
  verificationId,
  reviewMode = false,
  questions: propQuestions,
  onQuestionsUpdate,
}: QuestionsListProps) {
  const { t } = useI18n();
  // Use hook data or prop data based on review mode
  const hookData = useQuestionsEditor({ verificationId, reviewMode });
  const questions = reviewMode ? propQuestions || [] : hookData.questions;
  const error = reviewMode ? null : hookData.error;

  const updateQuestion = reviewMode ? handleReviewModeUpdate : hookData.updateQuestion;
  const deleteQuestion = reviewMode ? handleReviewModeDelete : hookData.deleteQuestion;
  const addQuestion = reviewMode ? handleReviewModeAdd : hookData.addQuestion;
  const reorderQuestions = reviewMode ? handleReviewModeReorder : hookData.reorderQuestions;
  const canContinue = reviewMode ? questions.length > 0 : hookData.canContinue;
  const savingStates = reviewMode ? {} : hookData.savingStates;
  const pendingChanges = reviewMode ? false : hookData.pendingChanges;
  const refetch = reviewMode ? () => {} : hookData.refetch;

  // Review mode handlers
  function handleReviewModeUpdate(questionId: string, text: string) {
    if (!onQuestionsUpdate) {
      return;
    }
    const updated = questions.map((q) =>
      q.id === questionId ? { ...q, questionText: text, isEdited: true } : q
    );
    onQuestionsUpdate(updated);
  }

  function handleReviewModeDelete(questionId: string) {
    if (!onQuestionsUpdate) {
      return;
    }
    const updated = questions.filter((q) => q.id !== questionId);
    onQuestionsUpdate(updated);
  }

  function handleReviewModeAdd(questionText: string) {
    if (!onQuestionsUpdate) {
      return;
    }
    const newQuestion: ExtendedQuestion = {
      id: `temp-${Date.now()}`,
      verificationId: 'temp-id',
      questionText: questionText.trim(),
      originalQuestion: questionText.trim(),
      isEdited: false,
      isActive: true,
      orderIndex: questions.length,
      createdAt: new Date(),
    };
    onQuestionsUpdate([...questions, newQuestion]);
  }

  function handleReviewModeReorder(newOrder: ExtendedQuestion[]) {
    if (!onQuestionsUpdate) {
      return;
    }
    const reordered = newOrder.map((q, index) => ({ ...q, orderIndex: index }));
    onQuestionsUpdate(reordered);
  }

  // New handler for toggling active state
  function handleToggleActive(questionId: string, isActive: boolean) {
    if (reviewMode) {
      if (!onQuestionsUpdate) {
        return;
      }
      const updated = questions.map((q) =>
        q.id === questionId ? { ...q, isActive, isEdited: true } : q
      );
      onQuestionsUpdate(updated);
    } else {
      // For now, we'll handle it similarly to review mode
      // This would need to be implemented in the actual hook
      console.log('Toggle active state for question:', questionId, 'to:', isActive);
    }
  }

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over?.id);
      const newOrder = arrayMove(questions, oldIndex, newIndex);
      reorderQuestions(newOrder);
    }
  };

  const handleEdit = (questionId: string) => {
    setEditingId(questionId);
  };

  const handleSave = (questionId: string, text: string) => {
    updateQuestion(questionId, text);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleAddQuestion = () => {
    if (newQuestionText.trim().length >= 5) {
      addQuestion(newQuestionText);
      setNewQuestionText('');
      setShowAddForm(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddQuestion();
    }
    if (e.key === 'Escape') {
      setShowAddForm(false);
      setNewQuestionText('');
    }
  };

  // Calculate active questions count
  const activeQuestionsCount = questions.filter((q) => q.isActive !== false).length;
  const totalQuestionsCount = questions.length;

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <p className="mb-4 font-medium text-destructive">{error}</p>
            <Button className="flex items-center gap-2" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              {t('common.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Status Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-muted-foreground text-sm">
            {t('questions_edit.questions_count', { count: totalQuestionsCount })}
          </p>
          <p className="text-muted-foreground text-xs">
            {activeQuestionsCount} active, {totalQuestionsCount - activeQuestionsCount} inactive
          </p>
          {pendingChanges && (
            <p className="mt-1 flex items-center gap-1 text-orange-600 text-xs">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-orange-600" />
              {t('questions_edit.auto_saving')}
            </p>
          )}
        </div>
        <Button
          className="flex w-full items-center gap-2 sm:w-auto"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4" />
          {t('questions_edit.add_question')}
        </Button>
      </div>

      {/* Questions List */}
      {questions.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {questions.map((question) => (
                <SortableQuestionCard
                  isEditing={editingId === question.id}
                  isSaving={savingStates[question.id]}
                  key={question.id}
                  onCancel={handleCancel}
                  onDelete={deleteQuestion}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onTextChange={updateQuestion}
                  onToggleActive={handleToggleActive}
                  question={question}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card className="border-2 border-muted-foreground/20 border-dashed bg-muted/10">
          <CardContent className="pt-8">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-muted-foreground/10 p-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-1 font-medium text-lg">{t('questions_edit.no_questions_title')}</h3>
              <p className="mb-4 max-w-md text-muted-foreground">
                {t('questions_edit.no_questions_description')}
              </p>
              <Button className="flex items-center gap-2" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4" />
                {t('questions_edit.add_first_question')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Question Form */}
      {showAddForm && (
        <Card className="border-primary/20 bg-primary/5 shadow-sm transition-all duration-200">
          <CardHeader className="pb-3">
            <h3 className="font-medium text-lg">{t('questions_edit.add_new_question')}</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              autoFocus
              className="transition-all duration-200"
              onChange={(e) => setNewQuestionText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('questions_edit.new_question_placeholder')}
              value={newQuestionText}
            />
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${newQuestionText.length > 200 ? 'text-destructive' : 'text-muted-foreground'}`}
                >
                  {newQuestionText.length}/200
                </span>
                {newQuestionText.length > 200 && (
                  <span className="text-destructive text-xs">
                    {t('questions_edit.character_limit_exceeded')}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={newQuestionText.trim().length < 5 || newQuestionText.length > 200}
                  onClick={handleAddQuestion}
                  size="sm"
                >
                  {t('questions_edit.add')}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewQuestionText('');
                  }}
                  size="sm"
                  variant="outline"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button - only show in edit mode, not review mode */}
      {!reviewMode && (
        <div className="flex justify-end pt-4">
          <Button className="flex items-center gap-2" disabled={!canContinue}>
            {t('questions_edit.continue')}
          </Button>
        </div>
      )}
    </div>
  );
}
