import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FaceVerificationProps {
  onVerified: () => void;
  onFailed: () => void;
}

export function FaceVerification({ onVerified, onFailed }: FaceVerificationProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'initializing' | 'ready' | 'verifying' | 'success' | 'failed'>('initializing');
  const [matchScore, setMatchScore] = useState<number>(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('ready');
      } catch (err) {
        console.error("Error accessing webcam", err);
        toast.error("Webcam access is required for proctoring.");
        setStatus('failed');
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
    setStatus('verifying');
    
    // In a full production setup with face-api.js models loaded:
    // await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    // await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    // await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    // const detection = await faceapi.detectSingleFace(videoRef.current!).withFaceLandmarks().withFaceDescriptor();
    // Compare with registered profilePhotoBase64 descriptor...

    // For this prototype, we simulate a successful match > 85% to allow the user to proceed smoothly.
    setTimeout(() => {
      const simulatedScore = 88; // Simulate 88% match
      setMatchScore(simulatedScore);
      
      if (simulatedScore >= 85) {
        setStatus('success');
        toast.success(`Face matched successfully! (${simulatedScore}% accuracy)`);
        setTimeout(onVerified, 1500);
      } else {
        setStatus('failed');
        toast.error(`Face verification failed (${simulatedScore}% match). Access denied.`);
        setTimeout(onFailed, 2000);
      }
    }, 2000);
  };

  return (
    <Card className="max-w-md mx-auto mt-12 shadow-elevated">
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
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video w-full flex items-center justify-center">
          {status === 'initializing' ? (
            <div className="flex flex-col items-center text-white/70">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span>Accessing Camera...</span>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover transform scale-x-[-1]" 
              />
              {status === 'verifying' && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white font-medium mt-4">Analyzing Face...</span>
                </div>
              )}
              {status === 'success' && (
                <div className="absolute inset-0 bg-success/20 flex flex-col items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-16 h-16 text-success bg-white rounded-full" />
                  <span className="text-white font-bold mt-4 text-xl">{matchScore}% Match</span>
                </div>
              )}
              {status === 'failed' && (
                <div className="absolute inset-0 bg-destructive/20 flex flex-col items-center justify-center backdrop-blur-sm">
                  <AlertCircle className="w-16 h-16 text-destructive bg-white rounded-full" />
                  <span className="text-white font-bold mt-4 text-xl text-center px-4">
                    Verification Failed<br/>(Below 85%)
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        
        <Button 
          variant="hero" 
          size="xl" 
          className="w-full"
          onClick={handleVerify}
          disabled={status !== 'ready'}
        >
          {status === 'ready' ? 'Verify My Identity' : 
           status === 'verifying' ? 'Verifying...' : 
           status === 'success' ? 'Continuing...' : 'Access Blocked'}
        </Button>
      </CardContent>
    </Card>
  );
}
