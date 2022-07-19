/*eslint-disable*/
const { throwError } = require("../utils/handleErrors");
const { validateParameters } = require("../utils/util");
const EventSchema = require("../models/eventModel");
const util = require("../utils/util");

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
    const { eventId } = this.data;
    return await EventSchema.findById({ _id: this.data }).orFail(() =>
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
  // async updateEventById() {
  //   const { id } = this.data;
  //  const{ eventName,
  //       description,
  //       eventLocation,
  //       eventCost,
  //       eventCountry,
  //       eventState,
  //       eventDate,
  //       eventTime,
  //       eventImages} = this.data;
  //   const event = await EventSchema.findById(id).orFail(() =>
  //     throwError("Event Not Found", 404)
  //   );
  //   console.log(event);
  //   const newData = new EventSchema({
  //       eventName,
  //       description,
  //       eventLocation,
  //       eventCost,
  //       eventCountry,
  //       eventState,
  //       eventDate,
  //       eventTime,
  //       eventImages,
  //   });
  //   newData.save();
  //   return res.status(200).json({
  //     success: true,
  //     message: "successfully updated",
  //     newData: newData,
  //   });
    // // const updates = Object.keys(newDetails);
    // // const allowedUpdates = [
    // //   "eventName",
    // //   "description",
    // //   "eventLocation",
    // //   "eventCost",
    // //   "eventCountry",
    // //   "eventState",
    // //   "eventDate",
    // //   "eventTime",
    // //   "eventImages",
    // // ];
    // // return await util.performUpdate(
    // //   updates,
    // //   newDetails,
    // //   allowedUpdates,
    // //   event
    // // );
  //}
  async updateEventById() {
    const { newDetails, id, userId } = this.data;
    const event = await EventSchema.findById(id).orFail(() =>
      throwError("Apartment Not Found", 404)
    );

    const updates = Object.keys(newDetails);
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
      event
    );
  }

  // delete event by id
  async deleteEventById() {
    const { eventId } = this.data;
      console.log(this.data)
    return await EventSchema.findByIdAndRemove(this.data).orFail(() =>
      throwError("No event found")
    );
  }
}

module.exports = Event;
