import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { generateToken, rendomStringGenerate } from "../utils/utils";
import { UserModelType, } from "../types/Database/types";
import { SUCCESS } from "../utils/response";
import { sendEmail } from "../servers/sendEmail";
import { sendSms } from "../servers/twilioService";
import path from 'path'
//stripe
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// signup
export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        let { email, phone, countryCode } = req.body;
        console.log("req.body", req.body)
        let userExists: UserModelType = email ? await UserModel.findOne({ email: { $regex: new RegExp(email, 'i') } }) : await UserModel.findOne({ phone, countryCode });

        if (userExists && (userExists.isEmailVerified || userExists.isPhoneVerified) && userExists.password) {
            throw new NotFoundError("User already exists");
        }
        if (!userExists) {
            userExists = new UserModel({ email, phone, countryCode })
            userExists.userId = userExists._id.toString();
        }
        console.log("hello")
        const otp = String(Math.round(1000 + Math.random() * 9000));
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        userExists.otp = otp;
        userExists.otpExpires = otpExpires;
        userExists.step = 1;
        userExists.verifyOtp = false;
        await userExists.save();
        console.log("user", userExists)
        if (email) {
            await sendEmail(email, 1, otp);
        } else {
            await sendSms(`${countryCode}${phone}`, 1, otp)
        }

        console.log("otp", otp)
        return SUCCESS(res, 200, "Verify account", { userExists: { _id: userExists._id, email, phone, countryCode, step: 1, type: email ? 1 : 2 } });
    } catch (error: any) {
        console.log("error", error)
        next(error);
    }
}
// verify otp 
export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { otp, id, type, typeFor } = req.body;
        console.log("verifyOtp", req.body)
        const userExists: UserModelType = await UserModel.findById(id);
        if (!userExists) {
            throw new NotFoundError("User not found");
        }
        if (!userExists.otpExpires || userExists.otpExpires < new Date()) {
            throw new NotFoundError("OTP expired or invalid");
        };
        // console.log("otp",otp, userExists)
        if (userExists.otp !== null && userExists.otp === otp) {
            userExists.verifyOtp = true;
            userExists.otp = null;
            userExists.otpExpires = null;
            if (typeFor == 1) {
                userExists.step = 2;
            }
            if (type === 1) {
                userExists.isEmailVerified = true;
            } else if (type === 2) {
                userExists.isPhoneVerified = true;
            } else {
                throw new NotFoundError("Invalid type");
            }
            await userExists.save();
            return SUCCESS(res, 200, "OTP verified", { userExists: { _id: userExists._id, email: userExists.email, phone: userExists.phone, countryCode: userExists.countryCode, step: 2 } });
        } else {
            throw new BadRequestError("Invalid OTP");
        }
    } catch (error: any) {
        next(error);
    }
}
// add password
export const addPassword = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const { password, id, } = req.body;
        const userExists: UserModelType = await UserModel.findById(id);
        if (!userExists) {
            throw new NotFoundError("User not found");
        }
        console.log("User already exists", userExists.step)
        if (userExists.step != 2 && userExists.step != 4) {
            throw new NotFoundError("Please verify your account first");
        }
        userExists.password = password;
        if (!userExists.dashboardRole) {
            userExists.step = 3;
        }
        await userExists.save();
        return SUCCESS(res, 200, "Password added successfully", { userExists: { _id: userExists._id, email: userExists.email, phone: userExists.phone, countryCode: userExists.countryCode, step: userExists.step } });
    } catch (error: any) {
        next(error);
    }
}
// add dashboardRole
export const addDashboardRole = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const { id, role, deviceToken, deviceType } = req.body;
        const userExists: UserModelType = await UserModel.findById(id);
        if (!userExists) {
            throw new NotFoundError("User not found");
        }
        if (userExists.step < 3) {
            throw new NotFoundError("register again!");
        }

        userExists.dashboardRole = role;
        userExists.deviceToken = deviceToken;
        userExists.deviceType = deviceType;
        userExists.step = 4;
        userExists.jti = rendomStringGenerate(20);
        await userExists.save();
        const accessToken = await generateToken({ id, jti: userExists.jti })
        return SUCCESS(res, 200, "Role added successfully", {
            userExists: {
                _id: userExists._id, email: userExists.email, phone: userExists.phone,
                countryCode: userExists.countryCode,
                step: userExists.step,
                dashboardRole: userExists.dashboardRole,
                accessToken
            }
        });
    } catch (error: any) {
        next(error);
    }
}

//login
export const login = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const { email, phone, countryCode, password, deviceToken, deviceType } = req.body;
        let userExists: UserModelType = email ? await UserModel.findOne({ email: { $regex: new RegExp(email, 'i') } }) : await UserModel.findOne({ phone, countryCode });
        if (!userExists) {
            throw new NotFoundError("User not found");
        }
        if (!userExists.password) {
            throw new NotFoundError("User not found");
        }
        const isValidPassword = await userExists.matchPassword(password);
        if (!isValidPassword) {
            throw new BadRequestError("Invalid password");
        }
        userExists.jti = rendomStringGenerate(20);
        userExists.deviceToken = deviceToken;
        userExists.deviceType = deviceType;
        await userExists.save();
        const accessToken = await generateToken({ id: userExists._id, jti: userExists.jti });
        return SUCCESS(res, 200, "Login successfully", {
            userExists: {
                _id: userExists._id, email: userExists.email, phone: userExists.phone,
                countryCode: userExists.countryCode,
                step: userExists.step,
                dashboardRole: userExists.dashboardRole,
                accessToken
            }
        });
    } catch (error: any) {
        next(error);
    }
}

//forget and re send otp
export const sendOtp = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const { email, phone, countryCode, type } = req.body;
        let userExists: UserModelType = email ? await UserModel.findOne({ email: { $regex: new RegExp(email, 'i') } }) : await UserModel.findOne({ phone, countryCode });
        if (!userExists) {
            throw new NotFoundError("User not found");
        }
        const otp = String(Math.round(1000 + Math.random() * 9000));
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        userExists.otp = otp;
        userExists.otpExpires = otpExpires;
        console.log(otp)
        await userExists.save();
        if (email) {
            await sendEmail(email, type, otp);
        } else {
            await sendSms(`${countryCode}${phone}`, type, otp)
        }
        return SUCCESS(res, 200, "OTP sent successfully", { userExists: { _id: userExists._id, email, phone, countryCode, step: userExists.step, type: email ? 1 : 2 } });
    } catch (error: any) {
        next(error);
    }
};
//get profile
export const getProfile = async (req: Request, res: Response, next: NextFunction):
    Promise<any> => {
    try {
        const userExists = req.user;
        const { password, otp, otpExpires, ...userData } = userExists.toObject();
        return SUCCESS(res, 200, "Profile fetched successfully", { userExists: userData });
    } catch (error: any) {
        next(error);
    }
};

// update profile
export const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const {
            email, phone, countryCode, firstName, lastName, dashboardRole,
            bio, address, latitude, longitude, work, smsNotification,
            emailNotification, currentPassword, newPassword
        } = req.body;
        const id = req.userId;
        const userExists = await UserModel.findById(id);
        if (!userExists) {
            throw new NotFoundError("User not found");
        }
        if (currentPassword && newPassword) {
            const isValidPassword = await userExists.matchPassword(currentPassword);
            if (!isValidPassword) {
                throw new BadRequestError("Invalid current password");
            }
            userExists.password = newPassword;
        }

        if (email) {
            const exist = await UserModel.findOne({ email: { $regex: new RegExp(email, 'i') } });
            if (exist) {
                throw new BadRequestError("Email already exists");
            }
            userExists.email = email;
            userExists.isEmailVerified = false;
        }
        if (phone && countryCode) {
            const exist = await UserModel.findOne({ phone, countryCode });
            if (exist) {
                throw new BadRequestError("Phone number already exists");
            }
            userExists.phone = phone;
            userExists.countryCode = countryCode;
            userExists.isPhoneVerified = false;
        }

        userExists.firstName = firstName ?? userExists.firstName;
        userExists.lastName = lastName ?? userExists.lastName;
        userExists.bio = bio ?? userExists.bio;
        userExists.address = address ?? userExists.address;
        userExists.latitude = latitude ?? userExists.latitude;
        userExists.longitude = longitude ?? userExists.longitude;
        userExists.work = work ?? userExists.work;
        userExists.dashboardRole = dashboardRole ?? userExists.dashboardRole;
        userExists.smsNotification = smsNotification ?? userExists.smsNotification;
        userExists.emailNotification = emailNotification ?? userExists.emailNotification;
        if (latitude && longitude) {
            userExists.location = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
        }
        // if (dashboardRole && Array.isArray(userExists.dashboardRole)) {
        //     if (!userExists.dashboardRole.includes(dashboardRole)) {
        //         userExists.dashboardRole.push(dashboardRole);
        //     }
        // }
        await userExists.save();
        const { password, otp, otpExpires, ...userData } = userExists.toObject();
        return SUCCESS(res, 200, currentPassword && newPassword ? "Password changed" : "Profile updated successfully", { userExists: userData });
    } catch (error: any) {
        next(error);
    }
};
export const updateProfileImage = async (req: Request, res: Response, next: NextFunction
): Promise<any> => {
    try {
        const userExists = req.user;
        if (req.file) {
            userExists.profileImage = `/uploads/${req.file.filename}`;
        }
        await userExists.save();
        // Exclude sensitive fields before sending response
        const { password, otp, otpExpires, ...userData } = userExists.toObject();
        return SUCCESS(res, 200, "Profile image updated successfully", { userExists: userData });
    } catch (error: any) {
        next(error);
    }
};

// carete striip customer account and add payment methode id
export const addPaymentMethodToCustomer = async (req: Request, res: Response, next: NextFunction
): Promise<any> => {
    try {
        const userExists = req.user;
        const { paymentMethodId } = req.body;
        let stripeCustomerId = userExists.stripeCustomerId;

        // Create Stripe Customer if not already created
        if (!stripeCustomerId) {
            const stripeCustomer = await stripe.customers.create({
                email: userExists.email,
                name: `${userExists.firstName} ${userExists.lastName}`,
                phone: userExists.phone,
                address: {
                    line1: userExists.address
                },
            });

            stripeCustomerId = stripeCustomer.id;
            userExists.stripeCustomerId = stripeCustomerId;
            await userExists.save();
        }

        // Check if a payment method ID is provided
        if (!paymentMethodId) {
            throw new BadRequestError('payment method ID is required');
        }

        // Attach Payment Method to the Stripe Customer
        await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });

        // Set Payment Method as Default
        await stripe.customers.update(stripeCustomerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });
        const paymentMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
        });
        return SUCCESS(res, 200, "Stripe payment methos added successfully", { paymentMethods: paymentMethods?.data })

    } catch (error) {
        console.error(error);
        next(error);
    }
};

//get all my all paymeny methods from stripe
export const getAllPaymentMethods = async (req: Request, res: Response, next: NextFunction
): Promise<any> => {
    try {
        const userExists = req.user;
        const stripeCustomerId = userExists.stripeCustomerId;
        const paymentMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
        });
        return SUCCESS(res, 200, "Stripe payment methods retrieved successfully", { paymentMethods: paymentMethods?.data })
    } catch (error) {
        console.error(error);
        next(error);
    }
}
// remove payment methods from stripe 
export const removePaymentMethods = async (req: Request, res: Response, next: NextFunction
): Promise<any> => {
    try {
        const userExists = req.user;
        const stripeCustomerId = userExists.stripeCustomerId;
        const { paymentMethodId } = req.params;
        await stripe.paymentMethods.detach(paymentMethodId);
        const paymentMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
        });
        return SUCCESS(res, 200, "Stripe payment method removed successfully", { paymentMethods: paymentMethods?.data });
    } catch (error) {
        console.error(error);
        next(error);
    }
}
export const createStripeAccount = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { userId, user } = req;


        // if (user.isStripeAccountConnected && user.stripeAccountId)
        //     throw new BadRequestError("User already has a stripe account");

        if (user.isStripeAccountConnected && user.stripeAccountId) {
            return SUCCESS(res, 200, "Account already created", { accountLink: { stripeAccountId: user.stripeAccountId, isStripeAccountConnected: user.isStripeAccountConnected } })
        }

        if (!user.stripeAccountId || user.isStripeAccountConnected) {
            const account = await stripe.accounts.create({
                country: "US",
                email: user.email,
                type: "express",
            });

            user.stripeAccountId = account.id;
            await user.save();
        }

        const accountLink = await stripe.accountLinks.create({
            account: user.stripeAccountId,
            return_url:
                process.env.BACKEND_URL +
                "/api/v1/user/account/success/" +
                user.stripeAccountId,
            refresh_url: process.env.BACKEND_URL + "/api/v1/user/account/refresh",
            type: "account_onboarding",
        });
        return SUCCESS(res, 200, "Success", { accountLink })
    } catch (error) {
        console.error(error);
        next(error);
    }
};
export const accountRefresh = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const filePath = path.resolve(__dirname, "../../src/view", "refresh_page.html");
        console.log("file fath ", filePath)
        return res.sendFile(filePath, (err) => {
            if (err) {
                // If there is an error sending the file (e.g., file not found)
                console.error("File sending error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const accountSuccess = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { stripeAccountId } = req.params;

        console.log("Received stripeConnectId:", stripeAccountId);

        // Ensure the correct account ID is passed
        if (!stripeAccountId || !stripeAccountId.startsWith("acct_")) {
            console.error("Invalid Stripe account ID:", stripeAccountId);
            return res.status(400).json({ error: "Invalid Stripe account ID" });
        }

        // Attempt to retrieve the Stripe account
        const account = await stripe.accounts.retrieve(stripeAccountId);
        console.log("Retrieved account:", account);

        // Find the user with the corresponding stripeConnectId
        const user = await UserModel.findOne({ stripeAccountId });
        console.log("Found user:", user);

        if (!user || !account.details_submitted) {
            return res.redirect("/api/v1/user/account/refresh");  // Use absolute path for redirection
        }

        user.isStripeAccountConnected = true;
        await user.save();
        const filePath = path.resolve(__dirname, "../../src/view", "account_success.html");
        console.log("file fath ", filePath)
        return res.sendFile(filePath, (err) => {
            if (err) {
                console.error("File sending error:", err);
                throw err;
            }
        });
    } catch (error) {
        console.error(error);
        next(error)
    }
}

//change email and phone no and otp and verify
export const changeEmailAndPhoneNumber = async (req: Request, res: Response, next: NextFunction
): Promise<any> => {
    try {
        const { email, phone, countryCode, type, typeFor, newOtp } = req.body;
        const userExists = req.user;
        if (userExists?.email.toLowerCase().trim() == email?.toLowerCase().trim()) {
            throw new BadRequestError("Email can't be same with the existing email");
        }
        if (userExists?.phone === phone && userExists?.countryCode == countryCode) {
            throw new BadRequestError("Phone number can't be same with the existing phone number");
        }
        if (typeFor == 1) {
            const generateOtp = String(Math.round(1000 + Math.random() * 9000));
            const generateOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
            userExists.otp = generateOtp;
            userExists.otpExpires = generateOtpExpires;
            if (type == 1) {
                await sendEmail(email, 5, generateOtp);
                userExists.tempVariable.email = email;
            } else if (type == 2) {
                await sendSms(`${countryCode}${phone}`, 5, generateOtp);
                userExists.tempVariable.phone = phone;
                userExists.tempVariable.countryCode = countryCode;
            } else {
                throw new BadRequestError("Invalid type");
            }
        } else if (typeFor == 2) {
            if (!userExists.otpExpires || userExists.otpExpires < new Date()) {
                throw new NotFoundError("OTP expired or invalid");
            };
            // console.log("otp",otp, userExists)
            if (userExists.otp !== null && userExists.otp === newOtp) {
                userExists.otp = null;
                userExists.otpExpires = null;
                if (type == 1) {
                    userExists.isEmailVerified = true;
                    userExists.email = userExists.tempVariable.email;
                    userExists.tempVariable.email = null;

                } else if (type == 2) {
                    userExists.isPhoneVerified = true;
                    userExists.phone = userExists.tempVariable.phone;
                    userExists.countryCode = userExists.tempVariable.countryCode;
                    userExists.tempVariable.phone = null;
                    userExists.tempVariable.countryCode = null;
                } else {
                    throw new BadRequestError("Invalid type");
                }
            } else {
                throw new BadRequestError("Invalid otp");
            }

        } else {
            throw new BadRequestError("Invalid typeFor");
        }
        await userExists.save();
        const { password, otp, otpExpires, ...userData } = userExists.toObject();

        return SUCCESS(res, 200, typeFor == 1 ? "Verify Otp" : "Success", {
            userExists: {
                ...userData, type, typeFor
            }
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}