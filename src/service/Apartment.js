const ApartmentSchema = require("../models/apartmentModel");
const { throwError } = require("../utils/handleErrors");
const { validateParameters } = require("../utils/util");
const util = require("../utils/util");

class Apartment {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  async createApartment() {
    const { isValid, messages } = validateParameters(
      [
        "userId",
        "apartmentName",
        "apartmentName",
        "address",
        "apartmentCountry",
        "apartmentState",
        "price",
        "typeOfApartment",
        "facilities",
        "apartmentImages",
        "numberOfRooms",
        "apartmentInfo",
      ],
      this.data
    );
    if (!isValid) {
      throwError(messages);
    }
    return await new ApartmentSchema(this.data).save();
  }

  async getUserApartment() {
    return await ApartmentSchema.find({ userId: this.data }).orFail(() =>
      throwError("No Apartment Found", 404)
    );
  }

  async getSingleApartmentById() {
    return await ApartmentSchema.findById(this.data).orFail(() =>
      throwError("Apartment Not Found", 404)
    );
  }

  async deleteApartment() {
    const { id, userId } = this.data;
    const apartment = await ApartmentSchema.findById(id).orFail(() =>
      throwError("Apartment Not Found", 404)
    );
    if (apartment.userId.toString() !== userId.toString()) {
      throwError("You are not authorized to delete this apartment");
    }
    return await apartment.remove();
  }

  async updateApartment() {
    const { newDetails, id, userId } = this.data;
    const apartment = await ApartmentSchema.findById(id).orFail(() =>
      throwError("Apartment Not Found", 404)
    );
    if (apartment.userId.toString() !== userId.toString()) {
      throwError("You are not authorized to update this apartment");
    }
    const updates = Object.keys(newDetails);
    const allowedUpdates = [
      "apartmentName",
      "apartmentName",
      "address",
      "apartmentCountry",
      "apartmentState",
      "price",
      "typeOfApartment",
      "facilities",
      "apartmentImages",
      "numberOfRooms",
      "apartmentInfo",
    ];
    return await util.performUpdate(
      updates,
      newDetails,
      allowedUpdates,
      apartment
    );
  }

  async makeApartmentNotAvailable() {
    return await ApartmentSchema.findByIdAndUpdate(
      this.data.id,
      { isAvailable: this.data.isAvailable },
      { new: true }
    );
  }

  // get all apartments
  async getAllApartments() {
    let query = { isAvailable: true };
    if (this.data.apartmentSearch) {
      const { apartmentSearch } = this.data;
      query.$or = [
        { apartmentName: { $regex: apartmentSearch, $options: "i" } },
        { address: { $regex: apartmentSearch, $options: "i" } },
        { apartmentCountry: { $regex: apartmentSearch, $options: "i" } },
        { apartmentState: { $regex: apartmentSearch, $options: "i" } },
        { price: { $regex: apartmentSearch, $options: "i" } },
        { typeOfApartment: { $regex: apartmentSearch, $options: "i" } },
        { facilities: { $regex: apartmentSearch, $options: "i" } },
        { numberOfRooms: { $regex: apartmentSearch, $options: "i" } },
      ];
    }
    return await ApartmentSchema.find(query);
  }
}

module.exports = Apartment;
