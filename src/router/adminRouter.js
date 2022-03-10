const userRoute = require("../core/routerConfig");
const adminController = require("../controller/adminController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES} = require("../utils/constants");
const upload = require("../core/multer");

userRoute
  .route("/users/admin")
  .post(adminController.signup)
  .get(authenticate, adminController.getUserProfile)
  .put(authenticate, adminController.updateUserDetails)
  .delete(authenticate, userController.deleteUser);

userRoute
  .route("/users/all")
  .get(
    authenticate,
    permit(Object.keys(ADMIN_ROLES)),
    userController.getAllUser
  );

userRoute.route("/users/adminlogin").post(adminController.login);

userRoute.route("/users/reset-password").post(adminController.resetPassword);

userRoute.route("/users/forgot-password").post(adminController.forgotPassword);

userRoute
  .route("/users/upload-profile-image")
  .put(
    authenticate,
    upload.imageUpload.any(),
    adminController.uploadProfileImage
  );

// // get user wallet
// userRoute
//   .route("/users/wallet")
//   .get(authenticate, userController.getUserWallet);

// get all active apartments
userRoute
  .route("/users/apartments")
  .get(authenticate, adminController.getActiveApartment);

// get user by id
userRoute.route("/users/:id").get(authenticate, adminController.getUser);

module.exports = userRoute;
