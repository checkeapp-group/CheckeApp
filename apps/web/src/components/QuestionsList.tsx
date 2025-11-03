"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useI18n } from "@/hooks/use-i18n";
import { useQuestionsEditor } from "@/hooks/use-questions-editor";
import type { Question } from "@/types/questions";
import { orpc } from "@/utils/orpc";
import { QuestionCard } from "./QuestionCard";

function QuestionsListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...new Array(3)].map((_, i) => (
        <Card className="liquid-glass liquid-glass--md p-4" key={i}>
          <div className="flex w-full items-center gap-3">
            <Skeleton className="h-6 w-5 flex-shrink-0 rounded-md bg-white/20" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded-md bg-white/20" />
              <Skeleton className="h-4 w-1/2 rounded-md bg-white/20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md bg-white/20" />
              <Skeleton className="h-8 w-8 rounded-md bg-white/20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

type QuestionsListProps = {
  verificationId: string;
  onComplete?: () => void;
  isContinuing?: boolean;
  completedSteps?: string[];
};

function SortableQuestionItem({
  question,
  ...props
}: { question: Question } & Omit<
  React.ComponentProps<typeof QuestionCard>,
  "question"
>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id,
    disabled: props.isLocked,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionCard
        question={question}
        {...props}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

export default function QuestionsList({
  verificationId,
  onComplete,
  isContinuing = false,
  completedSteps = [],
}: QuestionsListProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const {
    questions,
    error,
    isLoading,
    isPollingForQuestions,
    isMutating,
    updateQuestion,
    deleteQuestion,
    addQuestion,
    reorderQuestions,
    canContinue,
    refetch,
    hasTimedOut,
  } = useQuestionsEditor({ verificationId });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [refinementText, setRefinementText] = useState("");

  useGlobalLoader(isContinuing, `questions-continuing-${verificationId}`);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const refineMutation = useMutation({
    mutationFn: (refinement: string) =>
      orpc.refineQuestions.call({ verificationId, refinement }),
    onSuccess: () => {
      toast.success(t("questions_edit.refined_success"));
      queryClient.invalidateQueries({
        queryKey: orpc.getVerificationQuestions.key({
          input: { verificationId },
        }),
      });
      setRefinementText("");
    },
    onError: (error) => {
      toast.error(t("questions_edit.refined_error", { error: error.message }));
    },
  });

  const isLocked =
    isLoading ||
    isMutating ||
    isContinuing ||
    completedSteps.includes("step-2");

  useGlobalLoader(refineMutation.isPending, "questions-refine");

  const handleDragEnd = (event: DragEndEvent) => {
    if (isLocked) {
      return;
    }
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
      setNewQuestionText("");
      setShowAddForm(false);
    }
  };

  const handleConfirm = () => {
    if (onComplete) {
      onComplete();
    }
  };

  // Show loading when polling for questions
  if (isPollingForQuestions) {
    return (
      <Card className="border-primary/30 bg-primary/5 p-12 text-center">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="mb-2 font-semibold text-lg text-primary">
          {t("questions.generating")}
        </p>
        <p className="text-muted-foreground text-sm">
          {t("questions.generating_description")}
        </p>
      </Card>
    );
  }

  if (hasTimedOut && questions.length === 0) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <p className="mb-4 font-semibold text-destructive">
          {t("questions.timeout_error")}
        </p>
        <Button onClick={() => refetch()} variant="destructive">
          <RefreshCw className="mr-2 h-4 w-4" /> {t("common.retry")}
        </Button>
      </Card>
    );
  }

  if (isLoading && questions.length === 0 && !isPollingForQuestions) {
    return <QuestionsListSkeleton />;
  }

  // Mostrar error
  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <p className="mb-4 font-semibold text-destructive">{error.message}</p>
        <Button onClick={() => refetch()} variant="destructive">
          <RefreshCw className="mr-2 h-4 w-4" /> {t("common.retry")}
        </Button>
      </Card>
    );
  }

  return (
    <div
      className={`w-full space-y-6 ${
        isLocked ? "pointer-events-none opacity-70" : ""
      }`}
    >
      {completedSteps.includes("step-2") && (
        <Card className="border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900">
                {t("questions.confirmed")}
              </p>
              <p className="text-green-700 text-sm">
                {t("questions.confirmed_description")}
              </p>
            </div>
            <Lock className="h-4 w-4 text-green-600" />
          </div>
        </Card>
      )}

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {questions.map((question) => (
              <SortableQuestionItem
                isEditing={editingId === question.id}
                isLocked={isLocked}
                isSaving={isMutating}
                key={question.id}
                onCancel={() => setEditingId(null)}
                onDelete={() => deleteQuestion(question.id)}
                onEdit={setEditingId}
                onSave={(id, text) => {
                  updateQuestion(id, text);
                  setEditingId(null);
                }}
                question={question}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!completedSteps.includes("step-2") &&
        (showAddForm ? (
          <Card className="border-primary/50 p-4">
            <div className="space-y-3">
              <Input
                autoFocus
                disabled={isLocked}
                onChange={(e) => setNewQuestionText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
                placeholder={t("questions_edit.new_question_placeholder")}
                value={newQuestionText}
              />
              <div className="flex justify-end gap-2">
                <Button
                  disabled={isLocked}
                  onClick={() => setShowAddForm(false)}
                  variant="cancel"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  disabled={isLocked || newQuestionText.trim().length < 5}
                  onClick={handleAddQuestion}
                >
                  {t("questions_edit.add")}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            className="w-full border-2 border-foreground border-dashed"
            disabled={isLocked}
            onClick={() => setShowAddForm(true)}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" /> {t("questions_edit.add_question")}
          </Button>
        ))}

      {onComplete && !completedSteps.includes("step-2") && (
        <div className="flex justify-end pt-6">
          <Button
            disabled={!canContinue || isLocked}
            loading={isContinuing}
            onClick={handleConfirm}
            size="lg"
          >
            {isContinuing
              ? t("common.loading")
              : t("questions.confirm_and_continue")}
          </Button>
        </div>
      )}
    </div>
  );
}
