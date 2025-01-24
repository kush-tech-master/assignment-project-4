const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
   fullname: {
        type: String,
        required : true
    },
    email: {
        type: String,
        required : true,
        unique : true
    },
    password: {
        type: String,
        required : true
    }, 
    roles: {
       type: String,
       enum:["NORMAL","ADMIN"]
   },
   

} ,{timestamps: true});

const UserModel = new mongoose.model("UserModel", userSchema);

module.exports = UserModel;
