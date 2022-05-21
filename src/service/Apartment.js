/*eslint-disable*/
const ApartmentSchema = require("../models/apartmentModel");
const BookingSchema = require("../models/bookingModel");
const UserSchema = require("../models/userModel");
const ApartmentWishlistSchema = require("../models/apartmentWishlistModel");
const { throwError } = require("../utils/handleErrors");
const { validateParameters } = require("../utils/util");
const util = require("../utils/util");
const { verifyBooking } = require("./Booking");

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
        "address",
        "apartmentCountry",
        "apartmentState",
        "price",
        "typeOfApartment",
        "facilities",
        "apartmentImages",
        "numberOfRooms",
        "apartmentInfo",
        "numberOfBedrooms",
        "numberOfToilets",
        "numberOfGuests",
      ],
      this.data
    );
    if (!isValid) {
      throwError(messages);
    }
    this.data["apartmentName"] = this.data["apartmentName"].toLowerCase();
    this.data["apartmentCountry"] = this.data["apartmentCountry"].toLowerCase();
    this.data["apartmentState"] = this.data["apartmentState"].toLowerCase();
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

  async getAllApartment() {
    return await ApartmentSchema.find({})
      .sort({ createdAt: -1 })
      .orFail(() => throwError("No Apartment Found", 404));
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
      "numberOfBedrooms",
      "numberOfToilets",
      "numberOfGuests",
    ];
    newDetails.apartmentName = newDetails.apartmentName.toLowerCase();
    newDetails.apartmentCountry = newDetails.apartmentCountry.toLowerCase();
    newDetails.apartmentState = newDetails.apartmentState.toLowerCase();
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

  // search apartments
  async searchApartments(query) {
    const {
      state,
      type,
      check_in,
      check_out,
      address,
      country,
      apartment_name,
    } = this.data;

    if (!apartment_name) {
      let query = {
        address: address,
        apartmentCountry: country.toLowerCase(),
        apartmentState: state.toLowerCase(),
        typeOfApartment: type.toLowerCase(),
        isAvailable: true,
      };
    }

    if (!address) {
      let query = {
        apartmentName: apartment_name.toLowerCase(),
        apartmentCountry: country.toLowerCase(),
        apartmentState: state.toLowerCase(),
        typeOfApartment: type.toLowerCase(),
        isAvailable: true,
      };
    }

    if (!country) {
      let query = {
        apartmentName: apartment_name.toLowerCase(),
        address: address,
        apartmentState: state.toLowerCase(),
        typeOfApartment: type.toLowerCase(),
        isAvailable: true,
      };
    }

    if (!state) {
      let query = {
        apartmentName: apartment_name.toLowerCase(),
        address: address,
        apartmentCountry: country.toLowerCase(),
        typeOfApartment: type.toLowerCase(),
        isAvailable: true,
      };
    }

    if (!type) {
      let query = {
        apartmentName: apartment_name.toLowerCase(),
        address: address,
        apartmentCountry: country.toLowerCase(),
        apartmentState: state.toLowerCase(),
        isAvailable: true,
      };
    }

    return ApartmentSchema.find(query);
  }

  // get a all apartment near you based on location state and country
  async getApartmentsNearYou() {
    const { apartmentCountry, apartmentState } = this.data;
    return await ApartmentSchema.find({
      apartmentCountry,
      apartmentState,
    }).orFail(() => throwError("No Apartment Found", 404));
  }

  //wishlist apartment
  async saveApartment() {
    const { apartmentId, userId } = this.data;
    const check = ApartmentWishlistSchema.find({ apartmentId, userId });
    if (check) {
      throwError("Apartment already saved for later");
    } else {
      return ApartmentWishlistSchema(this.data).save();
    }
  }

  //check apartment availability
  async checkApartmentAvailability() {
    const { apartmentId } = this.data;
    const apartmentBooking = await BookingSchema.findOne({
      apartmentId: apartmentId,
    });
    if (!apartmentBooking.isBooked) {
      throwError("Apartment already booked");
      console.log(apartmentBooking.isBooked);
    } else {
      return "Apartment is available to be booked";
    }
  }

  //get all Booked apartments
  async getAllBookedApartment() {
    const bookedApartment = await ApartmentSchema.find({ isAvailable: false });
    return bookedApartment;
  }

    //get all Available apartments
    async getAllAvailableApartment() {
      const availableApartment = await ApartmentSchema.find({ isAvailable: true });
      return availableApartment;
    }
}

module.exports = Apartment;
