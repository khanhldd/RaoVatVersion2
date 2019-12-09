const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Pet = require("../../models/Pet");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// NOTE  Create a bike
// @route   Get api/bikes
// @desc    Create a bike
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
        const newPet = new Pet({
          text: req.body.text,
          img: req.body.img,
          price: req.body.price,
          phone: req.body.phone,
          address: req.body.address,
          description: req.body.description,
          loaiPet: req.body.loaiPet,
          color: req.body.color,
          name: user.name,
          avatar: user.avatar,
          user: req.user.id
        });
        const pet = await newPet.save();
        res.json(pet);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    }
  );

  //NOTE  GET all pet
// @route   Get api/pets
// @desc    Get all pet
// @access  Private
router.get("/", async (req, res) => {
  try {
    const pets = await Pet.find().sort({ date: -1 });
    res.json(pets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//NOTE  get pet by id
// @route   Get api/pets/:id
// @desc    Get all pets by id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ msg: "Bike not found" });
    }
    res.json(pet);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "BIke not found" });
    }

    res.status(500).send("Server Error");
  }
});

// Delete pet by id
// @route   DELETE api/bikes/:id
// @desc    Delete a bike
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ msg: "Bike not found" });
    }
    // Check user
    if (pet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await pet.remove();
    res.json({ msg: "Pet Remove" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Bike not found" });
    }

    res.status(500).send("Server Error");
  }
});
// NOTE  like a bike
// @route   PUT api/bikes/like/:id
// @desc    Like a bike
// @access  Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    //Check if the post has already liked
    if (
      pet.likes.filter(like => like.user.toString() == req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Bike already like" });
    }
    pet.likes.unshift({ user: req.user.id });
    await pet.save();

    res.json(pet.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//NOTE  Dislike a bike
// @route   POST api/bikes/unlike/:id
// @desc    UnLike a bike
// @access  Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    //Check if the post has already liked
    if (  
      pet.likes.filter(like => like.user.toString() == req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Bike has not yet been liked" });
    }
    //Get remove index
    const removeIndex = pet.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    pet.likes.splice(removeIndex, 1);
    await pet.save();

    res.json(pet.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// NOTE  Create a comment
// @route    POST api/bikes/comment/:id
// @desc     Comment on a bike
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
      const pet = await Pet.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };
      pet.comment.unshift(newComment);
      await pet.save();

      res.json(bike.comment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/bikes/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    // Pull out comment
    const comment = pet.comment.find(
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
    const removeIndex = pet.comment
      .map(comment => comment.id)
      .indexOf(req.params.comment_id);

    pet.comment.splice(removeIndex, 1);

    await pet.save();

    res.json(pet.comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;