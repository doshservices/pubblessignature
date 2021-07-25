const cloudinary = require("cloudinary");
const IndividualSchema = require("../models/individualModel");
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

class Individual {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  getIndividualWithPhoneEmail() {
    const individual = IndividualSchema.findOne({
      $or: [{ phoneNumber: this.data }, { email: this.data }],
    });
    return individual ? individual : throwError("Individual Not Found", 404);
  }

  async emailExist() {
    const existingIndividual = await IndividualSchema.findOne({
      email: this.data.email,
    }).exec();
    if (existingIndividual) {
      this.errors.push("Email already taken");
      return { emailExist: true, individual: existingIndividual };
    }
    return { emailExist: false };
  }

  async phoneNumberExist() {
    const findPhoneNumber = await IndividualSchema.findOne({
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
    const individual = new IndividualSchema(this.data);
    let validationError = individual.validateSync();
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
    const newIndividual = await individual.save();
    await new Wallet({ userId: newIndividual._id }).save();
    return newIndividual;
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
    return await IndividualSchema.findByCredentials(loginId, password);
  }

  static async getAllIndividual() {
    const individuals = await IndividualSchema.find();
    return individuals ? individuals : throwError("No Individual Found", 404);
  }

  async individualProfile() {
    const individual = await IndividualSchema.findById(this.data);
    return individual ? individual : throwError("Individual Not Found", 404);
  }

  async updateIndividualDetails() {
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
    const updateIndividual = await IndividualSchema.findOneAndUpdate(
      { email },
      { token: verificationCode },
      { new: true }
    );
    if (!updateIndividual) {
      throwError("Invalid Phone Number or Email");
    }
    await sendResetPasswordToken(
      updateIndividual.email,
      updateIndividual.firstName,
      updateIndividual.token
    );
    return updateIndividual;
  }

  async resetPassword() {
    const { token, newPassword } = this.data;
    if (!token || !newPassword) {
      throwError("Please Input Your Token and New Password");
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    const updateIndividual = await IndividualSchema.findOneAndUpdate(
      {
        token,
      },
      { token: null, password: hashed },
      { new: true }
    );
    if (!updateIndividual) {
      throwError("Invalid Token");
    }
    await SuccessfulPasswordReset(
      updateIndividual.firstName,
      updateIndividual.email
    );
    return updateIndividual;
  }
  async uploadValidID() {
    const { originalname, individualId, path } = this.data;
    let attempt = {
      imageName: originalname,
      imageUrl: path,
    };
    cloud.uploads(attempt.imageUrl).then(async (result) => {
      const imageUrl = result.url;
      const individual = await IndividualSchema.findByIdAndUpdate(
        { _id: individualId },
        { $set: { validID: imageUrl } },
        {
          new: true,
        }
      );
      return individual;
    });
  }

  async uploadProfileImage() {
    const { originalname, individualId, path } = this.data;
    let attempt = {
      imageName: originalname,
      imageUrl: path,
    };
    cloud.uploads(attempt.imageUrl).then(async (result) => {
      const imageUrl = result.url;
      const individual = await IndividualSchema.findByIdAndUpdate(
        { _id: individualId },
        { $set: { image: imageUrl } },
        {
          new: true,
        }
      );
      return individual;
    });
  }

  // delete individual
  async deleteIndividual() {
    //find all individual apartment and wallet and delete them
    const individual = await IndividualSchema.findByIdAndRemove(this.data);
    if (!individual) {
      throwError("Individual Not Found", 404);
    }
    const wallet = await Wallet.findOne({ userId: individual._id });
    if (wallet) {
      await wallet.remove();
    }
    const apartment = await ApartmentSchema.findOne({ userId: individual._id });
    if (apartment) {
      await apartment.remove();
    }
    return individual ? individual : throwError("Individual Not Found", 404);
  }

  //individual can create new apartment
  async createApartmentIndividual() {
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

  // get individual wallet
  async getIndividualWallet() {
    const wallet = await Wallet.findOne({ userId: this.data });
    return wallet ? wallet : throwError("Wallet Not Found", 404);
  }

  // get individual apartment
  async getIndividualApartment() {
    const apartment = await ApartmentSchema.find({ userId: this.data });
    return apartment ? apartment : throwError("Apartment Not Found", 404);
  }

  // get single apartment by id
  async getSingleApartmentById() {
    const apartment = await ApartmentSchema.findById(this.data);
    return apartment ? apartment : throwError("Apartment Not Found", 404);
  }

  // delete individual apartment
  async deleteIndividualApartment() {
    const id  = this.data;
    const apartment = await ApartmentSchema.findByIdAndRemove({ _id: id });
    if (!apartment) {
      throwError("Apartment Not Found", 404);
    }
    return apartment;
  }
}

module.exports = Individual;
