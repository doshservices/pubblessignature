const HostSchema = require('../models/hostModel');
const { throwError } = require("../utils/handleErrors");
const bcrypt = require("bcrypt");
const util = require("../utils/util");
const { validateParameters } = require('../utils/util');
const { sendResetPasswordToken, SuccessfulPasswordReset } = require('../utils/sendgrid');

class Host {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }

    getHostWithUniqueId() {
        const host = HostSchema.findOne({ $or:[{phoneNumber: this.data}, {email: this.data}] });
        return host ? host : throwError('Host Not Found! Enter a Registered Email or Phone Number', 404)
    }

    async emailExist() {
        const existingHost = await HostSchema.findOne({ email: this.data.email }).exec();
        if (existingHost) {
            this.errors.push('Email already exists');
            return { emailExist: true, host: existingHost };
        }
        return { emailExist: false };
    }

    async phoneNumberExist() {
        const findPhoneNumber = await HostSchema.findOne({ phoneNumber: this.data.phoneNumber }).exec();
        if (findPhoneNumber) {
            this.errors.push('Phone Number already exists');
            return true;
        }
        return false;
    }

    async signup() {
        const host = new HostSchema(this.data);
        let validationError = host.validateSync();
        if(validationError){
            Object.values(validationError.errors).forEach(e => {
                if(e.reason) this.errors.push(e.reason.message);
                else this.errors.push(e.message.replace('Path ', ''));
            });
            throwError(this.errors)
        }
        await Promise.all([this.emailExist(), this.phoneNumberExist()]);
        if (this.errors.length) {
            throwError(this.errors)
        }
        return await host.save();
    }

    async login() {
        const { loginId, password } = this.data;
        const validParameters = validateParameters(["loginId", "password"], this.data);
        const { isValid, messages } = validParameters;
        if (!isValid) {
            throwError(messages);
        }
        return await HostSchema.findByCredentials(loginId, password);
    }


    static async getAllHost() {
        const hosts = await HostSchema.find();
        return hosts ? hosts : throwError('No Host Found', 404)
    }

    async hostProfile() {
        const host = await HostSchema.findById(this.data);
        return host ? host : throwError('Host Not Found', 404)
    }

    async updateHostDetails() {
        const {newDetails, oldDetails} = this.data;
        const updates = Object.keys(newDetails);
        const allowedUpdates = [
            'email',
            'phoneNumber',
        ];
        return await util.performUpdate(updates, newDetails, allowedUpdates, oldDetails);
    }

    async forgotPassword() {
        const { email } = this.data;
        const verificationCode = Math.floor(100000 + Math.random() * 100000);
        if (!email) {
            throwError('Please Input Your Email');
        }
        const updateHost = await HostSchema.findOneAndUpdate({ email },
        { token:verificationCode }, { new: true })
        if (!updateHost) {
            throwError('Invalid Email');
        }
        await sendResetPasswordToken(
            updateHost.email, 
            updateHost.companyName, 
            updateHost.token,
            );
        return updateHost;
    }

    async resetPassword() {
        const { token, newPassword } = this.data;
        if (!token ||  !newPassword ) {
            throwError('Please Input Your Token and New Password');
        }
        const hashed = await bcrypt.hash(newPassword, 10)
        const updateHost = await HostSchema.findOneAndUpdate({
            token,
         },
        { token:null, password: hashed }, { new: true })
        if (!updateHost) {
            throwError('Invalid Token');
        }
        await SuccessfulPasswordReset(
            updateHost.companyName,
            updateHost.email,  
            );
        return updateHost;
    };
};

module.exports = Host;