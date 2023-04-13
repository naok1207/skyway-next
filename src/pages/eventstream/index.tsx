import type { NextPage } from 'next'
import EventSource from 'eventsource'
import { RefObject, useEffect, useRef, useState } from 'react'
const serverUrl = 'http://localhost:3001/events'

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
  useVideoEffect(ref)
  const [eventSource, setEventSource] = useState<EventSource>()

  useVideoEffect(ref)

  useEffect(() => {
    if (!eventSource) return
    
    return () => {
      eventSource.close()
    }
  }, [eventSource])

  const handleStartEventSource = () => {
    const eventSource = new EventSource(serverUrl)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    eventSource.onmessage = (event) => {
      console.log({ event })
    }
    setEventSource(eventSource)
  }

  const handleStopEventSource = () => {
    if (!eventSource) return
    eventSource.close()
  }

  return (
    <div>
      <div>VideoPage</div>
      <button onClick={handleStartEventSource}>start</button>
      <br />
      <button onClick={handleStopEventSource}>stop</button>
      <video
        ref={ref}
        width="400px" autoPlay muted playsInline></video>
    </div>
  )
}

export default VideoPage
