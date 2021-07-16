const hostRoute = require("../core/routerConfig");
const hostController = require("../controller/hostController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");
const upload = require("../core/multer");

hostRoute
  .route("/hosts")
  .post(hostController.signup)
  .get(authenticate, permit([USER_TYPE.HOST]), hostController.getHostProfile)
  .put(authenticate, permit([USER_TYPE.HOST]), hostController.updateHostDetails)
  .delete(authenticate, permit([USER_TYPE.HOST]), hostController.deleteHost);

hostRoute
  .route("/hosts/all")
  .get(
    authenticate,
    permit(Object.keys(ADMIN_ROLES)),
    hostController.getAllHost
  );

hostRoute.route("/hosts/login").post(hostController.login);

hostRoute.route("/hosts/forgot-password").post(hostController.forgotPassword);

hostRoute.route("/hosts/reset-password").post(hostController.resetPassword);

hostRoute
  .route("/hosts/upload-document")
  .put(
    authenticate,
    upload.imageUpload.any(),
    hostController.uploadCACDocument
  );

hostRoute
  .route("/hosts/upload-profile-image")
  .put(
    authenticate,
    upload.imageUpload.any(),
    hostController.uploadProfileImage
  );

hostRoute
  .route("/hosts/create-apartment")
  .post(
    authenticate,
    permit([USER_TYPE.HOST]),
    upload.manyImageUpload.array("picture", 10),
    hostController.createApartment
  );
module.exports = hostRoute;
