const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Review = require("../models/review");

router.get("/profile", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const user = await User.findById(req.session.user._id)
      .populate({ path: "lists.visited", options: { limit: 4 } })
      .populate({ path: "lists.wishlist", options: { limit: 4 } })
      .populate({ path: "followers following", select: "username profilePic" })
      .lean();

    const reviews = await Review.find({ userId: req.session.user._id })
      .populate("coffeeShopId", "name")
      .limit(3)
      .lean();

    res.render("profiles/index.ejs", { user, reviews });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

router.get("/profile/edit", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const user = await User.findById(req.session.user._id).lean();
    res.render("profiles/edit.ejs", { user });
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
});

router.post("/profile/edit", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const { bio, profilePic } = req.body;

    await User.findByIdAndUpdate(req.session.user._id, { bio, profilePic });
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
});

router.get("/profile/followers", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const user = await User.findById(req.session.user._id)
      .populate("followers", "username profilePic")
      .lean();

    res.render("profiles/followers.ejs", { profileUser: user, user });
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
});

router.get("/profile/following", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const user = await User.findById(req.session.user._id)
      .populate("following", "username profilePic")
      .lean();

    res.render("profiles/following.ejs", { profileUser: user, user });
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("username profilePic")
      .lean();

    let currentUser = null;
    if (req.session.user) {
      currentUser = await User.findById(req.session.user._id)
        .populate("following", "_id")
        .lean();
    }

    res.render("profiles/allUsers.ejs", { users, user: currentUser });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

router.get("/users/:userId", async (req, res) => {
  try {
    const profileUser = await User.findById(req.params.userId)
      .populate("lists.visited lists.wishlist")
      .populate("followers following", "username profilePic")
      .lean();

    if (!profileUser) return res.redirect("/users");

    const reviews = await Review.find({ userId: req.params.userId })
      .populate("coffeeShopId", "name")
      .limit(3)
      .lean();

    const isFollowing = req.session.user
      ? profileUser.followers.some(follower => follower._id.toString() === req.session.user._id.toString())
      : false;

    res.render("profiles/show.ejs", { profileUser, reviews, isFollowing, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.redirect("/users");
  }
});

// ChatGPT code, could not firgure out how to reload based on page I access the follow button
router.post("/users/:userId/follow", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const signedInUser = await User.findById(req.session.user._id);
    const profileUser = await User.findById(req.params.userId);

    if (!signedInUser || !profileUser) return res.redirect("/users");

    if (signedInUser._id.toString() === profileUser._id.toString()) {
      return res.redirect(`/users/${req.params.userId}`); // Prevent self-follow
    }

    const alreadyFollowing = signedInUser.following.includes(profileUser._id);

    if (alreadyFollowing) {
      signedInUser.following.pull(profileUser._id);
      profileUser.followers.pull(signedInUser._id);
    } else {
      signedInUser.following.push(profileUser._id);
      profileUser.followers.push(signedInUser._id);
    }

    await signedInUser.save();
    await profileUser.save();

    // Check if the request came from the allUsers.ejs page or the show.ejs profile page
    if (req.headers.referer && req.headers.referer.includes(`/users/${req.params.userId}`)) {
      return res.redirect(`/users/${req.params.userId}`); // Reload the same profile page
    } else {
      return res.redirect("/users"); // Reload all users list
    }

  } catch (error) {
    console.error(error);
    res.redirect("/users");
  }
});
//end of chatGPT Code

router.get("/profile/lists", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const user = await User.findById(req.session.user._id)
      .populate("lists.visited lists.wishlist lists.removed")
      .lean();

    res.render("lists/index.ejs", { user, isSelf: true });
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
});

router.get("/users/:userId/lists", async (req, res) => {
  try {
    const profileUser = await User.findById(req.params.userId)
      .populate("lists.visited lists.wishlist")
      .lean();

    res.render("lists/index.ejs", { profileUser, user: req.session.user, isSelf: false });
  } catch (error) {
    console.error(error);
    res.redirect(`/users/${req.params.userId}`);
  }
});

router.get("/users/:userId/following", async (req, res) => {
  try {
    const profileUser = await User.findById(req.params.userId)
      .populate("following", "username profilePic")
      .lean();

    res.render("profiles/following.ejs", { profileUser, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.redirect(`/users/${req.params.userId}`);
  }
});

router.get("/users/:userId/followers", async (req, res) => {
  try {
    const profileUser = await User.findById(req.params.userId)
      .populate("followers", "username profilePic")
      .lean();

    if (!profileUser) return res.redirect("/users");

    res.render("profiles/followers.ejs", { profileUser, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.redirect(`/users/${req.params.userId}`);
  }
});

router.get("/profile/reviews", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const reviews = await Review.find({ userId: req.session.user._id })
      .populate("coffeeShopId", "name")
      .lean();

    res.render("reviews/index.ejs", { reviews, user: req.session.user, isSelf: true });
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
});

router.get("/users/:userId/reviews", async (req, res) => {
  try {
    const profileUser = await User.findById(req.params.userId).lean();
    if (!profileUser) return res.redirect("/users");

    const reviews = await Review.find({ userId: req.params.userId })
      .populate("coffeeShopId", "name")
      .lean();

    res.render("reviews/index.ejs", { reviews, profileUser, user: req.session.user, isSelf: false });
  } catch (error) {
    console.error(error);
    res.redirect(`/users/${req.params.userId}`);
  }
});

module.exports = router;