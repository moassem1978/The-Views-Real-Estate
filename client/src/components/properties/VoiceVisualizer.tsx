import { useRef, useEffect } from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
}

export default function VoiceVisualizer({ isListening }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    
    const setupAudio = async () => {
      try {
        if (!isListening) return;
        
        // Reset the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Get the audio stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Set up the audio context
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        // Connect the audio source
        if (audioContext) {
          source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          
          // Set up the data array
          const bufferLength = analyser.frequencyBinCount;
          dataArray = new Uint8Array(bufferLength);
          
          // Start animation
          animate();
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };
    
    const animate = () => {
      if (!isListening || !ctx || !analyser || !dataArray) return;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get the frequency data
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate bar width based on canvas width and data length
      const barWidth = canvas.width / dataArray.length;
      
      // Set a base height for the bars when there's little sound
      const minHeight = 2;
      
      // Draw the bars
      for (let i = 0; i < dataArray.length; i++) {
        // Make the visualizer more sensitive by amplifying the values
        const amplifiedValue = dataArray[i] * 1.5;
        
        // Cap the value at 255 (the maximum for a byte)
        const value = Math.min(amplifiedValue, 255);
        
        // Calculate the bar height
        const barHeight = (value / 255) * canvas.height * 0.8 + minHeight;
        
        // Calculate x position
        const x = i * barWidth;
        
        // Calculate y position (centered vertically)
        const y = (canvas.height - barHeight) / 2;
        
        // Use our copper/bronze color scheme with varying opacity based on value
        const opacity = 0.3 + (value / 255) * 0.7;
        ctx.fillStyle = `rgba(184, 115, 51, ${opacity})`;
        
        // Draw a rounded bar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 1, barHeight, 3);
        ctx.fill();
      }
      
      // Schedule the next frame
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isListening) {
      setupAudio();
    } else {
      // Clean up when listening stops
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Close audio connections
      if (source) {
        try {
          // Cast to any to work around TypeScript issues
          (source as any).disconnect();
        } catch (error) {
          console.error('Error disconnecting source:', error);
        }
        source = null;
      }
      if (audioContext) {
        try {
          // Cast to any to work around TypeScript issues
          (audioContext as any).close();
        } catch (error) {
          console.error('Error closing audio context:', error);
        }
        audioContext = null;
      }
    }
    
    return () => {
      // Clean up
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      if (source) {
        try {
          // Cast to any to work around TypeScript issues
          (source as any).disconnect();
        } catch (error) {
          console.error('Error disconnecting source:', error);
        }
      }
      
      if (audioContext) {
        try {
          // Cast to any to work around TypeScript issues
          (audioContext as any).close();
        } catch (error) {
          console.error('Error closing audio context:', error);
        }
      }
    };
  }, [isListening]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-12 rounded-lg"
      width={400}
      height={50}
    />
  );
}