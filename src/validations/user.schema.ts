import Joi, { valid } from 'joi';

export const registerSchema = {
    body: Joi.object({
        email: Joi.string().pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/).messages({
            "string.base": "Email must be a string",
            "string.pattern.base": "Email must be a valid email address (e.g., user@example.com)"
        }),

        phone: Joi.string().optional().pattern(/^[\d\-\+\(\) ]+$/).messages({
            "string.base": "Phone must be a string",
            "string.pattern.base": "Phone number must contain only numbers, dashes, parentheses, and spaces"
        }),

        countryCode: Joi.string().when('phone', {
            is: Joi.exist(),
            then: Joi.required().messages({
                "string.base": "Country Code must be a string",
                "string.pattern.base": "Country Code must be in the format of a valid international country code (e.g., +1 for US, +44 for UK)",
                "any.required": "Country Code is required when phone is provided"
            }),
            otherwise: Joi.optional()
        }),

    }).or('email', 'phone').messages({
        'object.missing': 'Please Enter Email Or Phone Number',
    })
};
export const verifyOtpSchema = {
    body: Joi.object({
        id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
            "string.base": "Id must be a string",
            "string.pattern.base": "Id must be a valid MongoDB ObjectId",
            "any.required": "Id is required"
        }),

        otp: Joi.string().pattern(/^\d{4}$/).required().messages({
            "string.base": "OTP must be a string",
            "string.pattern.base": "OTP must be a 4-digit number",
            "any.required": "OTP is required"
        }),
        type: Joi.number().valid(1, 2).required().messages({
            "number.base": "Type must be a number",
            "any.required": "Type is required",
            "any.only": "Type must be either 1(email) or 2(phone)"
        }),
        typeFor: Joi.number().valid(1, 2).required().messages({
            "number.base": "TypeFor must be a number",
            "any.required": "TypeFor is required",
            "any.only": "TypeFor must be either 1(register) or 2(forget)"
        }),

    })
};
export const set_passwordSchema = {
    body: Joi.object({
        id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
            "string.base": "Id must be a string",
            "string.pattern.base": "Id must be a valid MongoDB ObjectId",
            "any.required": "Id is required"
        }),
        password: Joi.string().required().messages({
            "string.base": "password must be a string",
            "any.required": "password is required"
        }),

    })
};
export const set_Dashboad_roleSchema = {
    body: Joi.object({
        id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
            "string.base": "Id must be a string",
            "string.pattern.base": "Id must be a valid MongoDB ObjectId",
            "any.required": "Id is required"
        }),
        role: Joi.string().required().valid('host', 'rent').messages({
            "string.base": "role must be a string",
            "any.required": "role is required"
        }),
        deviceType: Joi.string().optional().messages({
            "string.base": "deviceType must be a string",
        }),
        deviceToken: Joi.string().optional().messages({
            "string.base": "deviceToken must be a string",
        }),

    })
};
export const log_inSchema = {
    body: Joi.object({
        email: Joi.string().pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/).messages({
            "string.base": "Email must be a string",
            "string.pattern.base": "Email must be a valid email address (e.g., user@example.com)"
        }),

        phone: Joi.string().optional().pattern(/^[\d\-\+\(\) ]+$/).messages({
            "string.base": "Phone must be a string",
            "string.pattern.base": "Phone number must contain only numbers, dashes, parentheses, and spaces"
        }),

        countryCode: Joi.string().when('phone', {
            is: Joi.exist(),
            then: Joi.required().messages({
                "string.base": "Country Code must be a string",
                "string.pattern.base": "Country Code must be in the format of a valid international country code (e.g., +1 for US, +44 for UK)",
                "any.required": "Country Code is required when phone is provided"
            }),
            otherwise: Joi.optional()
        }),
        password: Joi.string().required().messages({
            "string.base": "password must be a string",
            "any.required": "password is required"
        }),
        deviceType: Joi.string().optional().messages({
            "string.base": "deviceType must be a string",
        }),
        deviceToken: Joi.string().optional().messages({
            "string.base": "deviceToken must be a string",
        }),

    }).or('email', 'phone').messages({
        'object.missing': 'Please Enter Email Or Phone Number',
    })
};
export const send_otpSchema = {
    body: Joi.object({
        email: Joi.string().pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/).messages({
            "string.base": "Email must be a string",
            "string.pattern.base": "Email must be a valid email address (e.g., user@example.com)"
        }),

        phone: Joi.string().optional().pattern(/^[\d\-\+\(\) ]+$/).messages({
            "string.base": "Phone must be a string",
            "string.pattern.base": "Phone number must contain only numbers, dashes, parentheses, and spaces"
        }),

        countryCode: Joi.string().when('phone', {
            is: Joi.exist(),
            then: Joi.required().messages({
                "string.base": "Country Code must be a string",
                "string.pattern.base": "Country Code must be in the format of a valid international country code (e.g., +1 for US, +44 for UK)",
                "any.required": "Country Code is required when phone is provided"
            }),
            otherwise: Joi.optional()
        }),
        type: Joi.number()
            .required().strict()
            .integer()
            .valid(1, 2, 3, 4)
            .messages({
                "number.base": "Type must be a number",
                "number.integer": "Type must be an integer",
                "any.required": "Type is required",
                "any.only": "Type must be one of the following: 1 (register), 2 (resend register), 3 (forget), 4 (resend forget)"
            }),


    }).or('email', 'phone').messages({
        'object.missing': 'Please Enter Email Or Phone Number',
    })
};
export const update_profileSchema = {
    body: Joi.object({
        email: Joi.string().email().lowercase().trim().optional()
            .messages({ "string.email": "Invalid email format" }),

        phone: Joi.string().pattern(/^\d+$/).trim().optional()
            .messages({ "string.pattern.base": "Phone number must contain only digits" }),

        countryCode: Joi.string().trim().optional(),

        firstName: Joi.string().trim().optional(),
        lastName: Joi.string().trim().optional(),

        dashboardRole: Joi.string().trim().optional(),

        bio: Joi.string().trim().optional(),
        address: Joi.string().trim().optional(),

        latitude: Joi.number().optional()
            .messages({ "number.base": "Latitude must be a number" }),

        longitude: Joi.number().optional()
            .messages({ "number.base": "Longitude must be a number" }),

        work: Joi.string().trim().optional(),

        smsNotification: Joi.boolean().optional(),
        emailNotification: Joi.boolean().optional(),

        currentPassword: Joi.string().trim().optional(),
        newPassword: Joi.string().trim().optional()

    })
};
export const write_reviewSchema = {
    body: Joi.object({
        listingId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'listingId must be a hexadecimal string',
            'string.length': 'listingId length must be 24 characters',
            "any.required": "listingId is required in body"
        }),
        hostId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'hostId must be a hexadecimal string',
            'string.length': 'hostId length must be 24 characters',
            "any.required": "hostId is required in body"
        }),
        comment: Joi.string().trim().optional(),
        communication: Joi.number().optional(),
        accuracy: Joi.number().optional(),
        safety: Joi.number().optional(),
        cleanliness: Joi.number().optional(),
        rentAgain: Joi.boolean().optional(),

    })
};


export const change_email_and_phone_numberSchema = {
    body: Joi.object({
        email: Joi.string().email().lowercase().trim().optional()
            .messages({ "string.email": "Invalid newEmail format" }),

        phone: Joi.string().pattern(/^\d+$/).trim().optional()
            .messages({ "string.pattern.base": "Phone number must contain only digits" }),

        countryCode: Joi.string().trim().optional(),

        newOtp: Joi.string().trim().optional(),
        type: Joi.number().valid(1, 2).required().messages({
            "number.base": "Type must be a number",
            "any.required": "Type is required",
            "any.only": "Type must be either 1(email) or 2(phone)"
        }),
        typeFor: Joi.number().valid(1, 2).required().messages({
            "number.base": "TypeFor must be a number",
            "any.required": "TypeFor is required",
            "any.only": "TypeFor must be either 1(sendOtp ) or 2(verify)"
        }),

    })
};