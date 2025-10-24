// Fix: Import React to resolve 'Cannot find namespace React' error, as React.RefObject is used.
import React, { useState, useRef, useCallback, useEffect } from 'react';

const MAX_RECORDING_SECONDS = 10;

export const useRealtimeAnalysis = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial size
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
      }
    });

    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [canvasRef]);
  
  const drawWaveform = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current || !isRecording) return;
    
    const analyser = analyserRef.current;
    const dataArray = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(dataArray);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    
    if (canvasCtx) {
      canvasCtx.fillStyle = '#121212';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = '#bb86fc'; // primary color for recording
      canvasCtx.beginPath();
      const sliceWidth = canvas.width * 1.0 / dataArray.length;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] * 0.5 + 0.5;
        const y = v * canvas.height;
        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
        x += sliceWidth;
      }
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    }
    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  }, [isRecording, canvasRef]);

  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);

    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();

    setIsRecording(false);
    
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    mediaRecorderRef.current = null;
    recordingIntervalRef.current = null;
  }, [isRecording]);

  useEffect(() => {
    if (recordingTime >= MAX_RECORDING_SECONDS && isRecording) {
      stopRecording();
    }
  }, [recordingTime, isRecording, stopRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    setRecordedBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];

    if (isRecording || !navigator.mediaDevices?.getUserMedia) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      drawWaveform();

      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  }, [isRecording, drawWaveform]);

  const reset = useCallback(() => {
    stopRecording();
    setRecordedBlob(null);
    setRecordingTime(0);
    setError(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [stopRecording, canvasRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopRecording();
  }, [stopRecording]);

  return { isRecording, recordedBlob, recordingTime, error, startRecording, stopRecording, reset };
};