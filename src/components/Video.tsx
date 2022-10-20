import React, { FC, useEffect, useRef } from 'react'

const Video: FC<{ stream: MediaProvider }> = ({ stream }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ref = useRef<HTMLVideoElement>(null!)

  useEffect(() => {
    if (!stream) return
    const elm = ref.current
    elm.srcObject = stream
    elm.play().then(() => console.log("theirRef video started")).catch(() => console.log("theirRef video failed"))
  }, [stream])

  return (
    <video ref={ref} width="400px" autoPlay muted playsInline></video>
  )
}

export default Video
