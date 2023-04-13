import type { NextPage } from "next";
import { useRouter } from "next/router";
import { RefObject, useEffect, useRef, useState } from "react";

const useVideoEffect = (ref: RefObject<HTMLVideoElement>, setRecorder: (recorder: MediaRecorder) => void) => (
  useEffect(() => {
    let isLoaded = false
    let isCanceled = false
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (!ref.current) {
        console.error('ref.current not exist')
        return
      }
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorder.ondataavailable = (event) => {
        const file = new Blob([event.data], { type: 'video/webm' })
        fetch(`/api/video/${id}`)
      }
      setRecorder(mediaRecorder)
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

const RecordPage: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  const ref = useRef<HTMLVideoElement>(null);
  const [recorder, setRecorder] = useState<MediaRecorder>()
  const [recorder2, setRecorder2] = useState<MediaRecorder>()
  const [url, setUrl] = useState<string>('')
  const [url2, setUrl2] = useState<string>('')
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isRecording2, setIsRecording2] = useState<boolean>(false)

  useEffect(() => {
    if (!id) return
    let isLoaded = false
    let isCanceled = false
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (!ref.current) {
        console.error('ref.current not exist')
        return
      }
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorder.ondataavailable = (event) => {
        const videoBlob = new Blob([event.data], { type: 'video/webm' })
        const blobUrl = window.URL.createObjectURL(videoBlob)
        setUrl(blobUrl)
      }
      setRecorder(mediaRecorder)
      const mediaRecorder2 = new MediaRecorder(stream)
      mediaRecorder2.ondataavailable = (event) => {
        const videoBlob = new Blob([event.data], { type: 'video/webm' })
        const blobUrl = window.URL.createObjectURL(videoBlob)
        setUrl2(blobUrl)
      }
      setRecorder2(mediaRecorder2)
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
  }, [id])

  // useEffect(() => {
  //   (async () => {
  //     const result = await fetch(`/api/video/${id}`)
  //     const json = await result.json()
  //     setUrl(json.url)
  //   })()
  // }, [])

  const handleStartRecord = () => {
    if (!recorder) return
    recorder.start()
    setIsRecording(true)
  }

  const handleStopRecord = () => {
    if(!recorder) return
    recorder.stop()
    setIsRecording(false)
  }

  const handleStartRecord2 = () => {
    if (!recorder2) return
    recorder2.start()
    setIsRecording2(true)
  }

  const handleStopRecord2 = () => {
    if(!recorder2) return
    recorder2.stop()
    setIsRecording2(false)
  }

  return (
    <div>
      <video
        ref={ref}
        width="400px" autoPlay muted playsInline></video>
        <p>record1</p>
        {url &&
          <video
            src={url}
            width="400px" autoPlay muted playsInline controls></video> }
        <p>record2</p>
        {url2 &&
          <video
            src={url2}
            width="400px" autoPlay muted playsInline controls></video> }
      {isRecording ?
        <button onClick={handleStopRecord} >stop</button> :
        <button onClick={handleStartRecord} >start</button>}
        <br />
      {isRecording2 ?
        <button onClick={handleStopRecord2} >stop2</button> :
        <button onClick={handleStartRecord2} >start2</button>}
    </div>
  )
}

export default RecordPage
