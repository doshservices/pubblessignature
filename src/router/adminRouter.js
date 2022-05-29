/*eslint-disable*/
const adminRoute = require("../core/routerConfig");
const adminController = require("../controller/adminController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");
const upload = require("../core/multer");

adminRoute
  .route("/admin/allbusiness")
  .get(
    authenticate,
    permit(Object.keys(ADMIN_ROLES)),
    adminController.getAllBusinessHost
  );

  adminRoute
  .route("/admin/allindividual")
  .get(
    authenticate,
    permit(Object.keys(ADMIN_ROLES)),
    adminController.getAllIndividualHost
  );

  adminRoute
  .route("/admin/verifyhost")
  .get(
    authenticate,
    permit(Object.keys(ADMIN_ROLES)),
    adminController.verifyHost
  );

  adminRoute
  .route("/admin/suspendhost")
  .get(
    authenticate,
    permit(Object.keys(ADMIN_ROLES)),
    adminController.suspendHost
  );

  module.exports = adminRoute;