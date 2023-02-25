const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs");
const User = require('../models/usermodel')
const Contact = require('../models/contactmodel')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const fs= require('fs')
const hbs = require('hbs')
const path= require('path')

exports.addContact =  asyncHandler(async(req,res,next) => {
    try {
        const dbuser = req.user;
        const name = req.body.name.trim()
        const number= req.body.number.trim()
        const isContactName = dbuser.contacts.find(c => c.name === name);
        const isContactNumber = dbuser.contacts.find(c => c.number === number);
        
        
        if( !name|| !number){
            res.status(400)
            return res.render('addContact',{user: dbuser, msg:"All fields are mandatory..", msg_type:"error"})
        }else if(number.length != 10){
            return res.render('addContact',{user: dbuser, msg:"Invalid Contact Number", msg_type:"error"})
        }
        else if(isContactName){
            return res.render('addContact',{user: dbuser, msg:"Contact Name already saved.", msg_type:"error"})
        }else if(isContactNumber){
            return res.render('addContact',{user: dbuser, msg:"Contact Number already saved.", msg_type:"error"})
        }else{

        dbuser.contacts.push({name,number})
        await dbuser.save();
        res.locals.user = dbuser;
        res.render('addContact',{user: dbuser, msg:"Contact Updated.", msg_type:"success"})

        }
        
    }catch(err){
        console.log(err);
    }

})

exports.deleteContact = asyncHandler(async(req,res,next) => {
    try {
      const { contactId } = req.params;
      const dbuser = await User.findOne({ email: req.user.email });
      dbuser.contacts.pull(contactId);
      await dbuser.save();
      res.status(200).redirect("/contact")
      
    } catch (error) {
      console.error(error);
    }
  })

  exports.editContact =  asyncHandler(async(req,res,next) => {
    try{
        const { contactId } = req.params;
        
        const dbuser = await User.findOne({ email: req.user.email });
        const edit_name = req.body.edit_name.trim()
        const edit_number= req.body.edit_number.trim()
        const isContactName = dbuser.contacts.find(c => c.name === edit_name);
        const isContactNumber = dbuser.contacts.find(c => c.number === edit_number);
        const contact = dbuser.contacts.find(c => c._id == contactId);


        
        if(isContactName){
            return res.render('editContact',{user: dbuser,contact, msg:"Contact Name already saved.", msg_type:"error"})
        }else if(isContactNumber){
            return res.render('editContact',{user: dbuser,contact, msg:"Contact Number already saved.", msg_type:"error"})
        }
        if(req.body.edit_name || req.body.edit_number){
            const contact = dbuser.contacts.find(c => c._id == contactId);
                if (contact) {
                if(edit_name && edit_number){
                    if(edit_number.length != 10){
                        return res.render('editContact',{user: dbuser,contact, msg:"Invalid Contact Number", msg_type:"error"})
                    }
                contact.name = edit_name
                contact.number = edit_number
                await dbuser.save();
                res.status(200).redirect("/contact")
                } else if(edit_name){
                    contact.name = edit_name
                    await dbuser.save();
                    res.status(200).redirect("/contact")
                }else if(edit_number){
                    if(edit_number.length != 10){
                        return res.render('editContact',{user: dbuser,contact, msg:"Invalid Contact Number", msg_type:"error"})
                    }
                    contact.number = edit_number
                    await dbuser.save();
                    res.status(200).redirect("/contact")
                }
                
                } 
        }else{
            // res.status(400).redirect("/editContact/"+contactId)
            return res.render('editContact',{user: dbuser,contact, msg:"Invalid Inputs", msg_type:"error"})
        }

    }catch(err){
        console.log(err);
    }

  })