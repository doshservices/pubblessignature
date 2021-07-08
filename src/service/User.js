const UserSchema = require('../models/userModel');
const { throwError } = require("../utils/handleErrors");
const bcrypt = require("bcrypt");
const util = require("../utils/util");
const { validateParameters } = require('../utils/util');
//const Wallet = require('../models/wallet');
const { sendResetPasswordToken, verificationCode, SuccessfulPasswordReset } = require('../utils/sendgrid');

class User {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }

    getUserWithPhoneEmail(){
        const user = UserSchema.findOne({ 
            $or:[{phoneNumber: this.data},
                {email: this.data}] 
            });
        return user ? user : throwError('Individual Not Found', 404)
    }

    async emailExist() {
        const existingUser = await UserSchema.findOne({ 
            email: this.data.email,
         }).exec();
        if (existingUser) {
            this.errors.push('Email already taken');
            return { emailExist: true, user: existingUser };
        }
        return { emailExist: false };
    }

    async phoneNumberExist() {
        const findPhoneNumber = await UserSchema.findOne({ 
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
            const user = new UserSchema(this.data)
            user.save()
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
        return await UserSchema.findByCredentials(loginId, password);
    }


    static async getAllUser() {
        const users = await UserSchema.find();
        return users ? users : throwError('No Individual Found', 404)
    }

    async userProfile() {
            const user = await UserSchema.findById(this.data);
            return user ? user : throwError('User Not Found', 404)
    }

    async updateUserDetails() {
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
        const updateUser = await UserSchema.findOneAndUpdate({
             email,
        },
        { token:verificationCode }, { new: true })
        if (!updateUser) {
            throwError('Invalid Email');
        }
        await sendResetPasswordToken(
            updateUser.email, 
            updateUser.firstName, 
            updateUser.token,
            );
        return updateUser;
    }

    async resetPassword() {
        const { token, newPassword } = this.data;
        if (!token ||  !newPassword ) {
            throwError('Please Input Your Token and New Password');
        }
        const hashed = await bcrypt.hash(newPassword, 10)
        const updateUser = await UserSchema.findOneAndUpdate({
            token,
         },
        { token:null, password: hashed }, { new: true })
        if (!updateUser) {
            throwError('Invalid Token');
        }
        await SuccessfulPasswordReset(
            updateUser.firstName,
            updateUser.email,  
            );
        return updateUser;
    }
}


module.exports = User;