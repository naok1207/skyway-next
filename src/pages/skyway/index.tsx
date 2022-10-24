import type { NextPage } from "next";
import { RefObject, useEffect, useRef, useState } from "react";
import Peer, { DataConnection, MediaConnection } from "skyway-js";
const peer = new Peer({ key: process.env.NEXT_PUBLIC_SKYWAY_API_KEY as string } )

/**
 * 処置手順
 * 1. A が B のpeerIDを入力し、発信ボタンをクリック
 *   - A のstreamデータを送付し、送信処理を行う
 * 2. B が A から受信を行い、返答を行う
 *   - A のstreamデータを反映する
 *   - 返答として B のstreamデータを A に送信する
 * 3. A が B からの返答を受け取る
 *   - B のstreamデータを反映する
 */

/**
 * videoの取得専用のeffect
 */
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

const Skyway: NextPage = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const theirRef = useRef<HTMLVideoElement>(null)
  const [myPeerId, setMyPeerId] = useState<string>()
  const [theirId, setTheirId] = useState<string>()
  const [connection, setConnection] = useState<DataConnection>()

  // 自身のビデオを取得
  useVideoEffect(ref)

  useEffect(() => {
    // strict mode でイベントが２重で設定されてしまうためすでに作成したイベントを削除
    peer.removeAllListeners()
    peer.on('open', () => { setMyPeerId(peer.id); console.log('peer open', { id: peer.id }) })
    peer.on('call', mediaConnection => {
      try {
        if (!ref.current) {
          console.error('ref.current not exist')
          return
        }
        mediaConnection.answer(ref.current.srcObject as MediaStream)
        setEventListener(mediaConnection)
        setTheirId(mediaConnection.remoteId)
        dataConnectionSendRecieve()
      } catch (e) {
          console.error(e)
        }
      })
    peer.on('error', err => {
      alert(err.message);
    });
    peer.on('close', () => {
      alert('通信が切断しました。');
      if (!theirRef.current) return
      theirRef.current.srcObject = null
    });

    () => {
      peer.destroy();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    dataConnectionSend(theirId)
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


  const handleSendData = () => {
    if (!theirId) {
      console.error("thier Id not exist")
      return
    }
    sendDefaultData()
  }

  /** dataConnection接続処理
   *
   */
  const dataConnectionOpen = (dataConnection: DataConnection) => {
    dataConnection.on("open", () => {
      console.log("dataConnection open")
    })
    dataConnection.on("data", ({ name, msg }) => {
      console.log("dataConnection recieve")
      console.log(`${name}: ${msg}`);
      // => 'SkyWay: Hello, World!'
    });
    dataConnection.on("close", () => {
      console.log("dataConnection closed")
    });
  }

  /**
   * dataConnection接続処理（発信側）
   */
  const dataConnectionSend = (peerId: string) => {
    const dataConnection = peer.connect(peerId)
    setConnection(dataConnection)
    dataConnectionOpen(dataConnection)
  }

  /**
   * dataConnection接続処理（受信側）
   */
  const dataConnectionSendRecieve = () => {
    peer.on("connection", (dataConnection) => {
      setConnection(dataConnection)
      dataConnectionOpen(dataConnection)
    })
  }

  const sendDefaultData = () => {
    if (!connection) {
      console.log("dataConnection not exist in sendDefaultData")
      return
    }
    console.log("handle send data")
    const data = {
      name: "Skyway",
      msg: "Hello, world",
    }
    connection.send(data)
  }

  const handleCanselCall = () => {
    peer.destroy();
    console.log('peer destroy')
  }

  return (
    <div>
      <h1>Skyway</h1>
      <div>
        <video ref={ref} width="400px" autoPlay muted playsInline></video>
        <p>Peer ID: { myPeerId }</p>
        <input value={theirId || ""} onChange={(e) => setTheirId(e.target.value)}></input>
        <button className="bg-slate-400 rounded p-1 mx-1" onClick={handleCall}>発信</button>
        <div>
          <button className="bg-slate-400 rounded p-1 mx-1" onClick={handleSendData}>データ送信</button>
          <button className="bg-slate-400 rounded p-1 mx-1" onClick={handleCanselCall}>退出</button>
        </div>
        <video id="their-video" ref={theirRef} width="400px" autoPlay muted playsInline></video>
      </div>
    </div>
  )
}

export default Skyway
