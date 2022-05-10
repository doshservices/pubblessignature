/*eslint-disable*/
const apartmentRoute = require("../core/routerConfig");
const apartmentController = require("../controller/apartmentController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");

apartmentRoute
  .route("/apartments")
  .post(
    authenticate,
    permit([USER_TYPE.BUSINESS, USER_TYPE.INDIVIDUAL]),
    apartmentController.createApartment
  );

 // get all apartments 
 apartmentRoute
 .route("/apartments/all-apartments")
 .get(apartmentController.getAllApartment
 );

// get user apartment
apartmentRoute
  .route("/apartments/user")
  .get(
    authenticate,
    permit([USER_TYPE.BUSINESS, USER_TYPE.INDIVIDUAL]),
    apartmentController.getUserApartment
  );

// user can make apartment not available
apartmentRoute
  .route("/apartments/available/status")
  .put(
    authenticate,
    permit([USER_TYPE.BUSINESS, USER_TYPE.INDIVIDUAL]),
    apartmentController.makeApartmentNotAvailable
  );

//search apartment
apartmentRoute
.route("/apartments-one/search")
.get(authenticate, apartmentController.searchApartments)

// get all apartments near you
apartmentRoute
  .route("/apartments/near/you")
  .get(authenticate, apartmentController.getApartmentsNearYou);

//save apartment
  apartmentRoute
  .route("/apartments/save-apartment")
  .post(
    authenticate,
    permit(([USER_TYPE.USER])),
    apartmentController.saveApartment
  );

  //check apartment availability
apartmentRoute
.route("/apartments/is-available")
.post(
  authenticate,
 apartmentController.checkApartmentAvailability
);

 // get all booked apartments 
 apartmentRoute
 .route("/apartments/bookedapartments")
 .get(apartmentController.getAllBookedApartment
 );

// get all available apartments 
apartmentRoute
.route("/apartments/availableapartments")
.get(apartmentController.getAllAvailableApartment
);

 
 // get apartment by id
apartmentRoute
.route("/apartments/:id")
.get(authenticate, apartmentController.getApartmentById
);


// delete apartment by id
apartmentRoute
.route("/apartments/:id")
.delete(
  authenticate,
  permit([USER_TYPE.BUSINESS, USER_TYPE.INDIVIDUAL]),
  apartmentController.deleteApartment
);

// update apartment by id
apartmentRoute
.route("/apartments/:id")
.put(
  authenticate,
  permit([USER_TYPE.BUSINESS, USER_TYPE.INDIVIDUAL]),
  apartmentController.updateApartment
);




module.exports = apartmentRoute;
