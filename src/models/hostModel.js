const bcrypt = require("bcrypt");
const { Schema, model } = require("mongoose");
const validator = require("validator");
const uniqueValidator = require("mongoose-unique-validator");
const { throwError } = require("../utils/handleErrors");
const { USER_TYPE } = require("../utils/constants");
const { SUPPORTED_PHONE_FORMAT } = require("../core/config");

const hostSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    companyAddress: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email!");
        }
        return validator.isEmail(value);
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isMobilePhone(value, SUPPORTED_PHONE_FORMAT)) {
          throw new Error("Invalid Phone Number!");
        }
        return validator.isMobilePhone(value);
      },
    },
    password: {
      type: String,
      required: true,
    },
    CACDocument: {
      type: String,
    },
    token: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: USER_TYPE.HOST,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ref) {
        delete ref.password;
        delete ref.tokens;
      },
    },
    toObject: {
      transform(doc, ref) {
        delete ref.password;
        delete ref.tokens;
      },
    },
  },
  {
    strictQuery: "throw",
  }
);

hostSchema.pre("save", async function save(next) {
  try {
    const host = this;

    if (!host.isModified("password")) {
      return next();
    }
    host.password = await bcrypt.hash(host.password, 10);
    next();
  } catch (e) {
    next(e);
  }
});

hostSchema.statics.findByCredentials = async (loginId, password) => {
  const host = await HostModel.findOne({
    $or: [{ phoneNumber: loginId }, { email: loginId }],
  }).orFail(() => throwError("Invalid Login Details", 404));
  const isMatch = await bcrypt.compare(password, host.password);
  if (!isMatch) {
    throwError("Incorrect Password");
  }
  return host;
};

hostSchema.plugin(uniqueValidator, { message: "{TYPE} must be unique." });

const HostModel = model("Host", hostSchema);
module.exports = HostModel;
