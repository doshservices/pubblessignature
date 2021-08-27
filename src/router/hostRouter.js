const hostRoute = require("../core/routerConfig");
const hostController = require("../controller/hostController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");
const upload = require("../core/multer");

hostRoute
  .route("/hosts")
  .post(upload.imageUpload.any(), hostController.signup)
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

// get host wallet
hostRoute
  .route("/hosts/wallet")
  .get(authenticate, permit([USER_TYPE.HOST]), hostController.getHostWallet);

// get host apartments
hostRoute
  .route("/hosts/apartments")
  .get(
    authenticate,
    permit([USER_TYPE.HOST]),
    hostController.getHostApartments
  );

// get apartments by id
hostRoute
  .route("/hosts/apartments/:id")
  .get(authenticate, permit([USER_TYPE.HOST]), hostController.getApartmentById);

// delete apartment by id
hostRoute
  .route("/hosts/apartments/:id")
  .delete(
    authenticate,
    permit([USER_TYPE.HOST]),
    hostController.deleteApartment
  );

// update apartment by id
hostRoute
  .route("/hosts/apartments/:id")
  .put(
    authenticate,
    permit([USER_TYPE.HOST]),
    upload.manyImageUpload.array("picture", 10),
    hostController.updateApartmentById
  );

// host can make apartment not available
hostRoute
  .route("/hosts/apartments/:id/available")
  .get(
    authenticate,
    permit([USER_TYPE.HOST]),
    hostController.makeApartmentNotAvailable
  );

module.exports = hostRoute;
