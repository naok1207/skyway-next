import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import Peer, { MediaConnection } from "skyway-js";
const peer = new Peer({ key: process.env.NEXT_PUBLIC_SKYWAY_API_KEY as string, debug: 3 } )

const Skyway: NextPage = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const theirRef = useRef<HTMLVideoElement>(null)
  const [myPeerId, setMyPeerId] = useState<string>()
  const [theirId, setTheirId] = useState<string>()

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (!ref.current) {
        console.error('ref.current not exist')
        return
      }
      ref.current.srcObject = stream
      // 2回レンダリングされる際にエラーメッセージが発生する
      ref.current.play().then(() => console.log("video started")).catch(() => console.log("video failed"))
    }).catch((error) => {
      console.error('mediaDevice.getUserMedia() error:', error)
      return
    })
    peer.on('open', () => setMyPeerId(peer.id))
    peer.on('call', mediaConnection => {
      try {
        if (!ref.current) {
          console.error('ref.current not exist')
          return
        }
        mediaConnection.answer(ref.current.srcObject as MediaStream)
        setEventListener(mediaConnection)
      } catch (e) {
        console.error(e)
      }
    })
    peer.on('error', err => {
      alert(err.message);
    });
    peer.on('close', () => {
      alert('通信が切断しました。');
    });
  }, [])

  const handleCall = () => {
    if (!theirId) {
      console.error("thier Id not exist")
      return
    }
    if (!ref.current) {
      console.error('ref.current not exist')
      return
    }
    const mediaConnection = peer.call(theirId, ref.current.srcObject as MediaStream)
    setEventListener(mediaConnection)
  }

  const setEventListener = (mediaConnection: MediaConnection) => {
    return mediaConnection.on('stream', stream => {
      if (!theirRef.current) {
        console.error('theirRef.current not exist')
        return
      }
      theirRef.current.srcObject = stream
      theirRef.current.play().then(() => console.log("theirRef video started")).catch(() => console.log("theirRef video failed"))
    })
  }

  return (
    <div>
      <h1>Skyway</h1>
      <div>
        <video ref={ref} width="400px" autoPlay muted playsInline></video>
        <p>Peer ID: { myPeerId }</p>
        <input onChange={(e) => setTheirId(e.target.value)}></input>
        <button onClick={handleCall}>発信</button>
        <video id="their-video" ref={theirRef} width="400px" autoPlay muted playsInline></video>
      </div>
    </div>
  )
}

export default Skyway
