'use client';

import type React from 'react';
import { useCallback, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import AuthModal from '@/components/Auth/auth-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';
import { useAppRouter } from '@/lib/router';

type TextInputFormProps = {
  isAuthenticated?: boolean;
  onSuccess?: (verificationId: string) => void;
  text: string;
  onTextChange: (newText: string) => void;
  isLocked?: boolean;
};

const TextInputForm = ({
  isAuthenticated: propIsAuthenticated,
  onSuccess,
  text,
  onTextChange,
  isLocked = false,
}: TextInputFormProps) => {
  const { t } = useI18n();
  const { isAuthenticated: hookIsAuthenticated, isLoading: authLoading } = useAuth();
  const { navigate } = useAppRouter();
  const [isFocused, setIsFocused] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isAuthenticated = propIsAuthenticated ?? hookIsAuthenticated;
  const maxLength = 5000;
  const minLength = 50;

  const handleUnauthenticatedAction = useCallback(() => {
    if (authLoading || isAuthenticated) {
      return;
    }

    setShowAuthModal(true);
  }, [authLoading, isAuthenticated]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }
    onTextChange(e.target.value);
  };

  const handleInteraction = () => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
    }
  };

  const handleSubmit = async () => {
    if (isLoading || !isAuthenticated || text.trim().length < minLength) {
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/verify/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success('Verificación iniciada. Ahora revisa las preguntas.');

        if (onSuccess) {
          onSuccess(result.verification_id);
        } else {
          navigate(`/verify/${result.verification_id}/edit`);
        }
      } else {
        toast.error(result.message || 'Falló el inicio de la verificación.');
      }
    } catch (error) {
      toast.error('Error de red. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card
        className={`p-4 sm:p-6 ${isFocused ? 'border-primary/50 bg-card/95 shadow-md' : ''}`}
        onClick={handleInteraction}
      >
        <TextareaAutosize
          className="w-full resize-none border-0 bg-transparent text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-muted/50"
          disabled={isLoading || !isAuthenticated || isLocked}
          maxLength={maxLength}
          minRows={3}
          onBlur={() => setIsFocused(false)}
          onChange={handleTextChange}
          onFocus={() => {
            setIsFocused(true);
            handleInteraction();
          }}
          placeholder={
            authLoading
              ? t('common.loading')
              : isAuthenticated
                ? t('textInput.placeholder')
                : t('textInput.loginPlaceholder')
          }
          readOnly={!isAuthenticated}
          value={text}
        />
        <div className="mt-4 flex flex-col items-end gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm">
            {text.length} / {maxLength}
          </div>
          <Button
            disabled={
              authLoading ||
              (isAuthenticated && (text.trim().length < minLength || isLoading)) ||
              isLocked
            }
            loading={isLoading}
            onClick={isAuthenticated ? handleSubmit : handleInteraction}
            size="lg"
          >
            {authLoading
              ? t('common.loading')
              : isAuthenticated
                ? t('textInput.submit')
                : t('textInput.loginToSubmit')}
          </Button>
        </div>
      </Card>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default TextInputForm;
