const userRoute = require('../core/routerConfig');
const userController = require('../controller/userController');
const { authenticate, permit } = require('../core/userAuth');
const { ADMIN_ROLES, USER_TYPE } = require('../utils/constants');

userRoute.route('/users')
    .post(userController.signup)
    .get(authenticate, permit([USER_TYPE.USER]), userController.getUserProfile)
    .put(authenticate, permit([USER_TYPE.USER]), userController.updateUserDetails);

userRoute.route('/users/all')
    .get(authenticate, permit(Object.keys(ADMIN_ROLES)), userController.getAllUser);

userRoute.route('/users/login')
    .post(userController.login);

userRoute.route('/users/reset-password')
    .post(userController.resetPassword);

userRoute.route('/users/forgot-password')
    .post(userController.forgotPassword);

module.exports = userRoute;
