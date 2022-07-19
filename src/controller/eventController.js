const { error, success } = require("../utils/baseController");
const { logger } = require("../utils/logger");
const Event = require("../service/Event");

// create event
exports.createEvent = async (req, res) => {
  try {
    await new Event(req.body).createEvent();
    return success(res, { message: "Event Created Successfully" });
  } catch (err) {
    logger.error("Unable to create event", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// get event
exports.getEventById = async (req, res) => {
  try {
    const event = await new Event(req.query.eventId).getEventById();
    return success(res, { event });
  } catch (err) {
    logger.error("Unable to complete event request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await new Event().getAllEvents();
    return success(res, events);
  } catch (err) {
    logger.error("Unable to complete event request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// get event by location
exports.getEventByLocation = async (req, res) => {
  try {
    const events = await new Event(req.params.location).getEventByLocation();
    return success(res, events);
  } catch (err) {
    logger.error("Unable to complete event request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// update event by id
exports.updateEventById = async (req, res) => {
  try {
    const id = req.query.id;
    const newDetails = req.body;
    const userId = req.user._id;
    const event = await new Event({ newDetails, id,userId}).updateEventById();
    return success(res, { event });
  } catch (err) {
    logger.error("Unable to complete event update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// delete event by id
exports.deleteEventById = async (req, res) => {
  const eventId = req.query.id;
  try {
    await new Event(eventId).deleteEventById();
    return success(res, { message: "Event Deleted Successfully" });
  } catch (err) {
    logger.error("Unable to complete event delete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};
