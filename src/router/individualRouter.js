const individualRoute = require("../core/routerConfig");
const individualController = require("../controller/individualController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");
const upload = require("../core/multer");

individualRoute
  .route("/individuals")
  .post(individualController.signup)
  .get(
    authenticate,
    permit([USER_TYPE.INDIVIDUAL]),
    individualController.getIndividualProfile
  )
  .put(
    authenticate,
    permit([USER_TYPE.INDIVIDUAL]),
    individualController.updateIndividualDetails
  )
  .delete(
    authenticate,
    permit([USER_TYPE.INDIVIDUAL]),
    individualController.deleteIndividual
  );

individualRoute
  .route("/individuals/all")
  .get(
    authenticate,
    permit([USER_TYPE.INDIVIDUAL]),
    individualController.getAllIndividual
  );

individualRoute.route("/individuals/login").post(individualController.login);

individualRoute
  .route("/individuals/reset-password")
  .post(individualController.resetPassword);

individualRoute
  .route("/individuals/forgot-password")
  .post(individualController.forgotPassword);

individualRoute
  .route("/individuals/upload-document")
  .put(
    authenticate,
    upload.imageUpload.any(),
    individualController.uploadValidID
  );

individualRoute
  .route("/individuals/upload-profile-image")
  .put(
    authenticate,
    upload.imageUpload.any(),
    individualController.uploadProfileImage
  );

individualRoute
  .route("/individuals/create-apartment")
  .post(
    authenticate,
    permit([USER_TYPE.INDIVIDUAL]),
    upload.manyImageUpload.array("picture", 10),
    individualController.createApartmentIndividual
  );

// get individual wallet
individualRoute
  .route("/individuals/wallet")
  .get(
    authenticate,
    permit([USER_TYPE.INDIVIDUAL]),
    individualController.getIndividualWallet
  );

// get individual apartments
individualRoute
  .route("/individuals/apartments")
  .get(
    authenticate,
    permit([USER_TYPE.INDIVIDUAL]),
    individualController.getIndividualApartment
  );

// get apartment by id
individualRoute
  .route("/individuals/apartments/:id")
  .get(
    authenticate,
    permit([USER_TYPE.INDIVIDUAL]),
    individualController.getIndividualApartmentById
  );

// delete apartment by id
individualRoute
  .route("/individuals/apartments/:id")
  .delete(
    authenticate,
    permit([USER_TYPE.INDIVIDUAL]),
    individualController.deleteIndividualApartment
  );

module.exports = individualRoute;
