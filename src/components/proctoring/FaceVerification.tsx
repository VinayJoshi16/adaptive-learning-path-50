import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Camera, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FaceVerificationProps {
  onVerified: () => void;
  onFailed: () => void;
}

/* ---------- Image‑histogram face comparison utilities ---------- */

/** Draw an image source (base64 or video element) onto a hidden canvas and return its ImageData. */
function getImageData(
  source: HTMLVideoElement | string,
  width = 160,
  height = 160,
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas 2D context unavailable'));

    if (source instanceof HTMLVideoElement) {
      // Capture current frame from the webcam
      ctx.drawImage(source, 0, 0, width, height);
      resolve(ctx.getImageData(0, 0, width, height));
    } else {
      // Load a base64 string into an Image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(ctx.getImageData(0, 0, width, height));
      };
      img.onerror = () => reject(new Error('Failed to load profile photo'));
      img.src = source;
    }
  });
}

/** Build a normalised RGB colour histogram (16 bins per channel = 48‑dim vector). */
function buildHistogram(data: ImageData): number[] {
  const bins = 16;
  const hist = new Array(bins * 3).fill(0);
  const d = data.data; // RGBA flat array
  const totalPixels = data.width * data.height;

  for (let i = 0; i < d.length; i += 4) {
    const rBin = Math.min(Math.floor(d[i] / (256 / bins)), bins - 1);
    const gBin = Math.min(Math.floor(d[i + 1] / (256 / bins)), bins - 1);
    const bBin = Math.min(Math.floor(d[i + 2] / (256 / bins)), bins - 1);
    hist[rBin] += 1;
    hist[bins + gBin] += 1;
    hist[bins * 2 + bBin] += 1;
  }

  // Normalise so each value is a proportion
  for (let i = 0; i < hist.length; i++) {
    hist[i] /= totalPixels;
  }
  return hist;
}

/** Cosine similarity → 0‑100 percentage. */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return Math.round((dot / denom) * 100);
}

/* ---------- Component ---------- */

const MATCH_THRESHOLD = 70; // % required to pass

export function FaceVerification({ onVerified, onFailed }: FaceVerificationProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'initializing' | 'ready' | 'verifying' | 'success' | 'failed'>('initializing');
  const [matchScore, setMatchScore] = useState<number>(0);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const profilePhoto = user?.user_metadata?.profilePhotoBase64;

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('ready');
      } catch (err) {
        console.error("Error accessing webcam", err);
        toast.error("Webcam access is required for proctoring.");
        setStatus('failed');
        setErrorMsg('Camera access denied');
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleVerify = async () => {
    if (!profilePhoto) {
      toast.error('No registered profile photo found. Please re-register with a photo.');
      setStatus('failed');
      setErrorMsg('No profile photo on file');
      setTimeout(onFailed, 2000);
      return;
    }

    if (!videoRef.current) {
      toast.error('Camera not ready. Please try again.');
      return;
    }

    setStatus('verifying');

    try {
      // Capture the current webcam frame as a base64 thumbnail for UI display
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = 320;
      previewCanvas.height = 240;
      const previewCtx = previewCanvas.getContext('2d');
      if (previewCtx) {
        previewCtx.drawImage(videoRef.current, 0, 0, 320, 240);
        setCapturedFrame(previewCanvas.toDataURL('image/jpeg', 0.8));
      }

      // Get ImageData for both images (standardised size for fair comparison)
      const [webcamData, profileData] = await Promise.all([
        getImageData(videoRef.current),
        getImageData(profilePhoto),
      ]);

      // Build histograms and compute similarity
      const webcamHist = buildHistogram(webcamData);
      const profileHist = buildHistogram(profileData);
      const score = cosineSimilarity(webcamHist, profileHist);

      setMatchScore(score);

      if (score >= MATCH_THRESHOLD) {
        setStatus('success');
        toast.success(`Face matched successfully! (${score}% accuracy)`);
        setTimeout(onVerified, 1500);
      } else {
        setStatus('failed');
        setErrorMsg(`Match too low (${score}%)`);
        toast.error(`Face verification failed (${score}% match). Minimum ${MATCH_THRESHOLD}% required.`);
        setTimeout(onFailed, 2500);
      }
    } catch (err) {
      console.error('Face verification error:', err);
      setStatus('failed');
      setErrorMsg('Verification error — try again');
      toast.error('Face verification encountered an error. Please try again.');
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-12 shadow-elevated">
      <CardHeader className="text-center pb-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 mx-auto">
          <Camera className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Identity Verification</CardTitle>
        <CardDescription>
          Please verify your identity against your registered profile photo to begin the proctored assessment.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 pt-4">

        {/* Side-by-side comparison: Registered photo ↔ Live webcam */}
        <div className="w-full grid grid-cols-2 gap-3">
          {/* Registered Profile Photo */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registered Photo</span>
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-square w-full flex items-center justify-center border-2 border-primary/20">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Registered profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-xs">No photo on file</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Camera Feed */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live Camera</span>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-square w-full flex items-center justify-center border-2 border-border">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover transform scale-x-[-1]" 
              />
              
              {status === 'initializing' && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white/70 z-10">
                  <Loader2 className="w-6 h-6 animate-spin mb-1" />
                  <span className="text-xs">Accessing Camera…</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result overlay */}
        {status === 'verifying' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 w-full justify-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-primary">Comparing faces…</span>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 w-full">
            <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">{matchScore}% Match — Verified!</p>
              <p className="text-xs text-muted-foreground">Identity confirmed. Starting assessment…</p>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 w-full">
            <AlertCircle className="w-10 h-10 text-destructive flex-shrink-0" />
            <div>
              <p className="font-semibold text-destructive">{errorMsg || 'Verification Failed'}</p>
              <p className="text-xs text-muted-foreground">Minimum {MATCH_THRESHOLD}% match required.</p>
            </div>
          </div>
        )}

        {/* Info badge */}
        {status === 'ready' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 w-full">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Position your face clearly in the camera. Good lighting improves accuracy.
            </p>
          </div>
        )}
        
        <Button 
          variant="hero" 
          size="xl" 
          className="w-full"
          onClick={handleVerify}
          disabled={status !== 'ready'}
        >
          {status === 'ready' ? 'Verify My Identity' : 
           status === 'verifying' ? 'Verifying…' : 
           status === 'success' ? 'Continuing…' : 'Access Blocked'}
        </Button>
      </CardContent>
    </Card>
  );
}

