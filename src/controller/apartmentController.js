/*eslint-disable*/
const { error, success } = require("../utils/baseController");
const { logger } = require("../utils/logger");
const Apartment = require("../service/Apartment");
const User = require("../service/User");
const { err_code } = require("redis/lib/utils");

// create apartment
exports.createApartment = async (req, res) => {
  try {
    req.body["userId"] = req.user._id;
    await new Apartment(req.body).createApartment();
    return success(res, { message: "Apartment Created Successfully" });
  } catch (err) {
  
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.getUserApartment = async (req, res) => {
  try {
    const apartments = await new Apartment(req.user._id).getUserApartment();
    return success(res, { apartments });
  } catch (err) {
    logger.error("Unable to get user apartment", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.getAllApartment = async (req, res) => { 
  try {
    const apartments = await new Apartment().getAllApartment();
    return success(res,'success' , apartments);
  } catch (err) {
    logger.error("Unable to get all apartments", err);
    return error(res, { code: err.code, message: err.message });
  }
};
// get apartment by id
exports.getApartmentById = async (req, res) => {
  try {
    const apartment = await new Apartment(
      req.params.id
    ).getSingleApartmentById();
    return success(res, { apartment });
  } catch (err) {
    logger.error("Unable to get apartment", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.updateApartment = async (req, res) => {
  try {
    const id = req.params.id;
    const newDetails = req.body;
    const userId = req.user._id;
    const updatedApartment = await new Apartment({
      newDetails,
      id,
      userId,
    }).updateApartment();
    return success(res, { updatedApartment });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// delete apartment
exports.deleteApartment = async (req, res) => {
  try {
    const userId = req.user._id;
    const id = req.params.id;
    const apartment = await new Apartment({ id, userId }).deleteApartment();
    return success(res, { apartment });
  } catch (err) {
    logger.error("Unable to delete apartment", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// make apartment not available
exports.makeApartmentNotAvailable = async (req, res) => {
  try {
    const apartment = await new Apartment(req.body).makeApartmentNotAvailable();
    return success(res, { apartment });
  } catch (err) {
    logger.error("Unable to to set apartment to available", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// search apartments
exports.searchApartments = async (req, res) => {
  try {
    console.log('apartmentSearch  ',req.params)
    const apartments = await new Apartment(
      req.query.apartmentSearch
    ).searchApartments();
    return success(res, { apartments });
  } catch (err) {
    logger.error("Unable to get all apartments", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// all apartment near you by location state and city
exports.getApartmentsNearYou = async (req, res) => {
  try {
    const user = await new User(req.user._id).userProfile();
    const apartmentCountry = user.country.toLowerCase() || "nigeria";
    console.log(user.country);
    const apartmentState = user.state.toLowerCase() || "lagos";
    console.log(user.state)
    const apartments = await new Apartment({
      apartmentCountry,
      apartmentState,
    }).getApartmentsNearYou();
    return success(res, { apartments });
  } catch (err) {
    console.log(err)
    logger.error("Unable to get all apartments", err);
    return error(res, { code: err.code, message: err.message });
  }
};
