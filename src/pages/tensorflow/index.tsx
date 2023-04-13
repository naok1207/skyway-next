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

const TensorFlowPage: NextPage = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number | null>(null);
  const [net, setNet] = useState<posenet.PoseNet>();
  // const [poses, setPoses] = useState<posenet.Pose[]>([])
  const [isStarted, setIsStarted] = useState<boolean>(false)

  useVideoEffect(ref)

  useEffect(() => {
    (async () => {
      setNet(await posenet.load())
    })()
  }, [])

  const poseDetectionFrame = useCallback(async (video: HTMLVideoElement, ctx: CanvasRenderingContext2D) => {
    console.log('poseDetectionFrame')
    if (!net) return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pose = await net.estimateSinglePose(video, imageScaleFactor, flipHorizontal, outputSride)
    // setPoses((prev) =>  [...prev, pose])
    ctx.clearRect(0, 0, contentWidth, contentHeight);
    ctx.save();
    ctx.drawImage(video, 0, 0, contentWidth, contentHeight);
    // ctx.restore();
    // 取得した座標を表示し続ける
    // poses.forEach(({ score, keypoints }) => {
    //   // TODO: 取得した骨格にポイントを描画したい場合
    //   // keypoints.map((kp, index) => {
    //   //   drawWristPoint(kp, ctx);
    //   // });

    //   // とりあえず左右の手首のみ描画してみた ポイントの色もとりあえず左右の違いが判別できるように
    //   drawWristPoint(keypoints[9], ctx, "red");
    //   drawWristPoint(keypoints[10], ctx, "yellow");
    // })

    // 取得した画像を一度だけ表示する
    drawWristPoint(pose.keypoints[9], ctx, "red");
    drawWristPoint(pose.keypoints[10], ctx, "yellow");

    requestIdRef.current = requestAnimationFrame(() => poseDetectionFrame(video, ctx));
  }, [net])

  const handleStop = useCallback(() => {
    const requestId = requestIdRef.current
    if (!requestId) return
    cancelAnimationFrame(requestId)
    setIsStarted(false)
  }, [])

  useEffect(() => {
    return () => {
      handleStop()
    }
  }, [handleStop])

  const handleStart = useCallback(() => {
    const requestId = requestIdRef.current
    if (requestId) {
      cancelAnimationFrame(requestId)
    }
    const canvas = canvasRef.current
    const video = ref.current
    if (!canvas || !video) return
    const ctx = canvas.getContext("2d");
    if (!ctx) return
    requestIdRef.current = requestAnimationFrame(() => poseDetectionFrame(video, ctx));
    setIsStarted(true)
  }, [poseDetectionFrame])

  return (
    <div>
      <h1>TensorFlowPage</h1>
      {!isStarted ? <button onClick={handleStart}>start</button> : <button onClick={handleStop}>stop</button> }
      <div className='relative'>
        <video ref={ref} width={contentWidth} height={contentHeight} className="absolute top-0 left-0"></video>
        <canvas ref={canvasRef} width={contentWidth} height={contentHeight} className="absolute top-0 left-0"></canvas>
      </div>
    </div>
  )
}

export default TensorFlowPage
