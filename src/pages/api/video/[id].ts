import type { NextApiRequest, NextApiResponse } from 'next'
import { createReadStream, createWriteStream, writeFile, writeFileSync } from "fs";
import { saveAs } from 'file-saver'

const localReadPath = '/Users/azumanaoki/program/study_space/skyway/skyway-tutorial/public/video.mp4'
const localWritePath = '/Users/azumanaoki/program/study_space/skyway/skyway-tutorial/public'

// http://localhost:3000/api/video/0
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  const newPath = `/videos/video${id}.webm`
  // const body = JSON.parse(req.body)

  console.log(req.body)

  // const readStream = createReadStream(URL.createObjectURL(file))
  // const writeStream = createWriteStream(`${localWritePath}${newPath}`)

  // readStream.on('data', (chunk) => {
  //   writeStream.write(chunk)
  // })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // const body = []
  // const filePath = localWritePath + newPath
  // console.log({ filePath })

  // req.on('data', (chunk) => {
  //   body.push(chunk)
  // }).on('end', () => {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // // @ts-ignore
  //   body => Buffer.concat(body).toString()
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // // @ts-ignore
  //   writeFile(filePath, body, 'binary', (err) => {
  //     if (err) {
  //       console.log(err)
  //       res.status(500).send('error')
  //     }
  //     console.log('success')
  //     res.status(200).json({ url: newPath })
  //   })
  // })

  // const filePath = localWritePath + newPath
  // writeFile(filePath, file, (err) => {
  //   if (err) {
  //     res.status(500).send('error')
  //     return
  //   }
  //   res.status(200).json({ url: newPath })
  // })
  res.status(200)
}

export default handler
