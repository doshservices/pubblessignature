const UserSchema = require("../models/userModel");
const { throwError } = require("../utils/handleErrors");
const bcrypt = require("bcrypt");
const util = require("../utils/util");
const cloud = require("../utils/cloudinaryConfig");
const { validateParameters } = require("../utils/util");
const { getCachedData } = require("../service/Redis");
const Wallet = require("../models/wallet");
const {
  sendResetPasswordToken,
  SuccessfulPasswordReset,
} = require("../utils/sendgrid");

class User {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  getUserWithPhoneEmail() {
    const user = UserSchema.findOne({
      $or: [{ phoneNumber: this.data }, { email: this.data }],
    });
    return user ? user : throwError("Individual Not Found", 404);
  }

  async emailExist() {
    const existingUser = await UserSchema.findOne({
      email: this.data.email,
    }).exec();
    if (existingUser) {
      this.errors.push("Email already taken");
      return { emailExist: true, user: existingUser };
    }
    return { emailExist: false };
  }

  async phoneNumberExist() {
    const findPhoneNumber = await UserSchema.findOne({
      phoneNumber: this.data.phoneNumber,
    }).exec();
    if (findPhoneNumber) {
      this.errors.push("Phone Number already taken");
      return true;
    }
    return false;
  }

  async signup() {
    const otp = this.data.otp;
    if (!otp) {
      throwError("OTP Required To Complete Signup");
    }
    const cachedOTP = await getCachedData(this.data.email);
    if (!cachedOTP) {
      throwError("OTP Code Expired");
    } else if (cachedOTP !== otp) {
      throwError("Invalid OTP");
    }
    const user = new UserSchema(this.data);
    let validationError = user.validateSync();
    if (validationError) {
      Object.values(validationError.errors).forEach((e) => {
        if (e.reason) this.errors.push(e.reason.message);
        else this.errors.push(e.message.replace("Path ", ""));
      });
      throwError(this.errors);
    }
    await Promise.all([this.emailExist(), this.phoneNumberExist()]);
    if (this.errors.length) {
      throwError(this.errors);
    }
    const newUser = await user.save();
    await new Wallet({ userId: newUser._id }).save();
    return newUser;
  }

  async login() {
    const { loginId, password } = this.data;
    const validParameters = validateParameters(
      ["loginId", "password"],
      this.data
    );
    const { isValid, messages } = validParameters;

    if (!isValid) {
      throwError(messages);
    }
    return await UserSchema.findByCredentials(loginId, password);
  }

  static async getAllUser() {
    const users = await UserSchema.find();
    return users ? users : throwError("No Individual Found", 404);
  }

  async userProfile() {
    const user = await UserSchema.findById(this.data);
    return user ? user : throwError("User Not Found", 404);
  }

  async updateUserDetails() {
    const { newDetails, oldDetails } = this.data;
    const updates = Object.keys(newDetails);
    const allowedUpdates = ["firstName", "lastName", "email", "phoneNumber"];
    return await util.performUpdate(
      updates,
      newDetails,
      allowedUpdates,
      oldDetails
    );
  }

  async forgotPassword() {
    const { email } = this.data;
    const verificationCode = Math.floor(100000 + Math.random() * 100000);
    if (!email) {
      throwError("Please Input Your Email");
    }
    const updateUser = await UserSchema.findOneAndUpdate(
      {
        email,
      },
      { token: verificationCode },
      { new: true }
    );
    if (!updateUser) {
      throwError("Invalid Email");
    }
    await sendResetPasswordToken(
      updateUser.email,
      updateUser.firstName,
      updateUser.token
    );
    return updateUser;
  }

  async resetPassword() {
    const { token, newPassword } = this.data;
    if (!token || !newPassword) {
      throwError("Please Input Your Token and New Password");
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    const updateUser = await UserSchema.findOneAndUpdate(
      {
        token,
      },
      { token: null, password: hashed },
      { new: true }
    );
    if (!updateUser) {
      throwError("Invalid Token");
    }
    await SuccessfulPasswordReset(updateUser.firstName, updateUser.email);
    return updateUser;
  }

  async uploadProfileImage() {
    const { originalname, userId, path } = this.data;
    let attempt = {
      imageName: originalname,
      imageUrl: path,
    };
    cloud.uploads(attempt.imageUrl).then(async (result) => {
      const imageUrl = result.url;
      const user = await UserSchema.findByIdAndUpdate(
        { _id: userId },
        { $set: { image: imageUrl } },
        {
          new: true,
        }
      );
      return user;
    });
  }

  //delete a user from the database
  async deleteUser() {
    //delete user wallet
    const wallet = await Wallet.findOne({ userId: this.data });
    if (wallet) {
      await wallet.remove();
    }
    const user = await UserSchema.findByIdAndRemove(this.data);
    return user;
  }

  //get user wallet
  async getUserWallet() {
    return await Wallet.findOne({ userId: this.data }).orFail(() =>
      throwError("User Not Found", 404)
    );
  }

  }

module.exports = User;
