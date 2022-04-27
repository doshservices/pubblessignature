// /*eslint-disable*/
var axios = require("axios");
const keys = require("../core/config");
const FlutterSchema = require("../models/flutterModel")
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);



exports.initiatePaymentFlutterwave = async (
  amount,
  email,
  phone,
  name,
  userId,
  bookingId,
) => {
  console.log("I ran",amount,email,phone,name,userId,bookingId);
  try {
    let data = JSON.stringify({
      tx_ref: "PS_" + Math.floor(Math.random() * 100000000 + 1),
      amount: amount,
      currency: "NGN",
      redirect_url: `${keys.BACKEND_BASE_URL}/flutterResponse?amount=${amount}`,
      customer: {
        email: email,
        phonenumber: phone,
        name: name,
      },
      meta: {
        booking_id: bookingId,
        user_id: userId,
        
      },
    });
       console.log(data)
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
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (err) {
    console.log(err.code);
  }
};


exports.flutterPaymentCallback =  async (req,res) => {
  if (req.query.status === 'successful') {
    console.log(req.query)  
  }
};

exports.flutterResponse = async (req , res) => {
  const { amount, status, tx_ref, transaction_id} = req.query
  // const flutterDetails = await FlutterSchema.create({
  //   amount, 
  //   status, 
  //   tx_ref, 
  //   transaction_id
  // }); 
  // flutterDetails.save()
flw.Transaction.verify({ id: transaction_id })
    .then((response) => {
      console.log(response)
      if (
            response.data.status === "successful"
            && response.data.amount === amount
            && response.data.currency === 'NGN') {
            // Success! Confirm the customer's payment
            console.log("Payment Successful")
        } else {
            // Inform the customer their payment was unsuccessful
            console.log("Payment Failed")
        }
    })
    .catch(console.log);
  }
