/*eslint-disable*/
const flutterRoute = require("../core/routerConfig");
const Flutter = require("../integration/flutterwave")


flutterRoute
.route('/flutterResponse')
.post(Flutter.flutterResponse);

flutterRoute
.route('/flutterWalletResponse')
.post(Flutter.flutterWalletResponse);


module.exports = flutterRoute