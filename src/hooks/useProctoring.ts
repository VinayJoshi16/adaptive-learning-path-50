import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Use a ref for the callback so event listeners don't get re-registered every render
  const onAutoSubmitRef = useRef(onAutoSubmit);
  onAutoSubmitRef.current = onAutoSubmit;

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
        // Use setTimeout so the state update completes before auto-submit runs
        setTimeout(() => onAutoSubmitRef.current?.(), 0);
        return { warnings: newWarnings, isBlocked: true, violations: newViolations };
      }
      return { warnings: newWarnings, isBlocked: prev.isBlocked, violations: newViolations };
    });
  }, [maxWarnings]);

  useEffect(() => {
    let lastViolationTime = 0;
    const DEBOUNCE_MS = 1500; // prevent double-fire from visibilitychange + blur

    const debouncedViolation = (reason: string) => {
      const now = Date.now();
      if (now - lastViolationTime < DEBOUNCE_MS) return;
      lastViolationTime = now;
      recordViolation(reason);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        debouncedViolation('Tab switched or browser minimized');
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      debouncedViolation('Copy/Paste is restricted during assessments');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common shortcuts like F12, Ctrl+C, Ctrl+V
      if (
        e.key === 'F12' || 
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'v' || e.key === 'x'))
      ) {
        e.preventDefault();
        debouncedViolation('Keyboard shortcut restricted');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [recordViolation]);

  return { state, recordViolation };
}
