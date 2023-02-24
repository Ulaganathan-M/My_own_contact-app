

const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs");
const User = require('../models/usermodel')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const fs= require('fs')
const hbs = require('hbs')





exports.register =asyncHandler(async(req,res) => {
    
    const {name,email,password,confirm_password} = req.body
    if(!name || !email || !password || !confirm_password){
        res.status(400)
        return res.render('register',{msg:"All fields are mandatory..", msg_type:"error"})
    }
    if(password!==confirm_password){
        res.status(400)
        return res.render('register',{msg:'confirm password not matched..',msg_type:"error"})
    }
    const userAvailable = await User.findOne({ email });
    if(userAvailable){
        res.status(400)
        return res.render('register',{msg:'Email already Registered..',msg_type:"error"})
    }else {
        const hashPassword = await bcrypt.hash(password, 10);
        if(req.file){
            const user = await User.create({
                name,
                email,
                password: hashPassword,
                avatar: req.file.filename
            })

        }else{
            const user = await User.create({
                name,
                email,
                password: hashPassword
            })

        }
        return res.render('register',{msg:'Registeration Success!',msg_type:"success"})

    }
    

})

exports.login =asyncHandler(async(req,res) => { 
    try{
        const { email, password} = req.body;
        if(!email || !password) {
            res.status(400)
            return res.render('login',{msg:'Please Enter Email and Password',msg_type:"error"})
        }
        const dbuser = await User.findOne({ email })

        if(!dbuser){
            res.status(400)
            return res.render('login',{msg:'Invalid Email',msg_type:"error"})
        }
        
        if(dbuser && (await bcrypt.compare(password, dbuser.password))) {
            const id = dbuser.email
            const token = jwt.sign({id: id}, 
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
            )

            const cookieOptions = {
                expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60*60* 1000),
                httpOnly: true
            }
            res.cookie("usercookie",token,cookieOptions)
            res.status(200).redirect("/home")
            
        }else {
            res.status(400)
            return res.render('login',{msg:'Incorrect Password',msg_type:"error"})
        }

    }catch(error){
        console.log(error);
    }
})


exports.logout = asyncHandler(async(req,res,next) => {
    res.cookie("usercookie","logout",{
        expires: new Date(Date.now()+1*1000),
        httpOnly: true
    })
   
    res.status(200).redirect("/")

})

exports.forgot =asyncHandler(async(req,res) => { 
    try {
    const { email, new_password, confirm_password} = req.body;
    if( !email || !new_password || !confirm_password){
        res.status(400)
        return res.render('forgot',{msg:"All fields are mandatory..", msg_type:"error"})
    }
    const dbuser = await User.findOne({ email })

    if(!dbuser){
        res.status(400)
        return res.render('forgot',{msg:'Invalid Email',msg_type:"error"})
    }
    if(new_password!==confirm_password){
        res.status(400)
        return res.render('forgot',{msg:'password not matched..',msg_type:"error"})
    }
    const hashPassword = await bcrypt.hash(new_password, 10);

    await User.updateOne({ email:email },{password:hashPassword},(err,result) => {
        if(err){
            console.log(err);
        }
        return res.render('forgot',{msg:'password Changed..',msg_type:"success"})
    })


    }catch(error){
    console.log(error);
}


})

exports.edit = asyncHandler(async(req,res,next) => {

    if(req.cookies.usercookie) {

        try{
            const decode= await promisify(jwt.verify)(
                req.cookies.usercookie,
                process.env.JWT_SECRET)
            
            const useremail = decode.id
            const dbuser = await User.findOne({ email:useremail })

            if(req.body.name && req.file){
                

                await User.updateOne({ email:useremail },{name:req.body.name, avatar:req.file.filename},(err,result) => {
                    if(err){
                        console.log(err);
                    }
                    filename=dbuser.avatar
                    fs.unlink('public/uploads/'+filename,(err)=>{
                        if(err){
                            console.log(err);
                        }
                    })
                    res.status(200).redirect("/profile")
                })

            }

            else if(req.body.name){
                      
                await User.updateOne({ email:useremail },{name:req.body.name },(err,result) => {
                    if(err){
                        console.log(err);
                    }
                    res.status(200).redirect("/profile")
                })
            }
            else if(req.file){
                
                await User.updateOne({ email:useremail },{avatar: req.file.filename},(err,result) => {

                    if(err){
                        console.log(err);
                    }
                    filename=dbuser.avatar
                    fs.unlink('public/uploads/'+filename,(err)=>{
                        if(err){
                            console.log(err);
                        }
                    })

                    res.status(200).redirect("/profile")
                })
            }
            
        }catch(error){
            console.log(error);
            
        }

    } else {
        next()
    }
  
    
    })

    exports.addContact =  asyncHandler(async(req,res,next) => {
        try {
            const { name, number} = req.body;
            if( !name || !number){
                res.status(400)
                return res.render('addContact',{msg:"All fields are mandatory..", msg_type:"error"})
            }
            if(req.cookies.usercookie) {
                try{
                    const decode= await promisify(jwt.verify)(
                        req.cookies.usercookie,
                        process.env.JWT_SECRET)
                    
                    const useremail = decode.id
                    const dbuser = await User.findOne({ email:useremail })

                    dbuser.contacts.push({name,number})
                    await dbuser.save();
                    // res.status(200).redirect("/addContact")
                    res.locals.user = dbuser;
                    res.render('addContact',{user: dbuser, msg:"Contact Updated.", msg_type:"success"})
                    // res.render('addContact',{msg:"Contact Updated.", msg_type:"success"})


                }catch(error){
                    console.log(error);
                    
                }
            }
        }catch(err){
            console.log(err);
        }

    })

    exports.deleteContact = async (req, res) => {
        try {
          const { contactId } = req.params;
          const dbuser = await User.findOne({ email: req.result.email });
          dbuser.contacts.pull(contactId);
          await dbuser.save();
          res.status(200).redirect("/contact")
          
        } catch (error) {
          console.error(error);
        }
      };
