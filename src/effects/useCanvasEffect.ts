
import { RefObject, useEffect } from "react";

export const useCanvasEffect = (ref: RefObject<HTMLVideoElement>, canvasRef: RefObject<HTMLCanvasElement>) => (
  useEffect(() => {
    const video = ref.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const ctx = canvas.getContext('2d');
    if (!ctx) return
    ctx.scale(-1, 1);
    const interval = setInterval(() => {
      ctx.drawImage(video, 0, 0, -1 * canvas.width, canvas.height)
    })
    return () => {
      clearInterval(interval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
)
