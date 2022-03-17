/*eslint-disable*/
const flutterpayment = require("../integration/flutterwave");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPES } = require("../utils/constants");

flutterpayment
.route("/flutterpayment/chargecard")
.post(authenticate, flutterpayment.chargecard)