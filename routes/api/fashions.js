const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Fashion = require("../../models/Fashion");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// NOTE  Create a post
// @route   Get api/posts
// @desc    Create a post
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("text", "text is required")
        .not()
        .isEmpty(),
      check("phone", "Phone is required")
        .not()
        .isEmpty(),
      check("address", "Address is required")
        .not()
        .isEmpty(),
      check("description", "Description is required")
        .not()
        .isEmpty(),
      check("phanLoaiThoiTrang", "phanLoaiThoiTrang is required")   
        .not()
        .isEmpty()  
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newFashion = new Fashion({
        text: req.body.text,
        img: req.body.img,
        price: req.body.price,
        phone: req.body.phone,
        address: req.body.address,
        description: req.body.description,
        phanLoaiThoiTrang: req.body.phanLoaiThoiTrang,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const fashion = await newFashion.save();
      res.json(fashion);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
//NOTE  GET all fashion
// @route   Get api/ashions
// @desc    Get all fashion
// @access  Private
router.get("/", async (req, res) => {
  try {
    const fashions = await Fashion.find().sort({ date: -1 });
    res.json(fashions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//NOTE  get fashion by id
// @route   Get api/fashions/:id
// @desc    Get all fashion by id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const fashion = await Fashion.findById(req.params.id);
    if (!fashion) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(fashion);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.status(500).send("Server Error");
  }
});

// Delete fashion by id
// @route   DELETE api/fashions/:id
// @desc    Delete a fashion
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const fashion = await Fashion.findById(req.params.id);
    if (!fashion) {
      return res.status(404).json({ msg: "Post not found" });
    }
    // Check user
    if (fashion.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await fashion.remove();
    res.json({ msg: "Post Remove" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.status(500).send("Server Error");
  }
});
// NOTE  like a fashion
// @route   PUT api/fashions/like/:id
// @desc    Like a fashion
// @access  Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const fashion = await Fashion.findById(req.params.id);
    //Check if the post has already liked
    if (
      fashion.likes.filter(like => like.user.toString() == req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Post already like" });
    }
    fashion.likes.unshift({ user: req.user.id });
    await fashion.save();

    res.json(fashion.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//NOTE  Dislike a fashion
// @route   POST api/fashions/unlike/:id
// @desc    UnLike a fashion
// @access  Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const fashion = await Fashion.findById(req.params.id);
    //Check if the fashion has already liked
    if (
      fashion.likes.filter(like => like.user.toString() == req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }
    //Get remove index
    const removeIndex = fashion.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    fashion.likes.splice(removeIndex, 1);
    await fashion.save();

    res.json(fashion.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// NOTE  Create a comment
// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  "/comment/:id",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const fashion = await Fashion.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };
      fashion.comment.unshift(newComment);
      await fashion.save();

      res.json(post.comment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/pofashionssts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const fashion = await Fashion.findById(req.params.id);

    // Pull out comment
    const comment = fashion.comment.find(
      comment => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Get remove index
    const removeIndex = fashion.comment
      .map(comment => comment.id)
      .indexOf(req.params.comment_id);

    fashion.comment.splice(removeIndex, 1);

    await fashion.save();

    res.json(fashion.comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
