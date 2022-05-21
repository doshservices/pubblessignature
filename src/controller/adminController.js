const { error, success } = require("../utils/baseController");
const { generateAuthToken } = require("../core/userAuth");
const { logger } = require("../utils/logger");
const { ADMIN_ROLES } = require("../utils/constants");
const Admin = require("../service/Admin");


exports.getAllIndividualHost = async (req, res) => {
    try {
      const individualHost = await new Admin(req.params).getAllIndividualHost();
      console.log("funmi",req.params);
      return success(res, { individualHost });
    } catch (err) {
        console.log(err)
      logger.error("Unable to complete request", err);
      return error(res, { code: err.code, message: err.message });
    }
  };
  
exports.getAllBusinessHost = async (req, res) => {
  try {
    const businessHost = await new Admin( req.params ).getAllBusinessHost();
    return success(res, { businessHost });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.verifyHost = async (req, res) => {
    try {
      const verifyHost = await new Admin(req.user._id).verifyHost();
      return success(res, { status: success, verifyHost });
    } catch (err) {
      logger.error("Unable to verfiy host", err);
      return error(res, { code: err.code, message: err.message });
    }
  };

