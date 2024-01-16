import { Router } from 'express'
import userController from './user.controller'
import auth from '../middleware/auth.middleware'

const router = Router()

router.post('/register', userController.registerUser)

router.post('/login', userController.loginUser)

router.get('/logout', auth, userController.logoutUser)

router.get('/me', auth, userController.getUser)

router.patch('/me', auth, userController.updateUser)

router.patch('/:id', auth, userController.updateUserByAdmin)

export default router
