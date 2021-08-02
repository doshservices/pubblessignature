const { error, success } = require("../utils/baseController");
const { generateAuthToken } = require("../core/userAuth");
const { logger } = require("../utils/logger");
const { USER_TYPE } = require("../utils/constants");
const { registrationSuccessful } = require("../utils/sendgrid");
const Host = require("../service/Host");

exports.signup = async (req, res) => {
  try {
    const newHost = await new Host(req.body).signup();
    const token = await generateAuthToken({
      userId: newHost._id,
      isActive: newHost.isActive,
      userType: newHost.role,
    });
    registrationSuccessful(newHost.email, newHost.companyName);
    return success(res, { newHost, token });
  } catch (err) {
    logger.error("Error occurred at signup", err);
    return error(res, { code: err.code, message: err });
  }
};

exports.login = async (req, res) => {
  try {
    const hostDetails = await new Host(req.body).login();
    const token = await generateAuthToken({
      userId: hostDetails._id,
      isVerified: hostDetails.verified,
      isActive: hostDetails.isActive,
      userType: USER_TYPE.HOST,
    });
    return success(res, { hostDetails, token });
  } catch (err) {
    logger.error("Error occurred at login", err.message);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.getAllHost = async (req, res) => {
  try {
    const hosts = await Host.getAllHost();
    return success(res, { hosts });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.getHostProfile = async (req, res) => {
  try {
    const host = await new Host(req.user._id).hostProfile();
    return success(res, { host });
  } catch (err) {
    logger.error("Unable to complete fetch host profile request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.updateHostDetails = async (req, res) => {
  try {
    const newDetails = req.body;
    const oldDetails = req.user;
    const host = await new Host({ newDetails, oldDetails }).updateHostDetails();
    return success(res, { host });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.uploadCACDocument = async (req, res) => {
  try {
    const originalname = req.files[0].originalname;
    const path = req.files[0].path;
    const hostId = req.user._id;
    await new Host({ originalname, path, hostId }).uploadCACDocument();
    return success(res, {
      message:
        "Your Document has been uploaded successfully, please wait for admin to approve",
    });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    const originalname = req.files[0].originalname;
    const path = req.files[0].path;
    const hostId = req.user._id;
    const host = await new Host({
      originalname,
      path,
      hostId,
    }).uploadProfileImage();
    return success(res, { host });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.forgotPassword = (req, res) => {
  new Host(req.body)
    .forgotPassword()
    .then((data) =>
      success(res, {
        status: "success",
        success: true,
        message: "Token Has Been Sent To Your Email",
      })
    )
    .catch((err) => error(res, { code: err.code, message: err.message }));
};

exports.resetPassword = (req, res) => {
  new Host(req.body)
    .resetPassword()
    .then((data) =>
      success(res, {
        status: "success",
        success: true,
        message: "Password Reset Successful",
      })
    )
    .catch((err) => error(res, { code: err.code, message: err.message }));
};

exports.deleteHost = async (req, res) => {
  try {
    const userId = req.user._id;
    const host = await new Host(userId).deleteHost();
    return success(res, { host });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// create apartment
exports.createApartment = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = req.body;
    const files = req.files;
    await new Host({ files, data, userId }).createApartment();
    return success(res, { message: "Apartment Created Successfully" });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

//get host wallet
exports.getHostWallet = async (req, res) => {
  try {
    const userId = req.user._id;
    const wallet = await new Host(userId).getHostWallet();
    return success(res, { wallet });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// get host apartments
exports.getHostApartments = async (req, res) => {
  try {
    const userId = req.user._id;
    const apartments = await new Host(userId).getHostApartments();
    return success(res, { apartments });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// get apartment by id
exports.getApartmentById = async (req, res) => {
  try {
    const id = req.params.id;
    const apartment = await new Host(id).getApartmentById();
    return success(res, { apartment });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// update apartment by id
exports.updateApartmentById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const files = req.files;
    const apartment = await new Host({ id, data, files }).updateApartmentById();
    return success(res, { apartment });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// delete apartment
exports.deleteApartment = async (req, res) => {
  try {
    const id = req.params.id;
    const apartment = await new Host(id).deleteApartment();
    return success(res, { apartment });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// host can make apartment not available
exports.makeApartmentNotAvailable = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id;
    const apartment = await new Host({
      id,
      userId,
    }).makeApartmentNotAvailable();
    return success(res, { apartment });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};
