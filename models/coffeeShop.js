const mongoose = require("mongoose");

const coffeeShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    about: {
      type: String,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const CoffeeShop =
  mongoose.models.CoffeeShop || mongoose.model("CoffeeShop", coffeeShopSchema);
module.exports = CoffeeShop;
