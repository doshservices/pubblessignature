const { error, success } = require("../utils/baseController");
const { generateAuthToken } = require("../core/userAuth");
const { logger } = require("../utils/logger");
const { registrationSuccessful } = require('../utils/sendgrid');
const Individual = require("../service/Individual");

exports.signup = async (req, res) => {
    try {
        const newIndividual = await new Individual(req.body).signup();
        const token = await generateAuthToken({ 
            userId: newIndividual._id, 
            isActive: newIndividual.isActive,
            userType: newIndividual.role,
        })
        registrationSuccessful(newIndividual.email, newIndividual.firstName);
        return success(res, { newIndividual, token });
    }catch(err) {
        logger.error("Error occurred at signup", err);
        return error(res, { code: err.code, message: err })
    }
}

exports.login = async (req, res) => {
   try {
        const individualDetails = await new Individual(req.body).login();
        const token = await generateAuthToken({ 
            userId: individualDetails._id,
            isActive: individualDetails.isActive, 
            userType: individualDetails.role,
          });
        return success(res, { individualDetails, token });
    } catch (err) {
        logger.error("Error occurred at login", err.message);
        return error(res, { code: err.code, message: err.message });
    }
}

exports.getAllIndividual = async (req, res) => {
    try {
        const individual = await Individual.getAllIndividual();
        return success(res, { individual });
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: err.code, message: err.message });
    }
}

exports.getIndividualProfile = async (req, res) => {
    try {
        const individual = await new Individual(req.user._id).individualProfile();
        return success(res, { individual });
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: err.code, message: err.message });
    }
}

exports.updateIndividualDetails = async (req, res) => {
    try {
        const newDetails = req.body;
        const oldDetails = req.user;
        const individual = await new Individual({newDetails, oldDetails}).updateIndividualDetails();
        return success(res, { individual });
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: err.code, message: err.message });
    }
};

exports.forgotPassword = (req, res) => {
    new Individual(req.body).forgotPassword()
        .then(data => success(res, {status: "success", success: true,
         message: "Token Has Been Sent To Your Email"}))
        .catch(err => error(res, { code: err.code, message: err.message }))
};

exports.resetPassword = (req, res) => {
    new Individual(req.body).resetPassword()
        .then(data => success(res, {status: "success", success: true,
         message: "Password Reset Successful"}))
        .catch(err => error(res, { code: err.code, message: err.message }))
}
