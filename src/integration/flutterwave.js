// /*eslint-disable*/
var axios = require("axios");
const keys = require("../core/config");
const FlutterSchema = require("../models/flutterModel");
const BookingSchema = require("../models/bookingModel");
const NotificationSchema = require("../models/notificationModel");
const TransactionSchema = require("../models/transactionModel");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);
const {
  BOOKING_STATUS,
  NOTIFICATION_TYPE,
  TRANSACTION_TYPE,
  PAYMENT_STATUS,
} = require("../utils/constants");

const Transaction = require("../service/Transaction");
const Notification = require("../service/Notification");
const { bookingEmail } = require("../utils/sendgrid")


exports.initiatePaymentFlutterwave = async (
  amount,
  email,
  phone,
  name,
  userId,
  bookingId
) => {
  // console.log("I ran", amount, email, userId, phone, name, bookingId);
  try {
    let data = JSON.stringify({
      tx_ref: "PS_" + Math.floor(Math.random() * 100000000 + 1),
      amount: amount,
      currency: "NGN",
      redirect_url: `http://localhost:3000/dashboard/bookings/${bookingId}/payment-status?amount=${amount}`,
      // redirect_url: `${keys.BACKEND_BASE_URL}/flutterResponse?amount=${amount}`,
      // redirect_url: `/google.com/`,
      customer: {
        email: email,
        phonenumber: phone,
        name: name,
      },
      meta: {
        booking_id: bookingId,
        user_id: userId,
        reason: "Booking Payment",
      },
    });
    // console.log(data);
    var config = {
      method: "post",
      url: "https://api.flutterwave.com/v3/payments",
      headers: {
        Authorization: "Bearer FLWSECK_TEST-b058747e32a9287f8fbef071340a83d6-X",
        "Content-Type": "application/json",
      },
      data: data,
    };

    //  const save_trxn =  await BookingSchema.findById(bookingId);

    return axios(config)
      .then(function (response) {
        // console.log(response.data);

        // abc.trasaction_id = response.

        return response.data;
        // return res.status(200).json({
        //   status: true,
        //   data: response.data

        // })
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (err) {
    console.log(err.code);
  }
};

exports.initiateWalletFund = async (amount, user) => {
  // console.log("I ran", amount, userId);
  // console.log(user);
  try {
    let data = JSON.stringify({
      tx_ref: "PS_" + Math.floor(Math.random() * 100000000 + 1),
      amount: amount,
      currency: "NGN",
      redirect_url: `http://localhost:3000/dashboard/fund-wallet/flutterWalletResponse`,
      customer: {
        email: user.email,
      },
      meta: {
        user_id: user._id,
        reason: "Wallet Funding",
      },
    });
    // console.log(data);
    var config = {
      method: "post",
      url: "https://api.flutterwave.com/v3/payments",
      headers: {
        Authorization: "Bearer FLWSECK_TEST-b058747e32a9287f8fbef071340a83d6-X",
        "Content-Type": "application/json",
      },
      data: data,
    };

    return axios(config)
      .then(function (response) {
        // return res.status(200).json({
        //   status: true,
        //   data: response.data

        // })
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (err) {
    console.log(err.code);
  }
};

// exports.flutterPaymentCallback = async (req, res) => {
//   if (req.query.status === "successful") {
//     console.log(req.query);
//   }
// };

exports.flutterResponse = async (req, res) => {
  const { amount, transaction_id, status, tx_ref } = req.query;
  const response = await flw.Transaction.verify({ id: transaction_id });

  if (
    response.data.status == "successful" &&
    response.data.amount == amount &&
    response.data.currency === "NGN"
  ) {
    // things you can save from flutterwave into your schema
    let booking_id = response.data.meta.booking_id;
    let status_ = response.data.status;
    let reason = response.data.meta.reason;
    let userId = response.data.meta.user_id;
    // console.log(response.data);

    //kindly save this correctly
    const flutterDetails = new FlutterSchema({
      amount,
      status_,
      tx_ref,
      transaction_id,
      booking_id,
      reason,
      userId,
    });
    flutterDetails.save();

    console.log("This is Payment Successful");

    const booking = await BookingSchema.findOne({
      _id: booking_id,
    }).populate(
      "apartmentId bookingUserId apartmentOwnerId",
      "apartmentName profilePicture apartmentImages _id userId email fullName companyName"
    );

    // console.log(booking);

    const paymentDate = flutterDetails.createdAt;
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

    return res.json({
      status: true,
      data: {
        payment: response.data,
        booking: booking
      },
    });


  } else {
    // Inform the customer their payment was unsuccessful
    console.log("Payment Failed");
    return res.json({
      status: false,
      data: response.data,
    });

  }


};

exports.flutterWalletResponse = async (req, res) => {
  const { status, tx_ref, transaction_id } = req.query;
  flw.Transaction.verify({ id: transaction_id })
    .then((response) => {
      // console.log("this is some test",response.data.amount == amount);
      console.log(response)

      return;
      if (
        response.data.status == "successful" &&
        response.data.currency === "NGN"
      ) {
        // things you can save from flutterwave into your schema
        // let booking_id = null;
        // let amount = response.data.amount;
        // let status_ = response.data.status;
        // let reason = response.data.meta.reason;
        // let userId = response.data.meta.user_id;

        // console.log(response.data);

        // //kindly save this correctly
        // const flutterDetails = new FlutterSchema({
        //   amount,
        //   status_,
        //   tx_ref,
        //   transaction_id,
        //   booking_id,
        //   reason,
        //   userId,
        // });
        // flutterDetails.save();

        console.log("Payment Successful");
      } else {
        // Inform the customer their payment was unsuccessful
        console.log("Payment Failed");
      }
    })
    .catch(console.log);
};
