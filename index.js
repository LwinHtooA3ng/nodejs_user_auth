const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var bcrypt = require('bcryptjs');

const port = 3000
const app = express();

app.use(express.json());

const data = fs.readFileSync(`${__dirname}/dev-data/data/users.json`);
var usersdata = JSON.parse(data);

const getallusers = (req, res) => {
    res.status(200).json({
        returncode : 300,
        lenght : usersdata.length,
        data : {
            usersdata
        }
    })
}

const adduser = async (req, res) => {
    if(!req.body.email || !req.body.password) {
        return res.status(200).json({
            message : "Incomplete request."
        })
    }
    var tempemail = req.body.email;
    var email =  usersdata.find((user) => user.email == tempemail );
    if(email) {
        return res.status(200).json({
            message : 'User already exists.'
        })
    }
    var tempId = uuidv4();
    var encryptedPass = await bcrypt.hash(req.body.password, 10)
    var tempData = { ...req.body, _id : tempId, password : encryptedPass }
    usersdata.push(tempData);
    fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(usersdata), (err) => {
        if(err) {
            console.log('Something wrong');
        } else {
            res.status(200).json({
                returncode : 300,
                data : [
                    tempData
                ]
            })
        }
    })
}

const loginUser = (req, res) => {
    if(!req.body.email || !req.body.password) {
        return res.status(200).json({
            message : "Incomplete request."
        })
    }
    var logemail = req.body.email;
    var user = usersdata.find((user) => user.email == logemail);
    if(user) {
        var a = bcrypt.compare(req.body.password, user.password, function(err, respose) {
            if(respose == true) {
                return res.status(200).json({
                    returncode : 300,
                    message : "Successful."
                });
            } else if(respose == false) {
                return res.status(200).json({
                    message : "Please check your email and password again."
                });
            }else {
                return res.status(200).json({
                    message : "Something wrong please try again."
                });
            }
        });
    } else {
        return res.status(200).json({
            message : "User not found."
        });
    }
}

const updatePassword = (req, res) => {
    if(!req.body.email || !req.body.password || !req.body.newpassword ) {
        return res.status(200).json({
            message : "Incomplete request."
        })
    }
    var logemail = req.body.email;
    var user = usersdata.find((user) => user.email == logemail);
    if(user) {
        var a = bcrypt.compare(req.body.password, user.password, async function(err, respose) {
            if(respose == true) {
                var deleteUser = usersdata.findIndex((deleteuser) => deleteuser._id == user._id );
                usersdata.splice(deleteUser, 1);
                var newPass = await bcrypt.hash(req.body.newpassword, 10)
                var tempUser = {...user, password : newPass}
                usersdata.push(tempUser);
                fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(usersdata), (err) => {
                    if(err) {
                        console.log('Something wrong');
                    } else {
                        res.status(200).json({
                            returncode : 300,
                            message : "Successful.",
                            data : [
                                tempUser
                            ]
                        })
                    }
                })
            } else if(respose == false) {
                return res.status(200).json({
                    message : "Please check your email and password again."
                });
            }else {
                return res.status(200).json({
                    message : "Something wrong please try again."
                });
            }
        });
    } else {
        return res.status(200).json({
            message : "User not found."
        });
    }
}


const deleteUser = (req, res) => {
    if(!req.body.email || !req.body.password) {
        return res.status(200).json({
            message : "Incomplete request."
        })
    }
    var logemail = req.body.email;
    var user = usersdata.find((user) => user.email == logemail);
    if(user) {
        var a = bcrypt.compare(req.body.password, user.password, async function(err, respose) {
            if(respose == true) {
                var deleteUser = usersdata.findIndex((deleteuser) => deleteuser._id == user._id );
                usersdata.splice(deleteUser, 1);
                fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(usersdata), (err) => {
                    if(err) {
                        console.log('Something wrong');
                    } else {
                        res.status(200).json({
                            returncode : 300,
                            message : "Successful."
                        })
                    }
                })
            } else if(respose == false) {
                return res.status(200).json({
                    message : "Please check your email and password again."
                });
            }else {
                return res.status(200).json({
                    message : "Something wrong please try again."
                });
            }
        });
    } else {
        return res.status(200).json({
            message : "User not found."
        });
    }
}

app.route('/api/v1/users').get(getallusers);
app.route('/api/v1/register').post(adduser);
app.route('/api/v1/login').post(loginUser);
app.route('/api/v1/updatepassword').post(updatePassword);
app.route('/api/v1/deleteuser').post(deleteUser);

app.listen(port, () => {
    console.log(`Server is listen on port ${port}.`);
})