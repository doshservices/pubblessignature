/*eslint-disable*/
const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { TRANSACTION_STATUS, TRANSACTION_TYPE } = require("../utils/constants");

const flutterSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    tx_ref: {
        type: String,
        required: true,
      },
    transaction_id: {
        type: Number,
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

const FlutterModel = model("Flutter", flutterSchema);
module.exports = FlutterModel;