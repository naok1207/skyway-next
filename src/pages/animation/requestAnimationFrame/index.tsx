import React, { useRef, useState } from 'react'

const sleep = async (msec: number) =>  {
  return new Promise(resolve => setTimeout(resolve, msec));
}

// http://localhost:3000/animation/requestAnimationFrame

const RequestAnimationFrame = () => {
  const [count, setCount] = useState<number>(0)
  const reqIdRef = useRef<number | null>(null)
  const [isStarted, setIsStarted] = useState<boolean>(false)

  const loop = () => {
    setCount((prev) => prev + 1)
    reqIdRef.current = requestAnimationFrame(loop)
  }

  const handleStart = () => {
    reqIdRef.current = requestAnimationFrame(loop)
    setIsStarted(true)
  }

  const handleStop = () => {
    const reqId = reqIdRef.current
    if (!reqId) return
    cancelAnimationFrame(reqId)
    setIsStarted(false)
  }

  return (
    <div>
      <h1>RequestAnimationFrame</h1>
      <div>{ count }</div>
      {!isStarted ? <button onClick={handleStart}>start</button> : <button onClick={handleStop}>stop</button> }
    </div>
  )
}

export default RequestAnimationFrame
