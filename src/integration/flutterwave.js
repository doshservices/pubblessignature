// /*eslint-disable*/
// const axios = require("axios");
// const got =require("got")
// const { error, success } = require("../utils/baseController");
// const FLW_SECRET_KEY = require("../core/config");

//     // const response = await axios.post(
//     //     "https://api.flutterwave.com/v3/payments",
//     //     {
//     //         "headers": { "Authorization": `Bearer ${process.env.FLW_SECRET_KEY}` },
//     //     },payload

//     // );

// // } catch (err) {
// //     console.log ("<<<<<<<",err)
// //     console.log(err);
// //    console.log(err.response.body);
// //}

var axios = require("axios");
const FLW_SECRET_KEY = require("../core/config");

exports.initiatePaymentFlutterwave = async (
  amount,
  email,
  phone,
  name,
  userId
) => {
  try {
    var data = JSON.stringify({
      tx_ref: "PS_" + Math.floor(Math.random() * 100000000 + 1),
      amount: amount,
      currency: "NGN",
      redirect_url: "https://webhook.site/9d0b00ba-9a69-44fa-a43d-a82c33c36fdc",
      customer: {
        email: email,
        phonenumber: phone,
        name: name,
      },
      meta: {
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
        console.log("==========Inside Payment");
        //  console.log( { reference: response.data.tx_ref,
        //            confirmationUrl: response.data.redirect_url,
        //            userId: response.data.meta.user_id,
        //   });
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (err) {
    console.log(err.code);
    console.log(err.response.body);
  }
};


exports.flutterPaymentCallback =  async (req,res) => {
  if (req.query.status === 'successful') {
    console.log(req.query)  
  }
};