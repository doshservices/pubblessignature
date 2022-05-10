const flutterRoute = require("../core/routerConfig");
const Flutter = require("../integration/flutterwave")


flutterRoute
.route('/verifyFlutterPayment')
.get(Flutter.flutterPaymentCallback);

flutterRoute
.route('/flutterResponse')
.get(Flutter.flutterResponse);


module.exports = flutterRoute