import React, { useRef, useState } from 'react'

const sleep = async (msec: number) =>  {
  return new Promise(resolve => setTimeout(resolve, msec));
}

// http://localhost:3000/animation/setTimeout

const SetTimeOut = () => {
  const [count, setCount] = useState<number>(0)
  const intervalIdRef = useRef<NodeJS.Timer | null>(null)
  const [isStarted, setIsStarted] = useState<boolean>(false)

  const increment = async () => {
    setCount((prev) => prev + 1)
    await sleep(100)
  }

  const handleStart = () => {
    intervalIdRef.current = setInterval(increment, 100)
    setIsStarted(true)
  }

  const handleStop = () => {
    const intervalId = intervalIdRef.current
    if (!intervalId) return
    clearInterval(intervalId)
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

export default SetTimeOut
