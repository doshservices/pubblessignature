/*eslint-disable*/
const UserSchema = require("../models/userModel");
const { throwError } = require("../utils/handleErrors");
const bcrypt = require("bcrypt");
const util = require("../utils/util");
const { validateParameters } = require("../utils/util");
const Wallet = require("./Wallet");
const WalletSchema = require("../models/walletModel");

const {
  sendResetPasswordToken,
  SuccessfulPasswordReset,
} = require("../utils/sendgrid");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");

class User {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  // admin can get all business host
  async getAllBusinessHost() {
    const businessHost = await UserSchema.find({ role: USER_TYPE.BUSINESS });
    return businessHost;
  }

  // admin can get all individual host
  async getAllIndividualHost() {
    const individualHost = await UserSchema.find({
      role: USER_TYPE.INDIVIDUAL,
    });
    return individualHost;
  }

  //verify host
  async verifyHost() {
    const { userId } = this.data;
    const verifyHost = await UserSchema.findOne({ userId: User._id });
    verifyHost.isVerified = true;
    return verifyHost;
  }
}
module.exports = User;
