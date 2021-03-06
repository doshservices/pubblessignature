/*eslint-disable*/
const { throwError } = require("../utils/handleErrors");
const { validateParameters } = require("../utils/util");
const EventSchema = require("../models/eventModel");

class Event {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  async createEvent() {
    const { isValid, messages } = validateParameters(
      [
        "eventName",
        "description",
        "eventLocation",
        "eventCost",
        "eventCountry",
        "eventState",
        "eventDate",
        "eventTime",
        "eventImages",
      ],
      this.data
    );
    if (!isValid) {
      throwError(messages);
    }
    return await new EventSchema(this.data).save();
  }
  // get all events
  async getAllEvents() {
    return await EventSchema.find()
      .sort({ createdAt: -1 })
      .orFail(() => throwError("No events found"));
  }

  // get event by id
  async getEventById() {
    return await EventSchema.findById(this.data).orFail(() =>
      throwError("No event found")
    );
  }

  // get event by location
  async getEventByLocation() {
    return await EventSchema.find({ eventLocation: this.data }).orFail(() =>
      throwError("No event found")
    );
  }

  // update event by id
  async updateEventById() {  
    const { newDetails, oldDetails } = this.data;
    console.log("i am runninhg", this.data)
    const updates = Object.keys(newDetails);
    console.log(update)
    const allowedUpdates = [
      "eventName",
      "description",
      "eventLocation",
      "eventCost",
      "eventCountry",
      "eventState",
      "eventDate",
      "eventTime",
      "eventImages",
    ];
    return await util.performUpdate(
      updates,
      newDetails,
      allowedUpdates,
      oldDetails
    );
  }

  // delete event by id
  async deleteEventById() {
    return await EventSchema.findByIdAndRemove(this.data).orFail(() =>
      throwError("No event found")
    );
  }
}

module.exports = Event;
