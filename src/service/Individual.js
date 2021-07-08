const IndividualSchema = require('../models/individualModel');
const { throwError } = require("../utils/handleErrors");
const bcrypt = require("bcrypt");
const util = require("../utils/util");
const { validateParameters } = require('../utils/util');
//const Wallet = require('../models/wallet');
const { sendResetPasswordToken, SuccessfulPasswordReset } = require('../utils/sendgrid');

class Individual {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }

    getIndividualWithPhoneEmail(){
        const individual = IndividualSchema.findOne({ 
            $or:[{phoneNumber: this.data},
                {email: this.data}] 
            });
        return individual ? individual : throwError('Individual Not Found', 404)
    }

    async emailExist() {
        const existingIndividual = await IndividualSchema.findOne({ 
            email: this.data.email,
         }).exec();
        if (existingIndividual) {
            this.errors.push('Email already taken');
            return { emailExist: true, individual: existingIndividual };
        }
        return { emailExist: false };
    }

    async phoneNumberExist() {
        const findPhoneNumber = await IndividualSchema.findOne({ 
            phoneNumber: this.data.phoneNumber,
        }).exec();
        if (findPhoneNumber) {
            this.errors.push('Phone Number already taken');
            return true;
        }
        return false;
    }

    async signup() {
        return new Promise(async (resolve, reject) => {
            await Promise.all([this.emailExist(), this.phoneNumberExist()])
            if (this.errors.length) {
                return reject(this.errors)
            }
            const individual = new IndividualSchema(this.data)
            individual.save()
                .then(data => { 
                    if (!data) {
                        this.errors.push("Unable to save data")
                        return reject(this.errors)
                    }
                    resolve(data)
                }).catch((err) => {
                    this.errors.push("Unable to save data")
                    return reject(this.errors)
                })
        })
    }

    async login() {
        const { loginId, password } = this.data;
        const validParameters = validateParameters([
            "loginId", 
            "password"
        ], 
        this.data
        );
        const { isValid, messages } = validParameters;

        if (!isValid) {
            throwError(messages);
        }
        return await IndividualSchema.findByCredentials(loginId, password);
    }


    static async getAllIndividual() {
        const individuals = await IndividualSchema.find();
        return individuals ? individuals : throwError('No Individual Found', 404)
    }

    async individualProfile() {
            const individual = await IndividualSchema.findById(this.data);
            return individual ? individual : throwError('Individual Not Found', 404)
    }

    async updateIndividualDetails() {
        const {newDetails, oldDetails} = this.data;
        const updates = Object.keys(newDetails);
        const allowedUpdates = [
            'firstName',
            'lastName',
            'email',
            'phoneNumber',
        ];
        return await util.performUpdate(
            updates, 
            newDetails, 
            allowedUpdates, 
            oldDetails,
            );
    }

    async forgotPassword() {
        const { email } = this.data;
        const verificationCode = Math.floor(100000 + Math.random() * 100000);
        if (!email) {
            throwError('Please Input Your Email');
        }
        const updateIndividual = await IndividualSchema.findOneAndUpdate({ email },
        { token:verificationCode }, { new: true })
        if (!updateIndividual) {
            throwError('Invalid Phone Number or Email');
        }
        await sendResetPasswordToken(
            updateIndividual.email, 
            updateIndividual.firstName, 
            updateIndividual.token,
            );
        return updateIndividual;
    }

    async resetPassword() {
        const { token, newPassword } = this.data;
        if (!token ||  !newPassword ) {
            throwError('Please Input Your Token and New Password');
        }
        const hashed = await bcrypt.hash(newPassword, 10)
        const updateIndividual = await IndividualSchema.findOneAndUpdate({
            token,
         },
        { token:null, password: hashed }, { new: true })
        if (!updateIndividual) {
            throwError('Invalid Token');
        }
        await SuccessfulPasswordReset(
            updateIndividual.firstName,
            updateIndividual.email,  
            );
        return updateIndividual;
    }
}


module.exports = Individual;