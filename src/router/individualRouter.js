const individualRoute = require('../core/routerConfig');
const individualController = require('../controller/individualController');
const { authenticate, permit } = require('../core/userAuth');
const { ADMIN_ROLES, USER_TYPE } = require('../utils/constants');

individualRoute.route('/individuals')
    .post(individualController.signup)
    .get(authenticate, permit([USER_TYPE.INDIVIDUAL]), individualController.getIndividualProfile)
    .put(authenticate, permit([USER_TYPE.INDIVIDUAL]), individualController.updateIndividualDetails);

individualRoute.route('/individuals/all')
    .get(authenticate, permit([USER_TYPE.INDIVIDUAL]), individualController.getAllIndividual);

individualRoute.route('/individuals/login')
    .post(individualController.login);

individualRoute.route('/individuals/reset-password')
    .post(individualController.resetPassword);

individualRoute.route('/individuals/forgot-password')
    .post(individualController.forgotPassword);

module.exports = individualRoute;
