var {setUser , getUser} = require("../service/auth.js");
 
 function checkAuthentication(req,res,next){
     let usertoken = req.cookies?.token

     if(!usertoken) return res.redirect("/signin")

     let user =getUser(usertoken)

     if(!user) return res.redirect("/signin")

     req.user = user

     next()

 }

 module.exports = {
    checkAuthentication
 }