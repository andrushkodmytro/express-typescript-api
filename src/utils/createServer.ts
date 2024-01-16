import express, { Express, NextFunction, Request, Response } from 'express'
import { appErrorHandler } from '../error/error.controller'
import { CustomError } from './helpers/errors/customError'
import { routes } from '../routes'

export function createServer() {
  const app: Express = express()

  app.use(express.json())

  routes(app)

  app.all('*', function (req: Request, res: Response, next: NextFunction) {
    const error = new CustomError('Not found path', 404)

    next(error)
  })

  app.use(appErrorHandler)
  return app
}
