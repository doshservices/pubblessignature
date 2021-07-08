const {
    SENDGRID_API_KEY,
    VERIFIED_EMAIL,
    SENDGRID_TEMPLATEID,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER
} = require("../core/config")
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(SENDGRID_API_KEY);
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const { logger } = require("../utils/logger");

const verificationCode = Math.floor(100000 + Math.random() * 100000);

 function sendEmail(Email) {
    const msg = {
        to: Email, // Change to your recipient
        from: VERIFIED_EMAIL, // Change to your verified sender
        TemplateId: SENDGRID_TEMPLATEID,
    }
    sgMail
        .send(msg)
        .then((result) => {
        })
        .catch(error => {
            console.error(error);
            if (error.response) {
                const { response } = error;
                const { body } = response;
                return body;
            }
        });
}

function sendResetPasswordToken(Email, firstName, token) {
    const msg = {
        to: Email, // Change to your recipient
        from: VERIFIED_EMAIL, // Change to your verified sender
        subject: 'Password Reset Token',
        html: `<h4>Hello ${firstName},</h4>
              <p>Please use this <b> ${token} </b> to reset your password </p>
              <p><b>Regards,</b></p>
              <p><b>Kampe</b></p>
              `
    }
    sgMail
        .send(msg)
        .then((result) => {
            return result;
        })
        .catch(error => {
            console.error(error);
            if (error.response) {
                const { response } = error;
                const { body } = response;
                console.error(body);
            }
        });
}

function registrationSuccessful(Email, firstName) {
    const msg = {
        to: Email, // Change to your recipient
        from: VERIFIED_EMAIL, // Change to your verified sender
        subject: 'Registration Successful',
        html: `<h4>Hello ${firstName},</h4>
              <p>Thanks for joining Kampe, Your Registration is successful</p>`,
    }
    sgMail
        .send(msg)
        .then((result) => {
            return result;
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                const { response } = error;
                const { body } = response;
                console.error(body);
            }
        });
}

function passwordEmail(Name, Email, link) {
    const msg = {
        to: Email, // Change to your recipient
        from: VERIFIED_EMAIL, // Change to your verified sender
        subject: 'Reset Your Password',
        html: `<h1>Dear ${Name},</h1>
        <p>You Have recently asked to reset your Felt-Teachers profile password.</p>
         <p><b>Please follow this link <a href = "${link}">Click Here To Reset Your Password</a></b></p>
        <p>Best Regards,</p>
        <p>Felt-Teachers</p>`,
    }

    sgMail
        .send(msg)
        .then((result) => {
            console.log(result);
        })
        .catch(error => {
            // Log friendly error
            console.error(error);

            if (error.response) {
                // Extract error msg
                const { message, code, response } = error;

                // Extract response msg
                const { headers, body } = response;

                console.error(body);
            }
        });
}

function SuccessfulPasswordReset(Name, Email) {
    const msg = {
        to: Email, // Change to your recipient
        from: VERIFIED_EMAIL, // Change to your verified sender
        subject: 'Your Password Reset Successful',
        html: `<h1>Dear ${Name},</h1>
        <p>Your request to reset your Kampe password is successful. Upon your next login
        please use your new password.</p>
        <p><b>Regards,</b></p>
        <p><b>Kampe</b></p>`,
    }

    sgMail
        .send(msg)
        .then((result) => {
            return result;
        })
        .catch(error => {
            // Log friendly error
            console.error(error);

            if (error.response) {
                // Extract error msg
                const { message, code, response } = error;

                // Extract response msg
                const { headers, body } = response;

                console.error(body);
            }
        });
}


function deleteAccountEmail(Name, Email) {
    const msg = {
        to: Email, // Change to your recipient
        from: VERIFIED_EMAIL, // Change to your verified sender
        subject: 'Account Deletion',
        html: `<h1>Hello ${Name},</h1>
        <p>Your account with Felt-Teacher has been Deleted. <b>We Hate To See You Go</b></p>
        <p>Please do send us a review via our official mail feltteacher@gmail.com, bcause we would love to
        know why you've decided to delete your account with us</p>
        <p>Anytime you change your mind, please reach out us, we'll be glad to welcome you back</p>
        <p> Best Regards,</p>
        <p>Felt-Teachers</b>`
    }

    sgMail
        .send(msg)
        .then((result) => {
            return result;
        })
        .catch(error => {
            // Log friendly error
            console.error(error);

            if (error.response) {
                // Extract error msg
                const { message, code, response } = error;

                // Extract response msg
                const { headers, body } = response;

                console.error(body);
            }
        });
}

async function sendSms(phoneNumber) {
    try {
        await client.messages
            .create({
                body: `Your Kampe verification code is: ${verificationCode}`,
                from: TWILIO_PHONE_NUMBER,
                to: phoneNumber
            });
        return {message: `OTP Message sent to ${phoneNumber} successfully`, data: verificationCode, status: 200};
    } catch(error){
        logger.error("Error occurred sending token", error);
        return {message: `Error occurred sending OTP Message to ${phoneNumber}`,  data: error.message, status: 500};
    }
}

module.exports = {
    sendEmail,
    passwordEmail,
    SuccessfulPasswordReset,
    deleteAccountEmail,
    registrationSuccessful,
    sendSms,
    sendResetPasswordToken,
    verificationCode,
}
