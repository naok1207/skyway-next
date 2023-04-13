import type { NextPage } from 'next'
import React, { useEffect, useRef, useState } from 'react'
import { useVideoEffect } from '../../effects/useVideoEffect'

const contentWidth = 800
const contentHeight = 600

// http://localhost:3000/tensorflow/withApi

const TensorFlowPage: NextPage = () => {
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
    const body = {
      dataURL,
      width: canvas.width,
      height: canvas.height,
    }
    // const apiUrl = '/api/tensorflow/position'
    const apiUrl = 'http://localhost:3001/pose'
    fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    }).then((res) => res.json())
      .then((json) => console.log(json))
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
      <video ref={ref} width={contentWidth} height={contentHeight} autoPlay muted playsInline className='hidden'></video>
      <canvas ref={canvasRef} width={contentWidth} height={contentHeight} ></canvas>
      {/* {urls.map((url, index) => <Image key={index} src={url} alt='' width={400} height={200}></Image>)} */}
    </div>
  )
}

export default TensorFlowPage
