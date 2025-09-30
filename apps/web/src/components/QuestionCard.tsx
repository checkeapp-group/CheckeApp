'use client';

import { AlertCircle, Edit, GripVertical, Save, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/hooks/use-i18n';
import { cn } from '@/lib/utils';
import type { Question } from '@/types/questions';

type QuestionCardProps = {
  question: Question;
  isEditing: boolean;
  isSaving: boolean;
  isLocked: boolean;
  onEdit: (questionId: string) => void;
  onSave: (questionId: string, text: string) => void;
  onCancel: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  dragAttributes?: any;
  dragListeners?: any;
};

export function QuestionCard({
  question,
  isEditing,
  isSaving,
  isLocked,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  dragAttributes,
  dragListeners,
}: QuestionCardProps) {
  const { t } = useI18n();
  const [localText, setLocalText] = useState(question.questionText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalText(question.questionText);
  }, [question.questionText]);

  useEffect(() => {
    if (isEditing && !isLocked && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing, isLocked]);

  const handleSave = () => {
    if (isTextValid && hasChanges && !isLocked) {
      onSave(question.id, localText);
    }
  };

  const handleCancel = () => {
    setLocalText(question.questionText);
    onCancel(question.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isLocked) {
      return;
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const isTextValid = localText.trim().length >= 5 && localText.length <= 200;
  const charCount = localText.length;
  const hasChanges = localText.trim() !== question.questionText.trim();
  return (
    <Card
      className={cn(
        'p-4 transition-all duration-300',
        isEditing && !isLocked && 'border-primary/50 ring-2 ring-primary/20',
        !isTextValid && isEditing && !isLocked && 'border-destructive/50 ring-destructive/20'
      )}
    >
      <div className="flex w-full items-center gap-3">
        <div
          className={cn(
            'flex flex-shrink-0 items-center text-muted-foreground transition-colors',
            !isLocked && 'cursor-grab hover:text-foreground'
          )}
          {...dragAttributes}
          {...dragListeners}
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          {isEditing && !isLocked ? (
            <div className="space-y-3">
              <Textarea
                className="min-h-[80px] text-base"
                onChange={(e) => setLocalText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('questions_edit.question_placeholder')}
                ref={textareaRef}
                value={localText}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-destructive text-xs">
                  {!isTextValid && localText.length > 0 && (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        {localText.length < 5
                          ? t('questions_edit.too_short')
                          : t('questions_edit.too_long')}
                      </span>
                    </>
                  )}
                </div>
                <span
                  className={cn(
                    'font-mono text-xs',
                    charCount > 200 ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  {charCount}/200
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!(isTextValid && hasChanges)}
                  loading={isSaving}
                  onClick={handleSave}
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" /> {t('common.save')} (Ctrl+Enter)
                </Button>
                <Button onClick={handleCancel} size="sm" variant="ghost">
                  {t('common.cancel')} (Esc)
                </Button>
              </div>
            </div>
          ) : (
            <div className="group flex w-full items-center justify-between gap-4">
              <p className="flex-1 font-medium text-base text-foreground">
                {question.questionText}
              </p>
              {!isLocked && (
                <div className="flex items-center gap-1">
                  <Button
                    aria-label={t('question.edit.ariaLabel')}
                    onClick={() => onEdit(question.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label={t('question.delete.ariaLabel')}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(question.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
