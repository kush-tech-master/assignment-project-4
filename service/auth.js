var jwt = require('jsonwebtoken');
var secret = "Kush@#$%&_Upadhyay@#$%&"

function setUser(user){
    let token = jwt.sign({user},secret);

    return token;
};

function getUser(token){
    return jwt.verify(token,secret);
}

module.exports = {
    setUser,
    getUser
}