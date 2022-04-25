const flutterRoute = require("../core/routerConfig");
const {flutterPaymentCallback, flutterResponse} = require("../integration/flutterwave")


flutterRoute
.route('/verifyFlutterPayment')
.get(flutterPaymentCallback);

flutterRoute
.route('/flutterResponse')
.get(flutterResponse);


module.exports = flutterRoute