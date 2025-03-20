const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const CoffeeShop = require("../models/coffeeShop");

router.post("/:coffeeShopId/reviews", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/auth/sign-in");
    }

    const newReview = new Review({
      userId: req.session.user._id,
      coffeeShopId: req.params.coffeeShopId,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    await newReview.save();

    const coffeeShop = await CoffeeShop.findById(req.params.coffeeShopId);
    coffeeShop.reviews.push(newReview._id);
    await coffeeShop.save();

    res.redirect(`/coffeeShops/${req.params.coffeeShopId}`);
  } catch (error) {
    console.error(error);
    res.redirect(`/coffeeShops/${req.params.coffeeShopId}`);
  }
});

router.get("/:coffeeShopId/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ coffeeShopId: req.params.coffeeShopId })
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching reviews");
  }
});

module.exports = router;
