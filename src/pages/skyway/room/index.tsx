import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import Peer, { MeshRoom, RoomStream } from "skyway-js";
import Video from "../../../components/Video";
const peer = new Peer({ key: process.env.NEXT_PUBLIC_SKYWAY_API_KEY as string, debug: 3 } )

const Room: NextPage = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const [theirStream, setTheirStream] = useState<RoomStream[]>([])
  const roomInputRef = useRef<HTMLInputElement>(null)
  const [isJoin, setIsJoin] = useState<boolean>(false)
  const [room, setRoom] = useState<MeshRoom>()

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
  }, [])

  useEffect(() => {
    if (!room) return
    room.once("open", () => {
      console.log("you join room")
      setIsJoin(true)
    })
    room.on("peerJoin", (peerId) => {
      console.log(`${peerId} joined`)
    })
    // room.on("data", ({ src, data }) => {})
    room.on("close", () => {
      console.log("room closed")
      setIsJoin(false)
    })
  }, [room])

  useEffect(() => {
    if (!room) return
    console.log({ theirStream })
    room.on("peerLeave", (peerId) => {
      console.log(`${peerId} reft`)
      const remainStream = theirStream.filter((stream) => stream.peerId !== peerId)
      setTheirStream(remainStream)
    })
    room.on("stream", (stream: RoomStream) => {
      setTheirStream([...theirStream, stream])
    })
  }, [room, theirStream])

  const joinRoom = (roomName: string) => {
    if (!ref.current) {
      console.error('ref.current not exist')
      return
    }
    const newRoom = peer.joinRoom(roomName, {
      mode: "mesh",
      stream: ref.current.srcObject as MediaStream
    })
    setRoom(newRoom)
  }

  const reaveRoom = () => {
    if (!room) return
    room.close()
    setRoom(undefined)
    setTheirStream([])
  }

  const handleCall = () => {
    const input = roomInputRef.current
    if (!input) return
    isJoin ? reaveRoom() : joinRoom(input.value)
    return
  }

  return (
    <div>
      <h1>Skyway Mesh Room</h1>
      <div>
        <video ref={ref} width="400px" autoPlay muted playsInline></video>
        <input hidden={isJoin} ref={roomInputRef}></input>
        <button onClick={handleCall}>{isJoin ? "退出" : "発信"}</button>
        <div>
          {theirStream.map((stream) => (
            <Video key={stream.peerId} stream={stream} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Room
