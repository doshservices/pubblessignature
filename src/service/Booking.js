/*eslint-disable*/
const moment = require("moment");
const axios = require("axios");
const { throwError } = require("../utils/handleErrors");
const { validateParameters } = require("../utils/util");
const BookingSchema = require("../models/bookingModel");
const FlutterSchema = require("../models/flutterModel");

const {
  BOOKING_STATUS,
  NOTIFICATION_TYPE,
  TRANSACTION_TYPE,
  PAYMENT_STATUS,
} = require("../utils/constants");
const Notification = require("./Notification");
const Transaction = require("./Transaction");
const Wallet = require("./Wallet");
const {
  initiatePayment,
  verifyPayment,
} = require("../integration/paystackClient");
const { initiatePaymentFlutterwave } = require("../integration/flutterwave");
const { bookingEmail } = require("../utils/sendgrid");

class Booking {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  async createBooking() {
    const { isValid, messages } = validateParameters(
      [
        "apartmentOwnerId",
        "apartmentId",
        "checkInDate",
        "checkOutDate",
        "bookingAmount",
        "numberOfGuests",
        "bookingUserId",
      ],
      this.data
    );
    if (!isValid) {
      throwError(messages);
    }
    if (
      moment(this.data.checkOutDate, "YYYY-MM-DD").isBefore(
        moment(this.data.checkInDate, "YYYY-MM-DD")
      )
    ) {
      throwError("CheckOutDate must be greater than CheckInDate");
    }
    const listDate = [];
    const checkInDateList = moment(this.data.checkInDate, "YYYY-MM-DD");
    const checkOutDateList = moment(this.data.checkOutDate, "YYYY-MM-DD");
    while (checkInDateList.isBefore(checkOutDateList)) {
      listDate.push(checkInDateList.format("YYYY-MM-DD"));
      checkInDateList.add(1, "days");
    }
    this.data["dateList"] = listDate;
    const checkInDate = moment(this.data.checkInDate);
    const checkOutDate = moment(this.data.checkOutDate);
    const diff = checkOutDate.diff(checkInDate, "days");
    if (diff < 1) {
      throwError("CheckOutDate must be greater than CheckInDate");
    }
    this.data["bookingAmount"] = diff * this.data.bookingAmount;
    return await new BookingSchema(this.data).save();
  }
  // all bookings
  async getAllBookings() {
    return await BookingSchema.find({})
      .sort({ createdAt: -1 })
      .populate(
        "apartmentId apartmentOwnerId bookingUserId",
        "apartmentName apartmentImages fullName companyName"
      )
      .orFail(() => throwError("No Bookings Found", 404));
  }
  // all bookings by user
  async getAllBookingsByUser() {
    return await BookingSchema.find({ bookingUserId: this.data })
      .sort({ createdAt: -1 })
      .populate(
        "apartmentId apartmentOwnerId bookingUserId",
        "apartmentName apartmentImages fullName companyName"
      )
      .orFail(() => throwError("No Bookings Found", 404));
  }

  async getAllBookingsByBusinessOrIndividual() {
    return await BookingSchema.find({ apartmentOwnerId: this.data })
      .sort({ createdAt: -1 })
      .populate(
        "apartmentId apartmentOwnerId bookingUserId",
        "apartmentName apartmentImages fullName companyName"
      )
      .orFail(() => throwError("No Bookings Found", 404));
  }

  // get booking by id
  async getBookingById() {
    return await BookingSchema.findById(this.data)
      .populate(
        "apartmentId apartmentOwnerId bookingUserId",
        "apartmentName apartmentImages fullName companyName"
      )
      .orFail(() => throwError("No Booking Found", 404));
  }

  // get booking by apartment id
  async getBookingByApartmentId() {
    const booking = await BookingSchema.find({
      apartmentId: this.data,
      isBooked: false,
      bookingStatus: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
      checkOutDate: { $gte: new Date() },
    });
    const bookingDateList = booking.map((booking) => {
      return booking.dateList;
    });
    const bookingDateListFlatten = bookingDateList.flat();
    const bookingDateListUnique = [...new Set(bookingDateListFlatten)];
    return bookingDateListUnique;
  }

  // cancel booking
  async cancelBooking() {
    const booking = await BookingSchema.findById(this.data).populate(
      "apartmentId bookingUserId",
      "apartmentName profilePicture apartmentImages _id"
    );
    if (!booking) {
      throwError("No Booking Found", 404);
    }
    if (booking.bookingStatus !== BOOKING_STATUS.PENDING) {
      throwError("Booking is already confirmed or cancelled", 400);
    }
    booking.bookingStatus = BOOKING_STATUS.CANCELLED;
    const notificationDetails = {
      bookingUserId: booking.bookingUserId,
      bookingId: booking._id,
      message: `${booking.apartmentId.apartmentName} booking has been cancelled`,
      image: booking.apartmentId.apartmentImages[0],
      price: booking.bookingAmount,
      apartmentId: booking.apartmentId._id,
      notificationType: NOTIFICATION_TYPE.BOOKING_CANCELLATION,
    };
    Notification.createNotification(notificationDetails);
    return await booking.save();
  }

  // pay for pending booking
  async payForPendingBooking() {
    const { bookingId, paymentMethod, userId } = this.data;
    const booking = await BookingSchema.findById(bookingId).populate(
      "apartmentId bookingUserId apartmentOwnerId",
      "apartmentName profilePicture apartmentImages _id userId email fullName companyName"
    );
    if (!booking) {
      throwError("No Booking Found", 404);
    }
    if (booking.bookingStatus !== BOOKING_STATUS.PENDING) {
      throwError("Booking is already confirmed or cancelled", 400);
    }
    if (paymentMethod === "WALLET") {
      const wallet = await new Wallet(userId).getUserWallet();
      if (wallet.availableBalance < booking.bookingAmount) {
        throwError("Insufficient balance in wallet", 400);
      }
      const transactionDetails = {
        userId: booking.bookingUserId,
        amount: booking.bookingAmount,
        reason: "Booking payment",
        type: TRANSACTION_TYPE.WITHDRAWAL,
        reference: "WD" + Date.now().valueOf() + "REF",
        paymentDate: new Date(),
      };
      await Transaction.createTransaction(transactionDetails);
      booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
      booking.paymentMethod = paymentMethod;
      booking.isBooked = true;
      const notificationDetailsUser = {
        bookingUserId: booking.bookingUserId,
        bookingId: booking._id,
        message: `${booking.apartmentId.apartmentName} booking has been confirmed`,
        image: booking.apartmentId.apartmentImages[0],
        price: booking.bookingAmount,
        apartmentId: booking.apartmentId._id,
        notificationType: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
      };
      Notification.createNotification(notificationDetailsUser);
      const notificationDetailsBusinessAndIndividual = {
        apartmentOwnerId: booking.apartmentId.userId,
        bookingId: booking._id,
        message: `${booking.apartmentId.apartmentName} booking has been confirmed`,
        image: booking.apartmentId.apartmentImages[0],
        price: booking.bookingAmount,
        apartmentId: booking.apartmentId._id,
        notificationType: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
      };
      Notification.createNotification(notificationDetailsBusinessAndIndividual);
      wallet.availableBalance -= booking.bookingAmount;
      await wallet.save();
      booking.paymentStatus = PAYMENT_STATUS.SUCCESS;
      booking.paymentDate = new Date();
      booking.bookingOrderId = "BK" + Date.now().valueOf() + "REF";
      bookingEmail(
        booking.bookingUserId.fullName,
        booking.bookingUserId.email,
        booking.bookingUserId.phonenumber,
        booking.apartmentId.apartmentName,
        booking.checkInDate,
        booking.checkOutDate,
        booking.bookingAmount,
        booking.bookingOrderId
      );
      bookingEmail(
        booking.apartmentOwnerId.fullName ||
          booking.apartmentOwnerId.companyName,
        booking.apartmentOwnerId.email,
        booking.apartmentId.apartmentName,
        booking.checkInDate,
        booking.checkOutDate,
        booking.bookingAmount,
        booking.bookingOrderId
      );
      return await booking.save();
    } else if (paymentMethod === "FLUTTERWAVE") {
      const amount = booking.bookingAmount;
      console.log(amount);

      console.log("This a test", booking._id, booking.bookingOrderId);
      try {
        let checkOut = await initiatePaymentFlutterwave(
          amount,
          booking.bookingUserId.email,
          booking.bookingUserId.phonenumber,
          booking.bookingUserId.fullName,
          booking.bookingUserId._id,
          booking._id
        );

        return checkOut.data.link;
      } catch (e) {}
    }
  }

  async verifyBooking() {
    const { bookingId } = this.data;

    // verify if the incoming booking id is present in the flutterschema(Payment information wey we save)
    const flutterBooking = await FlutterSchema.findOne({
      booking_id: bookingId,
    });

    if (flutterBooking) {
      const booking = await BookingSchema.findOne({
        _id: flutterBooking.booking_id,
      }).populate(
        "apartmentId bookingUserId apartmentOwnerId",
        "apartmentName profilePicture apartmentImages _id userId email fullName companyName"
      );

      const paymentDate = flutterBooking.createdAt;
      booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
      booking.paymentStatus = PAYMENT_STATUS.SUCCESS;
      booking.isBooked = true;

      const transactionDetails = {
        userId: booking.bookingUserId,
        amount: booking.bookingAmount,
        reason: "Booking payment",
        type: TRANSACTION_TYPE.WITHDRAWAL,
        reference: "WD" + Date.now().valueOf() + "REF",
        paymentDate,
      };
      await Transaction.createTransaction(transactionDetails);

      const notificationDetailsUser = {
        bookingUserId: booking.bookingUserId,
        bookingId: booking._id,
        message: `${booking.apartmentId.apartmentName} booking has been confirmed`,
        image: booking.apartmentId.apartmentImages[0],
        price: booking.bookingAmount,
        apartmentId: booking.apartmentId._id,
        notificationType: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
      };
      await Notification.createNotification(notificationDetailsUser);

      const notificationDetailsBusinessAndIndividual = {
        apartmentOwnerId: booking.apartmentId.userId,
        bookingId: booking._id,
        message: `${booking.apartmentId.apartmentName} booking has been confirmed`,
        image: booking.apartmentId.apartmentImages[0],
        price: booking.bookingAmount,
        apartmentId: booking.apartmentId._id,
        notificationType: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
      };
      await Notification.createNotification(
        notificationDetailsBusinessAndIndividual
      );

      bookingEmail(
        booking.bookingUserId.fullName,
        booking.bookingUserId.email,
        booking.apartmentId.apartmentName,
        booking.checkInDate,
        booking.checkOutDate,
        booking.bookingAmount,
        booking.bookingOrderId
      );
      bookingEmail(
        booking.apartmentOwnerId.fullName ||
          booking.apartmentOwnerId.companyName,
        booking.apartmentOwnerId.email,
        booking.apartmentId.apartmentName,
        booking.checkInDate,
        booking.checkOutDate,
        booking.bookingAmount,
        booking.bookingOrderId
      );
      return booking;
    } else {
      throwError(`Payment failed for this booking. Please Try again`, 400);
    }
  }
}
module.exports = Booking;
