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

router.delete("/:coffeeShopId/reviews/:reviewId", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/auth/sign-in");
    }

    const review = await Review.findById(req.params.reviewId);

    if (!review || review.userId.toString() !== req.session.user._id.toString()) {
      return res.status(403).send("You are not authorized to delete this review.");
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    await CoffeeShop.findByIdAndUpdate(req.params.coffeeShopId, {
      $pull: { reviews: req.params.reviewId },
    });

    res.redirect(`/coffeeShops/${req.params.coffeeShopId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting review");
  }
});

router.get("/:coffeeShopId/reviews/:reviewId/edit", async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review || review.userId.toString() !== req.session.user._id.toString()) {
      return res.status(403).send("Not authorized to edit this review.");
    }

    res.render("reviews/edit.ejs", {
      review,
      coffeeShopId: req.params.coffeeShopId,
      user: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading edit form");
  }
});

router.put("/:coffeeShopId/reviews/:reviewId", async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review || review.userId.toString() !== req.session.user._id.toString()) {
      return res.status(403).send("Not authorized to update this review.");
    }

    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await review.save();

    res.redirect(`/coffeeShops/${req.params.coffeeShopId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating review");
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
