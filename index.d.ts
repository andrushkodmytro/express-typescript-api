import { UserHydratedDocument } from './src/user/user.type'

declare global {
  namespace Express {
    export interface Request {
      user: UserHydratedDocument
    }
  }
}
