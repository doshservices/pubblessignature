/*eslint-disable*/
const notificationRoute = require("../core/routerConfig");
const notificationController = require("../controller/notificationController");
const { authenticate, permit } = require("../core/userAuth");
const {ADMIN_ROLES, USER_TYPE } = require("../utils/constants");

notificationRoute
  .route("/notifications")
  .get(
    authenticate,
    permit(Object.keys(ADMIN_ROLES)),
    notificationController.getAllUserNotifications
  );

notificationRoute
  .route("/notifications/user/:id")
  .get(
    authenticate,
    permit(Object.keys(USER_TYPE)),
    notificationController.getUserNotifications
  );

notificationRoute
  .route("/notifications/:id")
  .get(
    authenticate,
    permit(Object.keys(USER_TYPE)),
    notificationController.getNotification
  );

// delete notification
notificationRoute
  .route("/notifications/:id")
  .delete(
    authenticate,
    permit(Object.keys(USER_TYPE)),
    notificationController.deleteNotification
  );

// get all business and individual notifications
notificationRoute
  .route("/notifications/business/individual")
  .get(
    authenticate,
    permit(Object.keys(USER_TYPE)),
    notificationController.getAllBusinessAndIndividualNotifications
  );

module.exports = notificationRoute;
