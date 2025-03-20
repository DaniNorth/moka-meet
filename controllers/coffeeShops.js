const express = require("express");
const router = express.Router();
const CoffeeShop = require("../models/coffeeShop");
const User = require("../models/user");
const Review = require("../models/review");

router.get("/", async (req, res) => {
  try {
    let coffeeShops;

    if (req.query.filter === "user" && req.session.user) {
      coffeeShops = await CoffeeShop.find({ addedBy: req.session.user._id });
    } else {
      coffeeShops = await CoffeeShop.find();
    }

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

    res.render("coffeeShops/show.ejs", { coffeeShop, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.redirect("/coffeeShops");
  }
});
module.exports = router;
