const cloudinary = require("cloudinary");
const HostSchema = require("../models/hostModel");
const ApartmentSchema = require("../models/apartmentModel");
const { throwError } = require("../utils/handleErrors");
const bcrypt = require("bcrypt");
const util = require("../utils/util");
const cloud = require("../utils/cloudinaryConfig");
const { validateParameters } = require("../utils/util");
const Wallet = require("../models/wallet");
const { getCachedData } = require("../service/Redis");
const {
  sendResetPasswordToken,
  SuccessfulPasswordReset,
} = require("../utils/sendgrid");

class Host {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  getHostWithUniqueId() {
    const host = HostSchema.findOne({
      $or: [{ phoneNumber: this.data }, { email: this.data }],
    });
    return host
      ? host
      : throwError(
          "Host Not Found! Enter a Registered Email or Phone Number",
          404
        );
  }

  async emailExist() {
    const existingHost = await HostSchema.findOne({
      email: this.data.email,
    }).exec();
    if (existingHost) {
      this.errors.push("Email already exists");
      return { emailExist: true, host: existingHost };
    }
    return { emailExist: false };
  }

  async phoneNumberExist() {
    const findPhoneNumber = await HostSchema.findOne({
      phoneNumber: this.data.phoneNumber,
    }).exec();
    if (findPhoneNumber) {
      this.errors.push("Phone Number already exists");
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
    const host = new HostSchema(this.data);
    let validationError = host.validateSync();
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
    const newHost = await host.save();
    await new Wallet({ userId: newHost._id }).save();
    return newHost;
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
    return await HostSchema.findByCredentials(loginId, password);
  }

  static async getAllHost() {
    const hosts = await HostSchema.find();
    return hosts ? hosts : throwError("No Host Found", 404);
  }

  async hostProfile() {
    const host = await HostSchema.findById(this.data);
    return host ? host : throwError("Host Not Found", 404);
  }

  async updateHostDetails() {
    const { newDetails, oldDetails } = this.data;
    const updates = Object.keys(newDetails);
    const allowedUpdates = ["email", "phoneNumber"];
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
    const updateHost = await HostSchema.findOneAndUpdate(
      { email },
      { token: verificationCode },
      { new: true }
    );
    if (!updateHost) {
      throwError("Invalid Email");
    }
    await sendResetPasswordToken(
      updateHost.email,
      updateHost.companyName,
      updateHost.token
    );
    return updateHost;
  }

  async resetPassword() {
    const { token, newPassword } = this.data;
    if (!token || !newPassword) {
      throwError("Please Input Your Token and New Password");
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    const updateHost = await HostSchema.findOneAndUpdate(
      {
        token,
      },
      { token: null, password: hashed },
      { new: true }
    );
    if (!updateHost) {
      throwError("Invalid Token");
    }
    await SuccessfulPasswordReset(updateHost.companyName, updateHost.email);
    return updateHost;
  }

  async uploadCACDocument() {
    const { originalname, hostId, path } = this.data;
    let attempt = {
      imageName: originalname,
      imageUrl: path,
    };
    cloud.uploads(attempt.imageUrl).then(async (result) => {
      const imageUrl = result.url;
      const host = await HostSchema.findByIdAndUpdate(
        { _id: hostId },
        { $set: { CACDocument: imageUrl } },
        {
          new: true,
        }
      );
      return host;
    });
  }

  async uploadProfileImage() {
    const { originalname, hostId, path } = this.data;
    let attempt = {
      imageName: originalname,
      imageUrl: path,
    };
    cloud.uploads(attempt.imageUrl).then(async (result) => {
      const imageUrl = result.url;
      const host = await HostSchema.findByIdAndUpdate(
        { _id: hostId },
        { $set: { image: imageUrl } },
        {
          new: true,
        }
      );
      return host;
    });
  }

  //delete host
  async deleteHost() {
    // find all host apartment and delete
    const host = await HostSchema.findByIdAndRemove(this.data);
    if (!host) {
      throwError("Host Not Found", 404);
    }
    await ApartmentSchema.find({ userId: host._id }).remove();
    await Wallet.find({ userId: host._id }).remove();
    return host;
  }

  //host can create new apartment
  async createApartment() {
    const { userId, data, files } = this.data;
    let pictureFiles = files;
    if (!pictureFiles) throwError("No picture attached");
    //map through images and create a promise array using cloudinary upload function
    let multiplePicturePromise = pictureFiles.map((picture) =>
      cloudinary.v2.uploader.upload(picture.path)
    );
    let imageResponses = await Promise.all(multiplePicturePromise);
    // map image responses to array and return urls
    let imageUrls = imageResponses.map((response) => response.url);
    const {
      apartmentName,
      address,
      apartmentCountry,
      apartmentState,
      price,
      typeOfApartment,
      ammenities,
      bathroom,
    } = data;
    const newApartment = new ApartmentSchema({
      apartmentName,
      address,
      apartmentCountry,
      apartmentState,
      price,
      typeOfApartment,
      ammenities,
      bathroom,
      userId,
      apartmentImages: imageUrls,
    });
    await newApartment.save();
    return newApartment;
  }

  // get host wallet
  async getHostWallet() {
    const wallet = await Wallet.findOne({ userId: this.data });
    return wallet;
  }

  // get host apartments
  async getHostApartments() {
    const apartment = await ApartmentSchema.find({ userId: this.data });
    return apartment;
  }

  // get apartments by id
  async getApartmentById() {
    const id = this.data;
    const apartment = await ApartmentSchema.findById(id);
    return apartment;
  }

  // delete apartment
  async deleteApartment() {
    const apartment = await ApartmentSchema.findByIdAndRemove({
      _id: this.data,
    });
    return apartment;
  }
}

module.exports = Host;
