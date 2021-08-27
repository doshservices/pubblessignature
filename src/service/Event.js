const cloudinary = require("cloudinary");
const { throwError } = require("../utils/handleErrors");
const bcrypt = require("bcrypt");
const util = require("../utils/util");
const cloud = require("../utils/cloudinaryConfig");
const { validateParameters } = require("../utils/util");
const EventSchema = require("../models/eventModel");

class Event {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  async createEvent() {
    const { data, files } = this.data;
    let pictureFiles = files;
    if (!pictureFiles) throwError("No picture attached");
    //map through images and create a promise array using cloudinary upload function
    let multiplePicturePromise = pictureFiles.map((picture) =>
      cloudinary.v2.uploader.upload(picture.path)
    );
    let imageResponses = await Promise.all(multiplePicturePromise);
    // map image responses to array and return urls
    let imageUrls = imageResponses.map((response) => response.url);
    const {
      eventName,
      description,
      eventCountry,
      eventState,
      eventCost,
      eventLocation,
    } = data;
    const newEvent = new EventSchema({
      eventName,
      description,
      eventCountry,
      eventState,
      eventCost,
      eventLocation,
      eventImages: imageUrls,
    });
    await newEvent.save();
    return newEvent;
  }
  // get all events
  async getAllEvents() {
    const events = await EventSchema.find({});
    return events;
  }

  // get event by id
  async getEventById() {
    const id = this.data;
    const event = await EventSchema.findById(id);
    return event;
  }

  // get event by location
  async getEventByLocation() {
    const location = this.data;
    const events = await EventSchema.find({ eventLocation: location });
    return events;
  }

  // update event by id with images
  async updateEventById() {
    const { id, data, files } = this.data;
    let pictureFiles = files;
    if (!pictureFiles) throwError("No picture attached");
    //map through images and create a promise array using cloudinary uplo
    let multiplePicturePromise = pictureFiles.map((picture) =>
      cloudinary.v2.uploader.upload(picture.path)
    );
    let imageResponses = await Promise.all(multiplePicturePromise);
    // map image responses to array and return urls
    let imageUrls = imageResponses.map((response) => response.url);
    const updateEvent = await EventSchema.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          eventImages: imageUrls,
          eventName: data.eventName,
          eventLocation: data.eventLocation,
          eventCountry: data.eventCountry,
          eventState: data.eventState,
          eventCost: data.eventCost,
        },
      },
      { new: true }
    );
    return updateEvent;
  }

  // delete event by id
  async deleteEventById() {
    const event = await EventSchema.findByIdAndRemove({ _id: this.data });
    return event;
  }
}

module.exports = Event;
