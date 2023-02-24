
const express = require('express')
const router = express.Router()
const userController = require('../controllers/users')
const upload = require('../middleware/upload')
const isLoggedIn = require('../middleware/isLoggedin')



router.post('/register',upload.single('avatar'), userController.register)
router.post('/login', userController.login)
router.get('/logout',userController.logout)
router.post('/forgot',userController.forgot)
router.post('/edit',upload.single('changed_avatar'),userController.edit)
router.post('/addContact',userController.addContact)
router.post('/contacts/:contactId',isLoggedIn,userController.deleteContact)



module.exports = router;