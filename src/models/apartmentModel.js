const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const apartmentSchema = new Schema({
  userId: {
    type: String,
    index: true,
    required: true,
  },
  apartmentName: {
    type: String,
    required: true,
  },
  apartmentState: {
    type: String,
    required: true,
  },
  apartmentCountry: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  typeOfApartment: {
    type: String,
    required: true,
  },
  ammenities: {
    type: Array,
  },
  bathroom: {
    type: String,
    enum: ["AVAILABLE", "NOT AVAILABLE"],
    default: "AVAILABLE",
  },
  apartmentImages: {
    type: Array,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

apartmentSchema.plugin(uniqueValidator, { message: "{TYPE} must be unique." });

const Apartment = model("Apartment", apartmentSchema);
module.exports = Apartment;
