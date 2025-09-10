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
};

const TextInputForm = ({ isAuthenticated: propIsAuthenticated }: TextInputFormProps) => {
  // States
  const { t } = useI18n();
  const { isAuthenticated: hookIsAuthenticated, isLoading: authLoading } = useAuth();
  const { navigate } = useAppRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const modalStateRef = useRef({
    isClosing: false,
    lastCloseTime: 0,
  });

  const isAuthenticated = propIsAuthenticated ?? hookIsAuthenticated;

  // Variables
  const [text, setText] = useState('');
  const [size] = useState('medium');
  const [disabled] = useState(false);
  const parent = useRef(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 5000;
  const minLength = 50;

  // Size config for responsive design
  const sizeConfig = {
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

  // Handle any interaction when not authenticated
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

  const handleSubmit = async () => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }

    if (text.trim() === '' || text.trim().length < minLength || disabled || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // Use proper documented flow via /api/verify/start
      const response = await fetch('/api/verify/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          t('textInput.verification_started') ||
            'Verification started successfully! Questions are being generated.'
        );

        // Navigate directly to edit page with the verification ID
        navigate(`/verify/${result.verification_id}/edit`);
        setText('');
      } else {
        // Show error message
        toast.error(
          result.message || t('textInput.verification_failed') || 'Failed to start verification'
        );
      }
    } catch (error) {
      console.error('Error starting verification:', error);
      toast.error(
        t('textInput.network_error') || 'Network error. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      handleCloseAuthModal();
    }
  }, [isAuthenticated, showAuthModal]);

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
                        ? t('textInput.submitting') || 'Submitting...'
                        : t('textInput.submit')
                      : t('textInput.loginToSubmit') || 'Login to Submit'}
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
          'To use our text verification service, you need to be logged in. This helps us provide personalized and secure results.'
        }
        onClose={handleCloseAuthModal}
        showRegisterOption={true}
      />
    </>
  );
};

export default TextInputForm;
