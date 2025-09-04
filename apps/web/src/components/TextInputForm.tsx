import type React from 'react';
import { useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useI18n } from '@/hooks/use-i18n';

const TextInputForm = () => {
  // States
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  // Variables

  const [text, setText] = useState('');
  const [size] = useState('medium');
  const [disabled] = useState(false);
  const parent = useRef(null);

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

  // Handle text change - similar to CheckerSearch
  const handleTextChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setText(e.target.value);
  };

  // Handle key events - from CheckerSearch pattern
  const handleKeyDown = (e: { key: string; ctrlKey: any; preventDefault: () => void }) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (text.trim() === '' || text.trim().length < minLength || disabled || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here we should make our actual API call
      console.log('Enviando:', text);

      // Reset form after successful submission
      setText('');
    } catch (error) {
      console.error('Error al enviar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentSizeConfig = sizeConfig[size];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        {/* Main form container with shadow and rounded corners like CheckerSearch */}
        <div className="rounded-2xl bg-card p-4 shadow-sm sm:p-6" ref={parent}>
          <div className="w-full">
            {/* TextareaAutosize with CheckerSearch styling approach */}
            <TextareaAutosize
              aria-label="Área de texto principal"
              className={`w-full resize-none rounded-lg border-2 border-input ${currentSizeConfig.textSize} 
              ${currentSizeConfig.padding} bg-transparent shadow-sm transition-all duration-300 placeholder:text-muted-foreground placeholder:opacity-75 hover:border-info focus:border-ring focus:shadow-md focus:outline-none focus:ring-4 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60`}
              disabled={disabled}
              maxLength={maxLength}
              minLength={minLength}
              minRows={currentSizeConfig.minRows}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={t('textInput.placeholder')}
              value={text}
            />
          </div>

          {/* Character counter and progress*/}
          <div className="mt-4 flex flex-col items-start justify-between gap-2 sm:mt-6 sm:flex-row sm:items-center md:mt-8">
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
            <button
              className="before:-translate-x-full relative overflow-hidden rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-all duration-200 ease-in-out before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-transform before:duration-500 focus:outline-none focus:ring-4 focus:ring-ring/20 enabled:hover:scale-103 enabled:hover:bg-success enabled:hover:shadow-md enabled:hover:before:translate-x-full disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-4 sm:text-base md:px-8 md:py-4"
              disabled={text.trim() === '' || text.trim().length < minLength || disabled}
              onClick={handleSubmit}
              type="button"
            >
              {t('textInput.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextInputForm;
