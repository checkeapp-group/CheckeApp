'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import AuthModal from '@/components/Auth/auth-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';
import { useAppRouter } from '@/lib/router';

type TextInputFormProps = {
  isAuthenticated?: boolean;
  onSuccess?: (verificationId: string) => void;
}

type SizeType = 'small' | 'medium' | 'large' | 'xlarge';

type SizeConfig = {
  minRows: number;
  textSize: string;
  padding: string;
}

type ModalState = {
  isClosing: boolean;
  lastCloseTime: number;
}

const TextInputForm = ({ isAuthenticated: propIsAuthenticated, onSuccess }: TextInputFormProps) => {
  // Hooks
  const { t } = useI18n();
  const { isAuthenticated: hookIsAuthenticated, isLoading: authLoading } = useAuth();
  const { navigate } = useAppRouter();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [text, setText] = useState('');
  const [size] = useState<SizeType>('medium');
  const [disabled] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const parent = useRef<HTMLDivElement>(null);
  const modalStateRef = useRef<ModalState>({
    isClosing: false,
    lastCloseTime: 0,
  });

  // Constants
  const isAuthenticated = propIsAuthenticated ?? hookIsAuthenticated;
  const maxLength = 5000;
  const minLength = 50;

  // Size config for responsive design
  const sizeConfig: Record<SizeType, SizeConfig> = {
    small: {
      minRows: 2,
      textSize: 'text-sm sm:text-base md:text-lg',
      padding: 'p-4 sm:p-4 md:p-6',
    },
    medium: {
      minRows: 3,
      textSize: 'text-base sm:text-lg md:text-xl',
      padding: 'p-6 md:p-8',
    },
    large: {
      minRows: 4,
      textSize: 'text-lg sm:text-xl md:text-2xl',
      padding: 'p-4 sm:p-8 md:p-10',
    },
    xlarge: {
      minRows: 5,
      textSize: 'text-xl sm:text-2xl md:text-3xl',
      padding: 'p-8 sm:p-10 md:p-12',
    },
  };

  // Handle unauthenticated interactions
  const handleUnauthenticatedAction = useCallback(
    (event?: React.SyntheticEvent) => {
      // Prevent if we're in auth loading state
      if (authLoading) {
        return;
      }

      // Prevent if already authenticated
      if (isAuthenticated) {
        return;
      }

      // Prevent immediate reopening after closing
      const now = Date.now();
      const timeSinceLastClose = now - modalStateRef.current.lastCloseTime;

      if (modalStateRef.current.isClosing || timeSinceLastClose < 300) {
        event?.preventDefault();
        return;
      }

      // Prevent if modal is already open
      if (showAuthModal) {
        return;
      }

      setShowAuthModal(true);
      textareaRef.current?.blur();
    },
    [authLoading, isAuthenticated, showAuthModal]
  );

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      handleUnauthenticatedAction(e);
      return;
    }
    setText(e.target.value);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      handleUnauthenticatedAction(e);
      return;
    }

    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle click events
  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (authLoading || isAuthenticated) {
      return;
    }

    handleUnauthenticatedAction(e);
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (authLoading || isAuthenticated) {
      return;
    }

    if (e.target === e.currentTarget) {
      handleUnauthenticatedAction(e);
    }
  };

  // Handle focus events
  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (authLoading || isAuthenticated) {
      return;
    }

    handleUnauthenticatedAction(e);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validations
    if (
      authLoading ||
      !isAuthenticated ||
      text.trim().length < minLength ||
      disabled ||
      isLoading
    ) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to start verification
      const response = await fetch('/api/verify/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        const successMessage = 'Verificación iniciada. Ahora revisa las preguntas.';
        toast.success(successMessage);

        // Use onSuccess callback if provided, otherwise navigate
        if (onSuccess) {
          onSuccess(result.verification_id);
        } else {
          navigate(`/verify/${result.verification_id}/edit`);
        }
        setText('');
      } else {
        const errorMessage = result.message || 'Falló el inicio de la verificación.';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error starting verification:', error);
      toast.error('Error de red. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close with proper state management
  const handleCloseAuthModal = useCallback(() => {
    modalStateRef.current.isClosing = true;
    modalStateRef.current.lastCloseTime = Date.now();

    setShowAuthModal(false);

    // Reset closing state after animation completes
    setTimeout(() => {
      modalStateRef.current.isClosing = false;
    }, 350);
  }, []);

  // Close modal when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      handleCloseAuthModal();
    }
  }, [isAuthenticated, showAuthModal, handleCloseAuthModal]);

  const currentSizeConfig = sizeConfig[size];

  return (
    <>
      <div className="min-h-[auto] bg-background p-4">
        <div className="mx-auto max-w-4xl">
          {/* Main form container */}
          <Card className="rounded-2xl p-4 sm:p-6" onClick={handleContainerClick} ref={parent}>
            <div className="w-full">
              {/* TextareaAutosize */}
              <TextareaAutosize
                aria-label="Área de texto principal"
                className={`w-full resize-none rounded-lg border-2 border-input ${currentSizeConfig.textSize} 
                ${currentSizeConfig.padding} bg-transparent shadow-sm transition-all duration-300 placeholder:text-muted-foreground placeholder:opacity-75 hover:border-info focus:border-ring focus:shadow-md focus:outline-none focus:ring-4 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isAuthenticated ? '' : 'cursor-pointer'
                }`}
                disabled={disabled}
                maxLength={maxLength}
                minLength={minLength}
                minRows={currentSizeConfig.minRows}
                onChange={handleTextChange}
                onClick={handleTextareaClick}
                onFocus={handleTextareaFocus}
                onKeyDown={handleKeyDown}
                placeholder={
                  authLoading
                    ? 'Loading...'
                    : isAuthenticated
                      ? t('textInput.placeholder')
                      : t('textInput.loginPlaceholder') || 'Click to login and start writing...'
                }
                readOnly={authLoading || !isAuthenticated}
                ref={textareaRef}
                value={text}
              />

              {/* Character counter and progress*/}
              <div
                className="mt-4 flex flex-col items-start justify-between gap-2 sm:mt-6 sm:flex-row sm:items-center md:mt-8"
                onClick={handleContainerClick}
              >
                <div className="flex items-center gap-4 text-muted-foreground text-sm sm:gap-6 md:gap-8">
                  <span className="font-medium">
                    {text.length}
                    <span className="text-muted-foreground/60">/{maxLength}</span>
                  </span>
                  <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground text-xs sm:px-4 sm:py-2 md:px-6 md:py-2">
                    Ctrl+Enter
                  </span>
                </div>

                {/* Submit button*/}
                <Button
                  className="before:-translate-x-full relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-transform before:duration-500 enabled:hover:scale-103 enabled:hover:shadow-md enabled:hover:before:translate-x-full sm:px-6 sm:py-4 md:px-8 md:py-4"
                  disabled={
                    authLoading ||
                    !isAuthenticated ||
                    text.trim() === '' ||
                    text.trim().length < minLength ||
                    disabled
                  }
                  onClick={handleSubmit}
                  size="lg"
                  type="button"
                  variant="default"
                >
                  {authLoading
                    ? 'Loading...'
                    : isAuthenticated
                      ? isLoading
                        ? t('textInput.submitting') || 'Enviando...'
                        : t('textInput.submit') || 'Verificar Texto'
                      : t('textInput.loginToSubmit') || 'Inicia Sesión para Enviar'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        message={
          t('textInput.authModalMessage') ||
          'Para usar nuestro servicio de verificación de texto, necesitas iniciar sesión. Esto nos ayuda a proporcionar resultados personalizados y seguros.'
        }
        onClose={handleCloseAuthModal}
        showRegisterOption={true}
      />
    </>
  );
};

export default TextInputForm;
