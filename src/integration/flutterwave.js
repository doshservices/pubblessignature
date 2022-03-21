/*eslint-disable*/
const axios = require("axios");
const { error, success } = require("../utils/baseController");
const FLW_SECRET_KEY = require("../core/config");

exports.initializePayment = async (req, res) => {
    payload = {
        tx_ref:  "PS_"+Math.floor((Math.random()*100000000)+1),
        amount: "100",
        currency: "NGN",
        redirect_url: "https://webhook.site/9d0b00ba-9a69-44fa-a43d-a82c33c36fdc",
        customer: {
            email: "juniorefe45@gmail.com",
            phonenumber: "08036792165",
            name: "Abduljelili Umaru"
        },
        meta: {
            user_id: "622f1121fce8fb2c64e1c298",
           
        },
        customizations: {
            title: "Pied Piper Payments",
            logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
        }
    }
try {
    const response = await axios.post(
        "https://api.flutterwave.com/v3/payments", 
        { 
            "headers": { "Authorization": `Bearer ${process.env.FLW_SECRET_KEY}` },
        },payload

    );
     return response.data

      
} catch (err) {
    console.log ("<<<<<<<",err)
    console.log(err);
   console.log(err.response.body);
}
}