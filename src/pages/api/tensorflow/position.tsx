import type { NextApiRequest, NextApiResponse } from 'next'
import * as posenet from '@tensorflow-models/posenet'
import '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-converter'
import '@tensorflow/tfjs-backend-webgl';
import { ImageData } from 'canvas';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

const imageScaleFactor = 0.50
const flipHorizontal = true
const outputSride = 16

// http://localhost:3000/api/tensorflow/position
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body
  // 画像データを取り出す
  const base64Data = body.dataURL.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');

  // 画像データを取り出す
  const imageData = new Uint8ClampedArray(buffer);

  const image = new ImageData(imageData, body.width, body.height)
  const net = await posenet.load()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const pose = await net.estimateSinglePose(image, imageScaleFactor, flipHorizontal, outputSride)
  res.status(200).json({ message: "success", pose })
}

export default handler
