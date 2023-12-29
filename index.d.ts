import { UserHydratedDocument } from './src/user/user.model'

declare global {
  namespace Express {
    export interface Request {
      user: UserHydratedDocument
    }
  }
}
