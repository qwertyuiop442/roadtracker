
// Helper functions for accessing device features like camera and geolocation

// Check if camera is supported
export const isCameraSupported = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// Access camera
export const accessCamera = async (videoElement: HTMLVideoElement | null, options = { video: true }): Promise<boolean> => {
  if (!isCameraSupported() || !videoElement) {
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(options);
    videoElement.srcObject = stream;
    return true;
  } catch (error) {
    console.error('Error accessing camera:', error);
    return false;
  }
};

// Take a photo from video stream
export const takePhoto = (videoElement: HTMLVideoElement | null, canvasElement: HTMLCanvasElement | null): string | null => {
  if (!videoElement || !canvasElement) {
    return null;
  }

  const { videoWidth, videoHeight } = videoElement;
  canvasElement.width = videoWidth;
  canvasElement.height = videoHeight;

  const context = canvasElement.getContext('2d');
  if (!context) return null;

  context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
  return canvasElement.toDataURL('image/webp');
};

// Stop camera stream
export const stopCamera = (videoElement: HTMLVideoElement | null) => {
  if (!videoElement || !videoElement.srcObject) return;
  
  const stream = videoElement.srcObject as MediaStream;
  const tracks = stream.getTracks();
  
  tracks.forEach(track => track.stop());
  videoElement.srcObject = null;
};

// Check if geolocation is supported
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};

// Get current position
export const getCurrentPosition = async (): Promise<GeolocationPosition | null> => {
  if (!isGeolocationSupported()) {
    return null;
  }

  try {
    return await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

// Watch position (continuous updates)
export const watchPosition = (
  onSuccess: (position: GeolocationPosition) => void, 
  onError?: (error: GeolocationPositionError) => void
): number | null => {
  if (!isGeolocationSupported()) {
    return null;
  }

  return navigator.geolocation.watchPosition(
    onSuccess,
    onError || ((error) => console.error('Geolocation error:', error)),
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
};

// Clear watch position
export const clearPositionWatch = (watchId: number | null) => {
  if (watchId !== null && isGeolocationSupported()) {
    navigator.geolocation.clearWatch(watchId);
  }
};
