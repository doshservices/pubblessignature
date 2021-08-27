const bcrypt = require("bcrypt");
const { Schema, model } = require("mongoose");
const validator = require("validator");
const uniqueValidator = require("mongoose-unique-validator");
const { throwError } = require("../utils/handleErrors");
const { GENDER, USER_TYPE } = require("../utils/constants");
const { SUPPORTED_PHONE_FORMAT } = require("../core/config");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: Object.keys(GENDER),
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
    image: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
    },
    role: {
      type: String,
      default: USER_TYPE.USER,
    },
    googleSigned: {
      type: Boolean,
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

userSchema.pre("save", async function save(next) {
  try {
    const user = this;

    if (!user.isModified("password")) {
      return next();
    }
    user.password = await bcrypt.hash(user.password, 10);
    next();
  } catch (e) {
    next(e);
  }
});

userSchema.statics.findByCredentials = async (loginId, password) => {
  const user = await UserModel.findOne({
    $or: [{ phoneNumber: loginId }, { email: loginId }],
  }).orFail(() => throwError("Invalid Login Details", 404));
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throwError("Incorrect Password");
  }
  return user;
};

userSchema.plugin(uniqueValidator, { message: "{TYPE} must be unique." });

const UserModel = model("User", userSchema);
module.exports = UserModel;
