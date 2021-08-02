const userRoute = require("../core/routerConfig");
const userController = require("../controller/userController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");
const upload = require("../core/multer");

userRoute
  .route("/users")
  .post(userController.signup)
  .get(authenticate, permit([USER_TYPE.USER]), userController.getUserProfile)
  .put(authenticate, permit([USER_TYPE.USER]), userController.updateUserDetails)
  .delete(authenticate, permit([USER_TYPE.USER]), userController.deleteUser);

userRoute
  .route("/users/all")
  .get(
    authenticate,
    permit(Object.keys(ADMIN_ROLES)),
    userController.getAllUser
  );

userRoute.route("/users/login").post(userController.login);

userRoute.route("/users/reset-password").post(userController.resetPassword);

userRoute.route("/users/forgot-password").post(userController.forgotPassword);

userRoute
  .route("/users/upload-profile-image")
  .put(
    authenticate,
    upload.imageUpload.any(),
    userController.uploadProfileImage
  );

// get user wallet
userRoute
  .route("/users/wallet")
  .get(authenticate, permit([USER_TYPE.USER]), userController.getUserWallet);

// get all active apartments
userRoute
  .route("/users/apartments")
  .get(
    authenticate,
    permit([USER_TYPE.USER]),
    userController.getActiveApartment
  );

module.exports = userRoute;
