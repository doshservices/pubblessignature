/*eslint-disable*/
const flutterRoute = require("../core/routerConfig");
const { initializePayment } = require("../integration/flutterwave");
// const { authenticate, permit } = require("../core/userAuth");
// const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");

flutterRoute
  .route("/flutterpay")
  .post(initializePayment)  
 

  module.exports = flutterRoute;