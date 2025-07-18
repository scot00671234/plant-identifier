import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access is required to take photos. Please enable camera permissions and try again.');
      onClose();
    }
  }, [facingMode, onClose]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        stopCamera();
        onCapture(base64);
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.8);
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Start camera when component mounts
  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  // Restart camera when facing mode changes
  useState(() => {
    if (stream) {
      stopCamera();
      startCamera();
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full">
        {/* Video Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Controls */}
        <div className="absolute inset-0 flex flex-col">
          {/* Top bar */}
          <div className="flex justify-between items-center p-4 bg-black bg-opacity-50">
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={switchCamera}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <RotateCcw className="h-6 w-6" />
            </button>
          </div>
          
          {/* Capture area guide */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="border-2 border-white border-dashed rounded-lg w-full max-w-sm aspect-square flex items-center justify-center">
              <p className="text-white text-center text-sm opacity-75">
                Position plant within this area
              </p>
            </div>
          </div>
          
          {/* Bottom controls */}
          <div className="p-6 bg-black bg-opacity-50">
            <div className="flex justify-center">
              <Button
                onClick={capturePhoto}
                size="lg"
                className="bg-white text-black hover:bg-gray-200 rounded-full w-16 h-16 p-0"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
