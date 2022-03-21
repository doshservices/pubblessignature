/*eslint-disable*/
const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { TRANSACTION_STATUS, TRANSACTION_TYPE } = require("../utils/constants");

const flutterSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
   cardNo: {
      type: Number,
      required: true,
    },
    cvv: {
        type: Number,
        required: true,
      },
      expiryMonth: {
        type: Number,
        required: true,
      },
      expiryYear: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
      },
      reference: {
        type: String,
        required: true,
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

flutterSchema.plugin(uniqueValidator, {
  message: "{TYPE} must be unique.",
});

const flutterModel = model("Flutter", flutterSchema);
module.exports = flutterModel;