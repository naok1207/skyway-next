import type { NextPage } from 'next'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as posenet from '@tensorflow-models/posenet'
import { useVideoEffect } from '../../effects/useVideoEffect'
import '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-converter'
import '@tensorflow/tfjs-backend-webgl';

const imageScaleFactor = 0.50
const flipHorizontal = true
const outputSride = 16

const contentWidth = 800
const contentHeight = 600

const drawWristPoint = (wrist: posenet.Keypoint | undefined, ctx: CanvasRenderingContext2D, color: string) => {
  if (!wrist) return
  ctx.beginPath();
  ctx.arc(wrist.position.x, wrist.position.y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

// http://localhost:3000/tensorflow/setTimeout

const TensorFlowPage: NextPage = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<NodeJS.Timer | null>(null);
  const [net, setNet] = useState<posenet.PoseNet>();
  // const [poses, setPoses] = useState<posenet.Pose[]>([])
  const [isStarted, setIsStarted] = useState<boolean>(false)
  const [keypointsHistory, setKeyPointsHistory] = useState<posenet.Keypoint[][]>([])

  useVideoEffect(ref)

  useEffect(() => {
    (async () => {
      setNet(await posenet.load())
    })()
  }, [])

  // useEffect(() => {
  //   console.log(keypointsHistory)
  // }, [keypointsHistory])

  const poseDetectionFrame = useCallback(async (video: HTMLVideoElement, ctx: CanvasRenderingContext2D) => {
    if (!net) return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pose = await net.estimateSinglePose(video, imageScaleFactor, flipHorizontal, outputSride)
    ctx.clearRect(0, 0, contentWidth, contentHeight);
    // ctx.save();
    pose.keypoints.forEach((val) => {
      drawWristPoint(val, ctx, "yellow")
    })
    console.log(pose)
    setKeyPointsHistory((prev) => [...prev, pose.keypoints])
    // drawWristPoint(pose.keypoints[9], ctx, "red");
    // drawWristPoint(pose.keypoints[10], ctx, "yellow");
  }, [net])

  // const poseSingleposition = async (image: HTMLImageElement) => {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   const pose = await net.estimateSinglePose(image, imageScaleFactor, flipHorizontal, outputSride)
  //   console.log({ pose })
  // }

  // const handleClip = () => {
  //   if (!canvasRef.current || !ref.current) return
  //   const canvas = canvasRef.current
  //   const video = ref.current

  //   const ctx = canvas.getContext('2d');
  //   if (!ctx) return
  //   ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  //   poseSingleposition()
  // }

  const handleStop = useCallback(() => {
    const requestId = requestIdRef.current
    if (!requestId) return
    clearInterval(requestId)
    setIsStarted(false)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, contentWidth, contentHeight);
  }, [])

  useEffect(() => {
    return () => {
      const requestId = requestIdRef.current
      if (!requestId) return
      clearInterval(requestId)
    }
  }, [])

  const handleStart = useCallback(() => {
    const canvas = canvasRef.current
    const video = ref.current
    if (!canvas || !video) return
    const ctx = canvas.getContext("2d");
    if (!ctx) return
    requestIdRef.current = setInterval(() => poseDetectionFrame(video, ctx), 1000/30)
    setIsStarted(true)
  }, [poseDetectionFrame])

  return (
    <div>
      <h1>TensorFlowPage</h1>
      {!isStarted ? <button onClick={handleStart}>start</button> : <button onClick={handleStop}>stop</button> }
      <div className='relative'>
        <video ref={ref} width={contentWidth} height={contentHeight} className="absolute top-0 left-0"></video>
        <canvas ref={canvasRef} width={contentWidth} height={contentHeight} className="absolute top-0 left-0"></canvas>
        {/* <image ref={imageRef} width={contentWidth} height={contentHeight} alt=''></image> */}
      </div>
    </div>
  )
}

export default TensorFlowPage
