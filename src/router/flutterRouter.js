const flutterRoute = require("../core/routerConfig");
const {flutterPaymentCallback} = require("../integration/flutterwave")
console.log(flutterPaymentCallback)

flutterRoute
.route('/verifyFlutterPayment')
.get(flutterPaymentCallback);



module.exports = flutterRoute