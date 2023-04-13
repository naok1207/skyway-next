import type { NextPage } from "next";
import { useRouter } from "next/router";
import { RefObject, useEffect, useRef, useState } from "react";

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

// const useSocketEffect = () => (
//   useEffect(() => {
//     const con = new WebSocket('ws://localhost:8080');
//     con.send('Hello WebSocket!');
//     con.close();
//   }, [])
// )


const VideoPage: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  // const ref = useRef<HTMLVideoElement>(null);
  // useVideoEffect(ref)
  const [url, setUrl] = useState<string>('')

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/video/${id}`)
      const json = await result.json()
      setUrl(json.url)
    })()
  }, [])

  return (
    <div>
      {url && (
        <video
        // ref={ref}
        src={url}
        width="400px" autoPlay muted playsInline></video>
      )}

    </div>
  )
}

export default VideoPage
