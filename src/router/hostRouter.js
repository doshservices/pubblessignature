const hostRoute = require('../core/routerConfig');
const hostController = require('../controller/hostController');
const { authenticate, permit } = require('../core/userAuth');
const { ADMIN_ROLES, USER_TYPE } = require('../utils/constants');

hostRoute.route('/hosts')
    .post(hostController.signup)
    .get(authenticate, permit([USER_TYPE.HOST]), hostController.getHostProfile)
    .put(authenticate, permit([USER_TYPE.HOST]), hostController.updateHostDetails);

hostRoute.route('/hosts/all')
    .get(authenticate, permit(Object.keys(ADMIN_ROLES)), hostController.getAllHost);

hostRoute.route('/hosts/login')
    .post(hostController.login);

hostRoute.route('/hosts/forgot-password')
    .post(hostController.forgotPassword);

hostRoute.route('/hosts/reset-password')
    .post(hostController.resetPassword);

module.exports = hostRoute;
