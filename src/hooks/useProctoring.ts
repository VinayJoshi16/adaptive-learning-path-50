import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface ProctoringState {
  warnings: number;
  isBlocked: boolean;
  violations: string[];
}

export function useProctoring(
  maxWarnings: number = 3, 
  onAutoSubmit?: () => void
) {
  const [state, setState] = useState<ProctoringState>({
    warnings: 0,
    isBlocked: false,
    violations: [],
  });

  const recordViolation = useCallback((reason: string) => {
    setState(prev => {
      const newWarnings = prev.warnings + 1;
      const newViolations = [...prev.violations, reason];
      
      toast.error(`Warning ${newWarnings}/${maxWarnings}: ${reason}`, {
        duration: 5000,
      });

      if (newWarnings >= maxWarnings && !prev.isBlocked) {
        toast.error('Maximum warnings reached. Auto-submitting test.', {
          duration: 10000,
        });
        if (onAutoSubmit) {
          onAutoSubmit();
        }
        return { warnings: newWarnings, isBlocked: true, violations: newViolations };
      }
      return { warnings: newWarnings, isBlocked: prev.isBlocked, violations: newViolations };
    });
  }, [maxWarnings, onAutoSubmit]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('Tab switched or browser minimized');
      }
    };

    const handleBlur = () => {
      recordViolation('Window lost focus');
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('Copy/Paste is restricted during assessments');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common shortcuts like F12, Ctrl+C, Ctrl+V
      if (
        e.key === 'F12' || 
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'v' || e.key === 'x'))
      ) {
        e.preventDefault();
        recordViolation('Keyboard shortcut restricted');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [recordViolation]);

  return { state, recordViolation };
}
