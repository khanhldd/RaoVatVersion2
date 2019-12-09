const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Service = require("../../models/Service");
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
      check("phanLoaiService", "phanLoaiService is required")   
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
      const newService = new Service({
        text: req.body.text,
        img: req.body.img,
        price: req.body.price,
        phone: req.body.phone,
        address: req.body.address,
        description: req.body.description,
        phanLoaiService: req.body.phanLoaiService,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const service = await newService.save();
      res.json(service);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error1");
    }
  }
);
//NOTE  GET all service
// @route   Get api/services
// @desc    Get all service
// @access  Private
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ date: -1 });
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error2");
  }
});
//NOTE  get service by id
// @route   Get api/services/:id
// @desc    Get all service by id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const service  = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(service);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.status(500).send("Server Error3");
  }
});

// Delete service by id
// @route   DELETE api/services/:id
// @desc    Delete a service
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }
    // Check user
    if (service.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await service.remove();
    res.json({ msg: "Service Remove" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Service not found" });
    }

    res.status(500).send("Server Error");
  }
});
// NOTE  like a service
// @route   PUT api/service/like/:id
// @desc    Like a service
// @access  Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    //Check if the post has already liked
    if (
      service.likes.filter(like => like.user.toString() == req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Service already like" });
    }
    service.likes.unshift({ user: req.user.id });
    await service.save();

    res.json(service.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//NOTE  Dislike a service
// @route   POST api/services/unlike/:id
// @desc    UnLike a service
// @access  Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    //Check if the fashion has already liked
    if (
      service.likes.filter(like => like.user.toString() == req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }
    //Get remove index
    const removeIndex = service.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    service.likes.splice(removeIndex, 1);
    await service.save();

    res.json(service.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// NOTE  Create a comment
// @route    POST api/service/comment/:id
// @desc     Comment on a service
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
      const service = await Service.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };
      service.comment.unshift(newComment);
      await service.save();

      res.json(service.comment);
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
    const service = await Service.findById(req.params.id);

    // Pull out comment
    const comment = service.comment.find(
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
    const removeIndex = service.comment
      .map(comment => comment.id)
      .indexOf(req.params.comment_id);

    service.comment.splice(removeIndex, 1);

    await service.save();

    res.json(service.comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
