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

/* ================================================================
   Robust face‑comparison utilities
   ‑ Grayscale + center‑crop + histogram‑equalization + edge features
   ================================================================ */

const SIZE = 128; // comparison resolution
const CROP = 0.55; // keep centre 55 % of each axis (face region)

/** Draw source onto a hidden canvas → ImageData at SIZExSIZE. */
function getImageData(
  source: HTMLVideoElement | string,
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas 2D context unavailable'));

    if (source instanceof HTMLVideoElement) {
      ctx.drawImage(source, 0, 0, SIZE, SIZE);
      resolve(ctx.getImageData(0, 0, SIZE, SIZE));
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        resolve(ctx.getImageData(0, 0, SIZE, SIZE));
      };
      img.onerror = () => reject(new Error('Failed to load profile photo'));
      img.src = source;
    }
  });
}

/** Convert RGBA ImageData → flat grayscale array (0–255). */
function toGrayscale(data: ImageData): number[] {
  const gray: number[] = [];
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    // standard luminance weights
    gray.push(Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]));
  }
  return gray;
}

/** Centre‑crop a flat WxH grayscale array → smaller cropped array + new dimensions. */
function centerCrop(gray: number[], w: number, h: number, ratio: number): { data: number[]; w: number; h: number } {
  const cw = Math.round(w * ratio);
  const ch = Math.round(h * ratio);
  const ox = Math.round((w - cw) / 2);
  const oy = Math.round((h - ch) / 2);
  const cropped: number[] = [];
  for (let y = oy; y < oy + ch; y++) {
    for (let x = ox; x < ox + cw; x++) {
      cropped.push(gray[y * w + x]);
    }
  }
  return { data: cropped, w: cw, h: ch };
}

/** Histogram equalization — normalises lighting/contrast. */
function histogramEqualize(gray: number[]): number[] {
  const hist = new Array(256).fill(0);
  for (const v of gray) hist[v]++;
  const cdf = new Array(256).fill(0);
  cdf[0] = hist[0];
  for (let i = 1; i < 256; i++) cdf[i] = cdf[i - 1] + hist[i];
  const cdfMin = cdf.find((v) => v > 0) || 0;
  const total = gray.length;
  const denom = total - cdfMin || 1;
  return gray.map((v) => Math.round(((cdf[v] - cdfMin) / denom) * 255));
}

/** Compute simple Sobel‑like edge magnitude for each pixel → flat array same size as input. */
function edgeMagnitude(gray: number[], w: number, h: number): number[] {
  const edges = new Array(w * h).fill(0);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      // horizontal gradient
      const gx =
        -gray[(y - 1) * w + (x - 1)] + gray[(y - 1) * w + (x + 1)]
        - 2 * gray[y * w + (x - 1)] + 2 * gray[y * w + (x + 1)]
        - gray[(y + 1) * w + (x - 1)] + gray[(y + 1) * w + (x + 1)];
      // vertical gradient
      const gy =
        -gray[(y - 1) * w + (x - 1)] - 2 * gray[(y - 1) * w + x] - gray[(y - 1) * w + (x + 1)]
        + gray[(y + 1) * w + (x - 1)] + 2 * gray[(y + 1) * w + x] + gray[(y + 1) * w + (x + 1)];
      edges[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return edges;
}

/** Normalised cross‑correlation between two equal‑length arrays. Returns 0–100. */
function ncc(a: number[], b: number[]): number {
  const n = a.length;
  let sumA = 0, sumB = 0;
  for (let i = 0; i < n; i++) { sumA += a[i]; sumB += b[i]; }
  const meanA = sumA / n;
  const meanB = sumB / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const denom = Math.sqrt(denA) * Math.sqrt(denB);
  if (denom === 0) return 0;
  // NCC ranges −1…+1 → scale to 0…100
  return Math.round(((num / denom) + 1) * 50);
}

/** Build a grayscale intensity histogram (32 bins) → normalised. */
function grayHistogram(gray: number[]): number[] {
  const bins = 32;
  const hist = new Array(bins).fill(0);
  for (const v of gray) {
    const b = Math.min(Math.floor(v / (256 / bins)), bins - 1);
    hist[b]++;
  }
  const total = gray.length;
  return hist.map((v) => v / total);
}

/** Cosine similarity for two vectors → 0–100. */
function cosine(a: number[], b: number[]): number {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  const denom = Math.sqrt(ma) * Math.sqrt(mb);
  if (denom === 0) return 0;
  return Math.round((dot / denom) * 100);
}

/**
 * Master comparison: returns a 0–100 match score.
 * Combines three metrics (weighted):
 *   40 % — edge‑structure NCC   (lighting invariant)
 *   30 % — equalised‑gray NCC   (face texture)
 *   30 % — gray histogram cosine (overall tone distribution)
 */
function compareFaces(imgA: ImageData, imgB: ImageData): number {
  // 1. Grayscale
  const grayA = toGrayscale(imgA);
  const grayB = toGrayscale(imgB);

  // 2. Centre‑crop (removes most background)
  const cropA = centerCrop(grayA, SIZE, SIZE, CROP);
  const cropB = centerCrop(grayB, SIZE, SIZE, CROP);

  // 3. Histogram‑equalise (normalises lighting)
  const eqA = histogramEqualize(cropA.data);
  const eqB = histogramEqualize(cropB.data);

  // Metric 1 — Edge structure (most robust to lighting)
  const edgeA = edgeMagnitude(eqA, cropA.w, cropA.h);
  const edgeB = edgeMagnitude(eqB, cropB.w, cropB.h);
  const edgeScore = ncc(edgeA, edgeB);

  // Metric 2 — Equalised gray pixel NCC
  const grayScore = ncc(eqA, eqB);

  // Metric 3 — Gray histogram cosine
  const histA = grayHistogram(eqA);
  const histB = grayHistogram(eqB);
  const histScore = cosine(histA, histB);

  // Weighted combination
  const combined = Math.round(edgeScore * 0.4 + grayScore * 0.3 + histScore * 0.3);
  return Math.max(0, Math.min(100, combined));
}

/* ================================================================ */

const MATCH_THRESHOLD = 60; // % required to pass — lowered for real‑world variance

export function FaceVerification({ onVerified, onFailed }: FaceVerificationProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'initializing' | 'ready' | 'verifying' | 'success' | 'failed'>('initializing');
  const [matchScore, setMatchScore] = useState<number>(0);
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
        console.error('Error accessing webcam', err);
        toast.error('Webcam access is required for proctoring.');
        setStatus('failed');
        setErrorMsg('Camera access denied');
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
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
      // Get ImageData for both images
      const [webcamData, profileData] = await Promise.all([
        getImageData(videoRef.current),
        getImageData(profilePhoto),
      ]);

      // Run the robust multi‑metric comparison
      const score = compareFaces(webcamData, profileData);

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
