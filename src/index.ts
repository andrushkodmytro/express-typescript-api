import express, { Express, NextFunction, Request, Response } from 'express'
import users from './user/user.router'
import config from 'config'
import mongoose from 'mongoose'
import { appErrorHandler } from './error/error.controller'
import { CustomError } from './utils/helpers/errors/customError'

const app: Express = express()
const PORT = config.get('PORT')

app.use(express.json())

const Uri = 'mongodb://127.0.0.1:27017/node-api'

app.use(
  '/api/users',
  // cors(),
  users
)

app.all('*', function (req: Request, res: Response, next: NextFunction) {
  const error = new CustomError('Not found path', 404)

  next(error)
})

app.use(appErrorHandler)

async function start() {
  try {
    await mongoose.connect(Uri, {
      autoIndex: true,
    })

    app.listen(process.env.PORT || PORT, () => {
      console.log('Server started')
    })
  } catch (e) {
    console.log(e, 'error')
  }
}

start()
