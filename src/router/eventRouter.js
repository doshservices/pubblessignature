const eventRoute = require("../core/routerConfig");
const eventController = require("../controller/eventController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");
const upload = require("../core/multer");

// create event
eventRoute
  .route("/events/create-event")
  .post(
    authenticate,
    permit([USER_TYPE.HOST]),
    upload.manyImageUpload.array("picture", 10),
    eventController.createEvent
  );

// get event by id
eventRoute
  .route("/events/:id")
  .get(authenticate, permit([USER_TYPE.HOST]), eventController.getEventById);

// get all events
eventRoute
  .route("/events")
  .get(authenticate, permit([USER_TYPE.HOST]), eventController.getAllEvents);

// get event by location
eventRoute
  .route("/events/location")
  .get(
    authenticate,
    permit([USER_TYPE.HOST]),
    eventController.getEventByLocation
  );

// update event by id
eventRoute
  .route("/events/:id")
  .put(
    authenticate,
    permit([USER_TYPE.HOST]),
    upload.manyImageUpload.array("picture", 10),
    eventController.updateEventById
  );

// delete event by id
eventRoute
  .route("/events/:eventId")
  .delete(
    authenticate,
    permit([USER_TYPE.HOST]),
    eventController.deleteEventById
  );

module.exports = eventRoute;
