'use client';

import { AlertCircle, Check, Clock, Edit, GripVertical, Save, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/hooks/use-i18n';
import type { Question } from '@/hooks/use-questions-editor';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';

type QuestionCardProps = {
  question: Question & { isActive?: boolean };
  isEditing: boolean;
  isSaving: boolean;
  onEdit: (questionId: string) => void;
  onSave: (questionId: string, text: string) => void;
  onCancel: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  onTextChange: (questionId: string, text: string) => void;
  onToggleActive?: (questionId: string, isActive: boolean) => void;
  dragAttributes?: any;
  dragListeners?: any;
};

export function QuestionCard({
  question,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onTextChange,
  onToggleActive,
  dragAttributes,
  dragListeners,
}: QuestionCardProps) {
  const { t } = useI18n();
  const [localText, setLocalText] = useState(question.questionText);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isActive, setIsActive] = useState(question.isActive ?? true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalText(question.questionText);
  }, [question.questionText]);

  useEffect(() => {
    setIsActive(question.isActive ?? true);
  }, [question.isActive]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleTextChange = (text: string) => {
    setLocalText(text);
    onTextChange(question.id, text);
  };

  const handleSave = () => {
    if (localText.trim().length < 5) {
      return;
    }
    onSave(question.id, localText);
  };

  const handleCancel = () => {
    setLocalText(question.questionText);
    onCancel(question.id);
  };

  const handleToggleActive = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    onToggleActive?.(question.id, newActiveState);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    if (localText !== question.questionText && isTextValid) {
      handleSave();
    }
  };

  const isTextValid = localText.trim().length >= 5 && localText.length <= 200;
  const charCount = localText.length;
  const hasChanges = localText !== question.questionText;

  return (
    <Card
      className={cn(
        'group relative w-full cursor-default border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg focus:outline-none',
        isEditing && 'border-primary/30 bg-card shadow-lg ring-2 ring-primary/20',
        !isTextValid && isEditing && 'border-destructive/50 ring-destructive/20',
        !isActive && 'border-muted bg-muted/30 opacity-75'
      )}
    >
      <div className="flex w-full items-start gap-3">
        <div className="mt-1 flex-shrink-0">
          <label className="flex cursor-pointer items-center">
            <input
              checked={isActive}
              className="sr-only"
              onChange={handleToggleActive}
              type="checkbox"
            />
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200',
                isActive
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-400 bg-transparent hover:border-green-400'
              )}
            >
              {isActive && <Check className="h-3 w-3" />}
            </div>
          </label>
        </div>

        {/* Drag Handle */}
        <div
          className="mt-1 flex-shrink-0 cursor-grab opacity-60 transition-opacity hover:opacity-100 active:cursor-grabbing"
          {...dragAttributes}
          {...dragListeners}
        >
          <GripVertical className="h-4 w-4 text-white/70" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                className={cn(
                  'resize-none border-white/20 bg-white/10 text-white placeholder:text-white/50',
                  'focus:border-white/50 focus:ring-white/30',
                  !isTextValid && 'border-red-500/50 focus:ring-red-500/30'
                )}
                onBlur={handleBlur}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('questions_edit.question_placeholder')}
                ref={textareaRef}
                rows={3}
                value={localText}
              />

              {/* Character Count & Validation */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {!isTextValid && (
                    <div className="flex items-center gap-1 text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      <span className="text-xs">
                        {localText.length > 200
                          ? t('questions_edit.too_long')
                          : t('questions_edit.too_short')}
                      </span>
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs',
                    charCount > 200
                      ? 'text-red-400'
                      : charCount > 180
                        ? 'text-orange-400'
                        : 'text-white/60'
                  )}
                >
                  {charCount}/200
                </span>
              </div>

              {/* Edit Actions */}
              <div className="flex items-center gap-2">
                <Button
                  className="flex h-auto items-center gap-1 border-white/20 bg-white/10 px-3 py-1.5 text-white text-xs hover:bg-white/20"
                  disabled={!(isTextValid && hasChanges) || isSaving}
                  onClick={handleSave}
                  size="sm"
                  variant="outline"
                >
                  <Save className="h-3 w-3" />
                  {t('common.save')}
                </Button>
                <Button
                  className="flex h-auto items-center gap-1 border-white/20 bg-transparent px-3 py-1.5 text-white/70 text-xs hover:bg-white/10 hover:text-white"
                  disabled={isSaving}
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-3 w-3" />
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4">
              <div className="flex w-full items-center justify-between">
                <div className="min-w-0 flex-1 text-sm/6">
                  <p
                    className={cn(
                      'whitespace-normal break-words font-medium text-black leading-relaxed transition-all duration-300',
                      !isActive && 'text-gray-500 line-through opacity-70'
                    )}
                  >
                    {question.questionText}
                  </p>

                  {/* Status & Metadata */}
                  <div className="mt-2 flex items-center gap-2">
                    {question.isEdited && (
                      <span className="rounded bg-white/10 px-2 py-0.5 text-black/70 text-xs">
                        {t('questions_edit.edited')}
                      </span>
                    )}

                    {!isActive && (
                      <span className="rounded bg-red-100/20 px-2 py-0.5 text-red-600 text-xs">
                        Inactive
                      </span>
                    )}

                    {isSaving && (
                      <div className="flex items-center gap-1 text-black/60 text-xs">
                        <Clock className="h-3 w-3 animate-spin" />
                        {t('questions_edit.saving')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Icons */}
                <div className="ml-4 flex items-center gap-1">
                  <button
                    className="rounded p-1.5 text-black/70 transition-all hover:bg-black/10 hover:text-black"
                    onClick={() => onEdit(question.id)}
                    type="button"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-1">
                      <button
                        className="rounded p-1.5 text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
                        onClick={() => onDelete(question.id)}
                        type="button"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded p-1.5 text-black/70 transition-all hover:bg-black/10 hover:text-black"
                        onClick={() => setShowDeleteConfirm(false)}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="rounded p-1.5 text-black/70 transition-all hover:bg-red-500/20 hover:text-red-400"
                      onClick={() => setShowDeleteConfirm(true)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
