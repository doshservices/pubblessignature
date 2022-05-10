/*eslint-disable*/
const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const apartmentWishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    apartmentId: {
      type: Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamp: true,
  }
);

apartmentWishlistSchema.plugin(uniqueValidator, {
  message: "{TYPE} must be unique.",
});

const ApartmentWishlist = model("ApartmentWishlist", apartmentWishlistSchema);
module.exports = ApartmentWishlist;
