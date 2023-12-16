import express, { Express, Request, Response } from 'express'
import config from 'config'

const app: Express = express()
const PORT = config.get('PORT')

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, this is Express + TypeScript')
})

async function start() {
  try {
    app.listen(process.env.PORT || PORT, () => {
      console.log('Server started')
    })
  } catch (e) {
    console.log(e, 'error')
  }
}

start()
