const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    coffeeShops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CoffeeShop",
      },
    ],
  },
  { timestamps: true }
);

const List = mongoose.models.List || mongoose.model("List", listSchema);
module.exports = List;
