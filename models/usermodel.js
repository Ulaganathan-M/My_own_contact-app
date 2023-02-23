

const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type:String,
        required: [true, "Please add the name"]
    },
    email: {
        type:String,
        required: [true, "Please add the user email address"],
        unique: [true, "Email address already registered"]
    },
    password: {
        type:String,
        required: [true, "Please add the user password"]
    },
    avatar: {
        type: String
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("User", userSchema)