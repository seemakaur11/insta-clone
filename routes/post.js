const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")

/** Get route */
router.get('/allpost', requireLogin, (req,res) => {
    Post.find()
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .then(posts => {
        res.json({posts})
    })
    .catch(err => {
        console.log("Error in view all the post",err)
    })
})
/** Get Subscriberoute */
router.get('/subscribepost', requireLogin, (req,res) => {
    // if postedBy in following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .then(posts => {
        res.json({posts})
    })
    .catch(err => {
        console.log("Error in view all the post",err)
    })
})
/** Post route */
router.post('/createpost', requireLogin, (req,res) => {
    const { title, body,pic } = req.body
    if(!title || !body || !pic){
        return res.status(422).json({error: "Please add all the fields"})
    }
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        photo:pic,
        postedBy: req.user
    })
    post.save().then(result => {
        res.json({post:result})
    })
    .catch(err => {
        console.log("Error in post",err)
    })
})
 /**My Post route */
router.get('/mypost',requireLogin, (req, res) => {
    Post.find({postedBy: req.user._id})
    .populate("postedBy","_id name")
    .then(mypost => {
        res.json({mypost})
    })
    .catch(err => {
        console.log("Error in my pots",err)
    })
})

/**Update like route */
router.put('/like',requireLogin, async (req,res) => {
   try {
    const result = await Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{new:true});

    if(!result){
        return res.status(402).json({Error:"Post not found"})
    }
    res.json(result)
   } catch(err){
    console.error("Error in updating likes:", err);
    res.status(422).json({ error: "Unable to like the post" });
   }
   
})

/**Update unlike route */
router.put('/unlike',requireLogin, async(req,res) => {
    try {
        const result = await Post.findByIdAndUpdate(req.body.postId,{
            $pull:{likes:req.user._id}
        },{new:true});
    
        if(!result){
            return res.status(402).json({Error:"Post not found"})
        }
        res.json(result)
       } catch(err){
        console.error("Error in updating unlikes:", err);
        res.status(422).json({ error: "Unable to unlike the post" });
       }
})

/**Update comment route */
router.put('/comment',requireLogin, async (req,res) => {
    try {
        const comment = {
            text:req.body.text,
            postedBy:req.user._id
        }
     const result = await Post.findByIdAndUpdate(req.body.postId,{
         $push:{comments: comment}
     },{new:true}).populate("comments.postedBy","_id name").populate("postedBy","_id name")
 
     if(!result){
         return res.status(402).json({Error:"Comment not found"})
     }
     res.json(result)
    } catch(err){
     console.error("Error in updating comment:", err);
     res.status(422).json({ error: "Unable to updating comment" });
    }
 })

 /**Delete post route */
router.delete('/deletepost/:postId', requireLogin, async(req,res) => {

      try {
        const post = await Post.findOne({_id: req.params.postId})
        .populate("postedBy","_id")
        if(!post) return res.status(404).json({error:"Post not found"})
        
        if(post.postedBy._id.toString() === req.user._id.toString()){
            const result = await Post.findByIdAndDelete(req.params.postId);
            return res.json(result)
        } else {
            return res.status(403).json({ error: "Unauthorized to delete this post" });
        }
      }catch (err) {
        console.error("Error deleting post:", err);
        return res.status(500).json({ error: "An error occurred while deleting the post" });
    }
        // .exec((err,post) =>{
        //     if(err || !post){
        //         return res.status(422).json({error:err})
        //     }
        //     if(post.postedBy._id.toString() === req.user._id.toString()){
        //         post.remove()
        //         .then(result => {
        //             return res.json(result)
        //         }).catch(err => {
        //             console.log("Error in delete post",err)
        //         })
        //     }
        // })
})
module.exports =  router



