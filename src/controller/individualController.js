const { error, success } = require("../utils/baseController");
const { generateAuthToken } = require("../core/userAuth");
const { logger } = require("../utils/logger");
const { registrationSuccessful } = require("../utils/sendgrid");
const Individual = require("../service/Individual");

exports.signup = async (req, res) => {
  try {
    req.body["path"] = req.files[0].path;
    req.body["originalname"] = req.files[0].originalname;
    const newIndividual = await new Individual(req.body).signup();
    const token = await generateAuthToken({
      userId: newIndividual._id,
      isVerified: newIndividual.verified,
      isActive: newIndividual.isActive,
      userType: newIndividual.role,
    });
    registrationSuccessful(newIndividual.email, newIndividual.firstName);
    return success(res, { newIndividual, token });
  } catch (err) {
    logger.error("Error occurred at signup", err);
    return error(res, { code: err.code, message: err });
  }
};

exports.login = async (req, res) => {
  try {
    const individualDetails = await new Individual(req.body).login();
    const token = await generateAuthToken({
      userId: individualDetails._id,
      isActive: individualDetails.isActive,
      isVerified: individualDetails.verified,
      userType: individualDetails.role,
    });
    return success(res, { individualDetails, token });
  } catch (err) {
    logger.error("Error occurred at login", err.message);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.getAllIndividual = async (req, res) => {
  try {
    const individual = await Individual.getAllIndividual();
    return success(res, { individual });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.getIndividualProfile = async (req, res) => {
  try {
    const individual = await new Individual(req.user._id).individualProfile();
    return success(res, { individual });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.updateIndividualDetails = async (req, res) => {
  try {
    const newDetails = req.body;
    const oldDetails = req.user;
    const individual = await new Individual({
      newDetails,
      oldDetails,
    }).updateIndividualDetails();
    return success(res, { individual });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.uploadValidID = async (req, res) => {
  try {
    const originalname = req.files[0].originalname;
    const path = req.files[0].path;
    const individualId = req.user._id;
    await new Individual({ originalname, path, individualId }).uploadValidID();
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
    const individualId = req.user._id;
    const individual = await new Individual({
      originalname,
      path,
      individualId,
    }).uploadProfileImage();
    return success(res, { individual });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.forgotPassword = (req, res) => {
  new Individual(req.body)
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
  new Individual(req.body)
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

exports.deleteIndividual = async (req, res) => {
  try {
    const userId = req.user._id;
    const individual = await new Individual(userId).deleteIndividual();
    return success(res, { individual });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// create apartment
exports.createApartmentIndividual = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = req.body;
    const files = req.files;
    await new Individual({ files, data, userId }).createApartmentIndividual();
    return success(res, { message: "Apartment Created Successfully" });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

//get individual wallet
exports.getIndividualWallet = async (req, res) => {
  try {
    const individual = await new Individual(req.user._id).getIndividualWallet();
    return success(res, { individual });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// get individual apartments
exports.getIndividualApartment = async (req, res) => {
  try {
    const individual = await new Individual(
      req.user._id
    ).getIndividualApartment();
    return success(res, { individual });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// get apartment by id
exports.getIndividualApartmentById = async (req, res) => {
  try {
    const individual = await new Individual(
      req.params.id
    ).getSingleApartmentById();
    return success(res, { individual });
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
    const apartment = await new Individual({
      id,
      data,
      files,
    }).updateApartmentById();
    return success(res, { apartment });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// delete apartment
exports.deleteIndividualApartment = async (req, res) => {
  try {
    const id = req.params.id;
    const individual = await new Individual({
      id,
    }).deleteIndividualApartment();
    return success(res, { individual });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// individual can make apartment not available
exports.makeApartmentNotAvailable = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id;
    const individual = await new Individual({
      id,
      userId,
    }).makeApartmentNotAvailable();
    return success(res, { individual });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};
