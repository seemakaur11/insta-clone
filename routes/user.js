const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Post = mongoose.model("Post");
const User = mongoose.model("User");

/**Get user router */

router.get("/user/:id", requireLogin, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ postedBy: req.params.id })
      .populate("postedBy", "_id name")
      .lean();
    res.json({ user, posts });
    // const response = JSON.parse(JSON.stringify({ user, posts }));
    //  res.json(response);
  } catch (err) {
    console.error("Error fetching user or posts:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

/**Update follower route */
router.put("/follow", requireLogin, async (req, res) => {
  try {
    const followedUser = await User.findByIdAndUpdate(
      req.body.followId,
      {
        $push: { followers: req.user._id },
      },
      { new: true }
    );
    if (!followedUser) return res.status(404).json({ error: "User to follow not found" });

    const currentUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { following: req.body.followId },
      },
      { new: true }).select("-password");

    if (!currentUser) return res.status(404).json({ error: "Current user not found" });

    res.json(currentUser);
  } catch (err) {
    console.error("Error updating followers:", err);
    res.status(500).json({ error: "An error occurred" });
  }

  
});
/**Update unfollower route */
router.put("/unfollow", requireLogin, async (req, res) => {
    try {
      const followedUser = await User.findByIdAndUpdate(
        req.body.unfollowId,
        {
          $pull: { followers: req.user._id },
        },
        { new: true }
      );
      if (!followedUser) return res.status(404).json({ error: "User to follow not found" });
  
      const currentUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.unfollowId },
        },
        { new: true }).select("-password");
  
      if (!currentUser) return res.status(404).json({ error: "Current user not found" });
  
      res.json(currentUser);
    } catch (err) {
      console.error("Error updating unfollowers:", err);
      res.status(500).json({ error: "An error occurred" });
    }

  });

  /**Update pic route */
 router.put('/updatepic',requireLogin, async(req,res) => {
   try {
    const user = await User.findByIdAndUpdate(req.user._id,{$set:{pic: req.body.pic}},{new:true});
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user)
   }catch (err) {
      console.error("Error updating pic:", err);
      res.status(500).json({ error: "An error occurred" });
    }
 })
module.exports = router;
