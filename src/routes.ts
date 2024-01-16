import { Express } from 'express'
import users from './user/user.router'

export function routes(app: Express) {
  app.use('/api/users', users)
}
