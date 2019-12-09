const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Job = require("../../models/Job");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// NOTE  Create a job
// @route   Get api/jobs
// @desc    Create a job
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
        check("loaiCongViec", "loaiCongViec is required")
          .not()
          .isEmpty(),
        check("nganhNghe", "nganhNghe is required")
          .not()
          .isEmpty(),
        check("hinhThucTraLuong", "hinhThucTraLuong is required")
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
        const newJob = new Job({
          text: req.body.text,
          img: req.body.img,
          price: req.body.price,
          phone: req.body.phone,
          address: req.body.address,
          description: req.body.description,
          hinhThucTraLuong: req.body.hinhThucTraLuong,
          loaiCongViec: req.body.loaiCongViec,
          nganhNghe: req.body.nganhNghe,
          name: user.name,
          avatar: user.avatar,
          user: req.user.id
        });
        const job = await newJob.save();
        res.json(job);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    }
  );

  //NOTE  GET all job
// @route   Get api/jobs
// @desc    Get all job
// @access  Private
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ date: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//NOTE  get job by id
// @route   Get api/jobs/:id
// @desc    Get all job by id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Job not found" });
    }

    res.status(500).send("Server Error");
  }
});

// Delete bike by id
// @route   DELETE api/bikes/:id
// @desc    Delete a bike
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }
    // Check user
    if (job.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await job.remove();
    res.json({ msg: "Bike Remove" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Bike not found" });
    }

    res.status(500).send("Server Error");
  }
});
// NOTE  like a job
// @route   PUT api/jobs/like/:id
// @desc    Like a job
// @access  Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    //Check if the post has already liked
    if (
      job.likes.filter(like => like.user.toString() == req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Bike already like" });
    }
    job.likes.unshift({ user: req.user.id });
    await job.save();

    res.json(job.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//NOTE  Dislike a job
// @route   POST api/jobs/unlike/:id
// @desc    UnLike a job
// @access  Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    //Check if the post has already liked
    if (  
      job.likes.filter(like => like.user.toString() == req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Bike has not yet been liked" });
    }
    //Get remove index
    const removeIndex = job.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    job.likes.splice(removeIndex, 1);
    await job.save();

    res.json(job.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// NOTE  Create a comment
// @route    POST api/jobs/comment/:id
// @desc     Comment on a job
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
      const job = await Job.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };
      job.comment.unshift(newComment);
      await job.save();

      res.json(job.comment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/jobs/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    // Pull out comment
    const comment = job.comment.find(
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
    const removeIndex = job.comment
      .map(comment => comment.id)
      .indexOf(req.params.comment_id);

    job.comment.splice(removeIndex, 1);

    await job.save();

    res.json(job.comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;