
const express = require('express')
const router = express.Router()
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
    if (req.user){
        res.render("profile", {user: req.user})
    }else {
        res.redirect("/login")
    }
        
})
router.get("/edit",isLoggedIn,(req,res)=> {
    if (req.user){
        res.render("edit", {user: req.user})
    }else {
        res.redirect("/login")
    }
})

router.get("/delete",isLoggedIn,(req,res)=> {
    if (req.user){
        res.render("conformation", {user: req.user})
    }else {
        res.redirect("/login")
    }
})

router.get("/resetpass",isLoggedIn,(req,res)=> {
    if (req.user){
        res.render("resetPass", {user: req.user})
    }else {
        res.redirect("/login")
    }
})

router.get("/home",isLoggedIn,(req,res) => {
    
    if (req.user){
        res.render("home", {user: req.user})
    }else {
        res.redirect("/login")
    }
    
    
})

router.get("/contact",isLoggedIn,(req,res)=> {
    if (req.user){
        res.render("contact", {user: req.user})
    }else {
        res.redirect("/login")
    }  
})

router.get("/addContact",isLoggedIn,(req,res)=> {
    if (req.user){
        res.render("addContact", {user: req.user})
    }else {
        res.redirect("/login")
    }  
})

router.get("/editContact/:contactId",isLoggedIn,(req,res)=> {
    const { contactId } = req.params;
    const contact = req.user.contacts.find(c => c._id == contactId);
    if (req.user){
        res.render("editContact", {user: req.user,contact})
    }else {
        res.redirect("/login")
    }  
})


module.exports = router;