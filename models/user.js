const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lists: {
      visited: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CoffeeShop",
        },
      ],
      wishlist: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CoffeeShop",
        },
      ],
      removed: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CoffeeShop",
        },
      ],
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
