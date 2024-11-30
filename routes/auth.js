const expresss = require("express");
const router = expresss.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../keys')
const requireLogin = require('../middleware/requireLogin')

/**Middleware route */
router.get('/protected', requireLogin, (req,res)=>{
    res.send("Hello User")
})

/** Signup route */
router.post("/signup", (req, res) => {
  const { name, email, password,pic } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({ error: "Please add all the fields" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: "User already exists" });
      }

      bcrypt.hash(password, 12).then((hashedpassword) => {
        const user = new User({
          email,
          password: hashedpassword,
          name,
          pic
        });
        user
          .save()
          .then((user) => {
            res.json({ message: "saves successfully" });
          })
          .catch((err) => {
            console.log("Error in Create user", err);
          });
      });
    })
    .catch((err) => {
      console.log("Error in Create user schema", err);
    });
});

/**Signin route */
router.post('/signin',(req,res) => {
    const { email, password } = req.body
    if(!email || !password) {
        return res.status(422).json({error: "please add email or password"})
    }
    User.findOne({email: email})
    .then(savedUser => {
        if(!savedUser){
            return res.status(422).json({error: "Invalid Email or Password"})
        }
        bcrypt.compare(password, savedUser.password)
        .then(doMatch =>{
            if(doMatch){
                //return res.json({message: "successfully signed in"})
                const token = jwt.sign({_id: savedUser._id},JWT_SECRET)
                const {_id,name,email,followers,following,pic} = savedUser
                res.json({token,user: {_id,name,email,followers,following,pic}})
            }
            else {
                return res.status(422).json({error: "Invalid Email or Password"})
            }
        })
        .catch(err => {
            console.log("Error in Signin" ,err)
        })
    })
})

module.exports = router;
