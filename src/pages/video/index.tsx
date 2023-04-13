import type { NextPage } from 'next'
import Image from 'next/image'
import { RefObject, useEffect, useRef, useState } from 'react'

const useVideoEffect = (ref: RefObject<HTMLVideoElement>) => (
  useEffect(() => {
    let isLoaded = false
    let isCanceled = false
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (!ref.current) {
        console.error('ref.current not exist')
        return
      }
      ref.current.srcObject = stream
      // 2回レンダリングされる際にエラーメッセージが発生する
      ref.current.play()
        .then(() => {
          if (isCanceled) { ref.current?.pause() }
          else { isLoaded = true }
        })
        .catch((e) => console.error(e))
    }).catch((error) => {
      console.error('mediaDevice.getUserMedia() error:', error)
      return
    });
    () => {
      if (isLoaded) { ref.current?.pause() }
      else { isCanceled = true }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
)

const VideoPage: NextPage = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawVideo, setIsDrawVideo] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>();
  const [clippingIntervalId, setClippingIntervalId] = useState<NodeJS.Timer>();
  const [urls, setUrls] = useState<string[]>([])
  useVideoEffect(ref)

  useEffect(() => {
    if (!intervalId) return
    return () => {
      clearInterval(intervalId)
    }
  }, [intervalId])

  useEffect(() => {
    if (!clippingIntervalId) return
    return () => {
      clearInterval(clippingIntervalId)
    }
  }, [clippingIntervalId])

  const handleStart = () => {
    if (!canvasRef.current || !ref.current) return
    const canvas = canvasRef.current
    const video = ref.current

    const ctx = canvas.getContext('2d');
    canvas.width = 400
    canvas.height = 200

    if (!ctx) return
    const msec = 1000/30 // 30fps
    // const msec = 1000
    setIntervalId(setInterval(() => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    }, msec))
    setIsDrawVideo(true)
  }

  const handleStop = () => {
    clearInterval(intervalId)
  }

  const handleClipImage = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const dataURL = canvas.toDataURL('image/png')
    setUrls((prev) => {
      return [...prev, dataURL]
    })
  }

  const handleStartClipping = () => {
    if (!canvasRef.current || !ref.current) return
    const msec = 1000 // 30fps
    setClippingIntervalId(
      setInterval(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const dataURL = canvas.toDataURL('image/png')
        setUrls((prev) => {
          return [...prev, dataURL]
        })
      }, msec)
    )
  }

  const handleStopClipping = () => {
    clearInterval(clippingIntervalId)
  }

  const handleReset = () => {
    setUrls([])
  }

  return (
    <div>
      <div>VideoPage</div>
      <button onClick={handleStart}>start</button>
      <br />
      <button onClick={handleStop}>stop</button>
      <br />
      { isDrawVideo && (<>
        <button onClick={handleClipImage}>clip</button>
        <br />
        <button onClick={handleStartClipping}>start clipping</button>
        <br />
        <button onClick={handleStopClipping}>stop clipping</button>
        <br />
      </>)}
      <button onClick={handleReset}>reset</button>
      <br />
      <video
        ref={ref}
        width="400px" autoPlay muted playsInline></video>
      <canvas ref={canvasRef}></canvas>
      {urls.map((url, index) => <Image key={index} src={url} alt='' width={400} height={200}></Image>)}
    </div>
  )
}

export default VideoPage
