const express = require("express");
const router = express.Router();
const User = require("../models/user");


router.post("/:userId/lists/visited", async (req, res) => {
  try {
    if (!req.session.user || req.session.user._id !== req.params.userId) {
      return res.redirect("/auth/sign-in");
    }

    const user = await User.findById(req.params.userId);
    if (!user.lists.visited.includes(req.body.coffeeShopId)) {
      user.lists.visited.push(req.body.coffeeShopId);
      await user.save();
    }

    res.redirect(`/coffeeShops/${req.body.coffeeShopId}`);
  } catch (error) {
    console.error(error);
    res.redirect(`/coffeeShops/${req.body.coffeeShopId}`);
  }
});

router.post("/:userId/lists/wishlist", async (req, res) => {
  try {
    if (!req.session.user || req.session.user._id !== req.params.userId) {
      return res.redirect("/auth/sign-in");
    }

    const user = await User.findById(req.params.userId);
    if (!user.lists.wishlist.includes(req.body.coffeeShopId)) {
      user.lists.wishlist.push(req.body.coffeeShopId);
      await user.save();
    }

    res.redirect(`/coffeeShops/${req.body.coffeeShopId}`);
  } catch (error) {
    console.error(error);
    res.redirect(`/coffeeShops/${req.body.coffeeShopId}`);
  }
});

module.exports = router;
