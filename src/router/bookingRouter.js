
/*eslint-disable*/
const bookingRoute = require("../core/routerConfig");
const bookingController = require("../controller/bookingController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");

// create booking
bookingRoute
  .route("/bookings/create-booking")
  .post(
    authenticate,
    permit([USER_TYPE.USER]),
    bookingController.createBooking
  );

// get all bookings
bookingRoute
  .route("/bookings/all-bookings")
  .get(authenticate,permit([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN]),bookingController.getAllBookings);

// get booking by userId
bookingRoute
  .route("/bookings/booking-by-userId")
  .get(
    authenticate,
    permit([USER_TYPE.USER]),
    bookingController.getBookingsByUserId
  );

bookingRoute
  .route("/bookings/busines-individual-booking")
  .get(
    authenticate,
    permit(Object.keys(USER_TYPE)),
    bookingController.getAllBookingsByBusinessOrIndividual
  );

// pay for pending booking
bookingRoute
  .route("/bookings/pay-for/booking")
  .get(
    authenticate,
    permit([USER_TYPE.USER]),
    bookingController.payForPendingBooking
  );

// verify booking payment
bookingRoute
  .route("/bookings/verify-payment")
  .get(
    authenticate,
    permit([USER_TYPE.USER]),
    bookingController.verifyBookingPayment
  );


  
// get booking by id
bookingRoute
.route("/bookings/:bookingId")
.get(authenticate, bookingController.getBookingById);

// get booking by apartmentId
bookingRoute
.route("/bookings/booking/:apartmentId")
.get(authenticate, bookingController.getBookingsByApartmentId);

// cancel booking
bookingRoute
.route("/bookings/cancel-booking/:bookingId")
.get(authenticate, permit([USER_TYPE.USER]), bookingController.cancelBooking);


module.exports = bookingRoute;
