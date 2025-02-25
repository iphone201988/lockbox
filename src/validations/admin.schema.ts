import Joi from 'joi';


export const admin_log_inSchema = {
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
export const user_searchSchema = {
    params: Joi.object({
        userId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'userId must be a hexadecimal string',
            'string.length': 'userId length must be 24 characters',
            "any.required": "userId is required in params"
        }),
    }),
};