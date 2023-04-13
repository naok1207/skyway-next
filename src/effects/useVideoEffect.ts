import { RefObject, useEffect } from "react";

export const useVideoEffect = (ref: RefObject<HTMLVideoElement>) => (
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
