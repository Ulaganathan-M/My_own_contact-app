
const express = require('express')
const router = express.Router()
const userController = require('../controllers/users')
const isLoggedIn = require('../middleware/isLoggedin')



router.get(["/", "/login"], (req,res)=> {
    res.render("login")
})

router.get("/register",(req,res)=> {
    res.render("register")
})

router.get("/forgot",(req,res)=> {
    res.render("forgot")
})

router.get("/profile",isLoggedIn, (req,res)=> {
    if (req.result){
        res.render("profile", {user: req.result})
    }else {
        res.redirect("/login")
    }
        
})
router.get("/edit",isLoggedIn,(req,res)=> {
    if (req.result){
        res.render("edit", {user: req.result})
    }else {
        res.redirect("/login")
    }
})

router.get("/home",isLoggedIn,(req,res) => {
    
    if (req.result){
        res.render("home", {user: req.result})
    }else {
        res.redirect("/login")
    }
    
    
})

module.exports = router;