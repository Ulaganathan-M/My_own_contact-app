

const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs");
const User = require('../models/usermodel')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const fs= require('fs')
const nodemailer = require('nodemailer')


// exports.register =asyncHandler(async(req,res) => {
    
//     const {name,email,password,confirm_password} = req.body
//     if(!name || !email || !password || !confirm_password){
//         res.status(400)
//         return res.render('register',{msg:"All fields are mandatory..", msg_type:"error"})
//     }
//     if(password!==confirm_password){
//         res.status(400)
//         return res.render('register',{msg:'confirm password not matched..',msg_type:"error"})
//     }
//     const userAvailable = await User.findOne({ email });
//     if(userAvailable){
//         res.status(400)
//         return res.render('register',{msg:'Email already Registered..',msg_type:"error"})
//     }else {
//         const hashPassword = await bcrypt.hash(password, 10);

//         const user = await User.create({
//                 name,
//                 email,
//                 password: hashPassword
//             })

//         return res.render('register',{msg:'Registeration Success!',msg_type:"success"})

//     }
    

// })

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
        

        const token = jwt.sign({name, email, hashPassword}, process.env.JWT_SIGNUP_KEY,{expiresIn: '15m'})


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: 'ulagaoffice@gmail.com',
                pass: process.env.MAIL_PASS
            }
        })
        const option = {
            from:'ulagaoffice@gmail.com',
            to: email,
            subject:'Account activation',
            html: `
            <h2>Click on given link to activate your Account</h2>
            <form action="${process.env.CLIENT_URL}/auth/email-activate/${token}" method="POST">
            <input type="hidden" name="_method" value="DELETE">
            <button class="delete_btn" type="submit">click here</button>
            </form>
            `
        }
        transporter.sendMail(option, (err,info)=>{
            if(err){
                console.log(err);
            }else{
                console.log("mail send");
                return res.render('register',{msg:'Email sent!',msg_type:"success"})
            }
        })

    } 

})

exports.activateAccount=asyncHandler(async(req,res) => { 

    const {token} = req.params
    if(token){

        jwt.verify (token, process.env.JWT_SIGNUP_KEY,async (err,decodeToken)=>{
            if(err){
                return res.render('register',{msg:'Expired Link Try again!',msg_type:"error"})
            } else{
                const {name, email, hashPassword} = decodeToken
                const userAvailable = await User.findOne({ email });
                if(userAvailable){
                    res.status(400)
                    return res.render('register',{msg:'Email already Registered..',msg_type:"error"})
                }else {
                        const user = await User.create({
                            name,
                            email,
                            password: hashPassword
                        })
                    return res.render('register',{msg:'Registeration Success!',msg_type:"success"})
            
                }
                
            }
        })

    }else{
        return res.render('register',{msg:'Invalid Input Try again!',msg_type:"error"})
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

// exports.forgot =asyncHandler(async(req,res) => { 
//     try {
//     const { email, new_password, confirm_password} = req.body;
//     if( !email || !new_password || !confirm_password){
//         res.status(400)
//         return res.render('forgot',{msg:"All fields are mandatory..", msg_type:"error"})
//     }
//     const dbuser = await User.findOne({ email })

//     if(!dbuser){
//         res.status(400)
//         return res.render('forgot',{msg:'Invalid Email',msg_type:"error"})
//     }
//     if(new_password!==confirm_password){
//         res.status(400)
//         return res.render('forgot',{msg:'password not matched..',msg_type:"error"})
//     }
//     const hashPassword = await bcrypt.hash(new_password, 10);

//     await User.updateOne({ email:email },{password:hashPassword},(err,result) => {
//         if(err){
//             console.log(err);
//         }
//         return res.render('forgot',{msg:'password Changed..',msg_type:"success"})
//     })


//     }catch(error){
//     console.log(error);
// }


// })

exports.forgot =asyncHandler(async(req,res) => { 

    const { email } = req.body;
    if(!email) {
        res.status(400)
        return res.render('forgot',{msg:'Please Enter Email Address',msg_type:"error"})
    }
    const dbuser = await User.findOne({ email })

    if(!dbuser){
        return res.render('forgot',{msg:'Invalid Email Address',msg_type:"error"})

    }

    const token = jwt.sign({email}, process.env.JWT_FORGOT_KEY,{expiresIn: '15m'})


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: 'ulagaoffice@gmail.com',
            pass: process.env.MAIL_PASS
        }
    })
    const option = {
        from:'ulagaoffice@gmail.com',
        to: email,
        subject:'Account activation',
        html: `
        <h2>Click on given link to activate your Account</h2>
        <form action="${process.env.CLIENT_URL}/auth/forgot-activate/${token}" method="POST">
        <input type="hidden" name="_method" value="DELETE">
        <button class="delete_btn" type="submit">click here</button>
        </form>
        `
    }
    transporter.sendMail(option, (err,info)=>{
        if(err){
            console.log(err);
        }else{
            console.log("mail send");
            return res.render('forgot',{msg:'Email send, Check Your Email!',msg_type:"success"})
        }
    })


})

exports.forgotActivate = asyncHandler(async(req,res) => { 

    const {token} = req.params
    if(token){
        jwt.verify (token, process.env.JWT_FORGOT_KEY, (err,decodeToken)=>{
            if(err){
                return res.render('forgot',{msg:'Expired Link. Try again..',msg_type:"error"})
 
            }else{
                return res.render('forgotPass',{token: token})
            }

        })

        return res.render('forgotPass',{token: token})
    }
    return res.render('forgotPass')

})

exports.passwordChange = asyncHandler(async(req,res) => { 
    const {token} = req.params
    const new_password = req.body.new_password.trim()
    const confirm_password = req.body.confirm_password.trim()

    if(!new_password|| !confirm_password){
        return res.render('forgotPass',{token: token, msg:"All fields are mandatory..", msg_type:"error"})
    }
    if(new_password !== confirm_password){
        return res.render('forgotPass',{token: token, msg:"Password Not Matched..", msg_type:"error"})

    }
    if(token){
        jwt.verify (token, process.env.JWT_FORGOT_KEY, async(err,decodeToken)=>{
            if(err){
                return res.render('forgot',{msg:'Expired Link. Try again..',msg_type:"error"})
 
            }else{
                const {email} = decodeToken
                const hashPassword = await bcrypt.hash(new_password, 10);
                const dbuser = await User.findOne({ email });
                if(dbuser){
                    await User.updateOne({ email:email },{password:hashPassword})
                    return res.render('forgotPass',{msg:'Password Changed Successfully..',msg_type:"success"})

                }

            }
                
        })

    }else{
        return res.render('forgotPass',{msg:'Error..',msg_type:"error"})
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
            }else{
                return res.render('edit',{user: dbuser, msg:"Invalid Inputs", msg_type:"error"})
            }
            
        }catch(error){
            console.log(error);
            
        }

    } else {
        next()
    }
  
    
    })

    exports.resetPassword = asyncHandler(async(req,res) => {

        const {userId} = req.params
        const old_password = req.body.old_password.trim()
        const new_password = req.body.new_password.trim()
        const confirm_password = req.body.confirm_password.trim()
        const dbuser = await User.findOne({ _id:userId })

        if(!old_password || !new_password|| !confirm_password){
            return res.render('resetPass',{user:dbuser, msg:"All fields are mandatory..", msg_type:"error"})
        }
        if(new_password !== confirm_password){
            return res.render('resetPass',{user:dbuser, msg:"Password Not Matched..", msg_type:"error"})
    
        }
        if(dbuser && (await bcrypt.compare(old_password, dbuser.password))) {
            const hashPassword = await bcrypt.hash(new_password, 10);
            await User.updateOne({ email:dbuser.email },{password:hashPassword})
            return res.render('resetPass',{user:dbuser, msg:'Password Changed Successfully..',msg_type:"success"})



        }else{
            return res.render('resetPass',{user:dbuser, msg:'Incorrect Password!',msg_type:"error"})

        }
        

    })

    