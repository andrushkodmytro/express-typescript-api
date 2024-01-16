import { Model, Types, HydratedDocument } from 'mongoose'

interface IToken {
  _id: Types.ObjectId
  token: string
}

export interface IUser {
  email: string
  password: string
  firstName: string
  lastName: string
  roles: ('user' | 'admin')[]
  tokens: IToken[]
  createdAt: string
  updatedAt: string
}

export interface IUserMethods {
  generateAuthToken(remember: boolean | undefined): Promise<{ token: string; expiresIn: number }>
}

export type UserHydratedDocument = HydratedDocument<IUser, IUserMethods>

export interface UserModel extends Model<IUser, object, IUserMethods> {
  findByCredentials(email: string, password: string): Promise<HydratedDocument<IUser, IUserMethods>>
}
