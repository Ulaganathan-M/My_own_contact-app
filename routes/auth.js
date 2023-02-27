
const express = require('express')
const router = express.Router()
const userController = require('../controllers/users')
const contactController = require('../controllers/contact')
const upload = require('../middleware/upload')
const isLoggedIn = require('../middleware/isLoggedin')



//Without email Verfication
router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/logout',userController.logout)
router.post('/forgot',userController.forgot)
router.post('/edit',upload.single('changed_avatar'),userController.edit)
router.post('/reset-password/:userId',isLoggedIn,userController.resetPassword)

router.post('/addContact',isLoggedIn,contactController.addContact)
router.post('/contacts/:contactId',isLoggedIn,contactController.deleteContact)
router.post('/editContact/:contactId',isLoggedIn,contactController.editContact)
router.get('/download/:userId',contactController.download)

//with Email verfication
router.post('/email-activate/:token',userController.activateAccount)
router.post('/forgot-activate/:token',userController.forgotActivate)
router.post('/password-change/:token',userController.passwordChange)







module.exports = router;