// /*eslint-disable*/
var axios = require("axios");
const keys = require("../core/config");
const FlutterSchema = require("../models/flutterModel");
const BookingSchema = require("../models/bookingModel");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);
console.log("i ran");

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
      redirect_url: `${keys.FRONTEND_BASE_URL}/dashboard/bookings/${bookingId}/payment-status?amount=${amount}`,
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
      redirect_url: `${keys.BACKEND_BASE_URL}/flutterWalletResponse`,
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

exports.flutterPaymentCallback = async (req, res) => {
  if (req.query.status === "successful") {
    console.log(req.query);
  }
};

exports.flutterResponse = async (req, res) => {
  const { amount, transaction_id, status, tx_ref } = req.query;
  flw.Transaction.verify({ id: transaction_id })
    .then((response) => {
      // console.log("this is some test",response.data.amount == amount);
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

        return res.json({
          status: true,
          data: response.data,
        });
      } else {
        // Inform the customer their payment was unsuccessful
        console.log("Payment Failed");
        return res.json({
          status: false,
          data: response.data,
        });
      }
    })
    .catch(console.log);
};

exports.flutterWalletResponse = async (req, res) => {
  const { status, tx_ref, transaction_id } = req.query;
  flw.Transaction.verify({ id: transaction_id })
    .then((response) => {
      // console.log("this is some test",response.data.amount == amount);
      if (
        response.data.status == "successful" &&
        response.data.currency === "NGN"
      ) {
        // things you can save from flutterwave into your schema
        let booking_id = null;
        let amount = response.data.amount;
        let status_ = response.data.status;
        let reason = response.data.meta.reason;
        let userId = response.data.meta.user_id;

        console.log(response.data);

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

        console.log("Payment Successful");
      } else {
        // Inform the customer their payment was unsuccessful
        console.log("Payment Failed");
      }
    })
    .catch(console.log);
};
