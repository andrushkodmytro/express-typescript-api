import { Router } from 'express'
import userController from './user.controller'
import auth from '../middleware/auth.middleware'

const router = Router()

router.post('/register', userController.registerUser)

router.post('/login', userController.login)

router.get('/logout', auth, userController.logout)

router.get('/me', auth, userController.userGet)

router.patch('/me', auth, userController.userUpdate)

router.patch('/:id', auth, userController.userUpdateByAdmin)

export default router
