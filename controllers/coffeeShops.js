const express = require("express");
const router = express.Router();
const CoffeeShop = require("../models/coffeeShop");
const User = require("../models/user");
const Review = require("../models/review");

router.get("/", async (req, res) => {
  try {
    let coffeeShops;

    // Add averageRating property to each shop
    if (req.query.filter === "user" && req.session.user) {
      coffeeShops = await CoffeeShop.find({ addedBy: req.session.user._id }).populate({
        path: "reviews",
        select: "rating",
      });
    } else {
      coffeeShops = await CoffeeShop.find().populate({
        path: "reviews",
        select: "rating",
      });
    }
    // rating calculation and handling done by ChatGPT
    coffeeShops = coffeeShops.map(shop => {
      const ratings = shop.reviews.map(r => r.rating);
      const averageRating = ratings.length
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : null;

      return {
        ...shop.toObject(),
        averageRating,
      };
    });


    res.render("coffeeShops/index.ejs", {
      coffeeShops: coffeeShops,
      user: req.session.user,
      filter: req.query.filter || "all",
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/new", async (req, res) => {
  res.render("coffeeShops/new.ejs");
});

router.post("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/auth/sign-in");
    }
    req.body.addedBy = req.session.user._id;
    await CoffeeShop.create(req.body);
    res.redirect("/coffeeShops");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

router.get("/:coffeeShopId", async (req, res) => {
  try {
    const coffeeShop = await CoffeeShop.findById(req.params.coffeeShopId)
      .populate("addedBy")
      .populate({
        path: "reviews",
        populate: { path: "userId", select: "username" },
      });

    if (!coffeeShop) {
      return res.redirect("/coffeeShops");
    }
    
    // rating calculation and handling done by ChatGPT
    // Calculate average rating
    const ratings = coffeeShop.reviews.map(r => r.rating);
    const averageRating = ratings.length
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : "No ratings yet";
    
    coffeeShop.averageRating = averageRating;

    res.render("coffeeShops/show.ejs", { coffeeShop, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.redirect("/coffeeShops");
  }
});
module.exports = router;
