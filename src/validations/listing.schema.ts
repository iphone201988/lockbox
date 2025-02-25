import Joi from 'joi';

export const create_listingSchema = {
    body: Joi.object({
        address: Joi.string()
            .trim()
            .required()
            .messages({ "string.empty": "Address is required" }),

        latitude: Joi.number()
            .required()
            .messages({ "number.base": "Latitude must be a number" }),

        longitude: Joi.number()
            .required()
            .messages({ "number.base": "Longitude must be a number" }),

        spaceType: Joi.string()
            .trim()
            .optional(),

        features: Joi.alternatives().try(
            Joi.array().items(Joi.string().trim()),
            Joi.string().trim()
        ).optional()
            .messages({ "array.base": "Features must be an array of strings" }),

        allowedStorage: Joi.alternatives().try(
            Joi.array().items(Joi.string().trim()),
            Joi.string().trim()
        ).optional()
            .messages({ "number.base": "Allowed storage must be a number" }),

        length: Joi.number()
            .optional()
            .messages({ "number.base": "Length must be a number" }),

        width: Joi.number()
            .optional()
            .messages({ "number.base": "Width must be a number" }),

        price: Joi.number()
            .required()
            .messages({ "number.base": "Price must be a number" }),

        tagline: Joi.string()
            .trim()
            .optional(),

        description: Joi.string()
            .trim()
            .optional(),

        policies: Joi.string()
            .trim()
            .optional(),

        accessPolicy: Joi.string()
            .trim()
            .optional(),

        frequency: Joi.string()
            .trim()
            .optional(),

        verified: Joi.boolean()
            .optional()
            .messages({ "boolean.base": "Verified must be a boolean" }),

    })
};
export const get_my_listingSchema = {
    query: Joi.object({
        page: Joi.number().integer().optional().default(1),
        limit: Joi.number().integer().optional().default(10),
    }),
};
export const find_listingSchema = {
    query: Joi.object({
        page: Joi.number().integer().optional().default(1),
        limit: Joi.number().integer().optional().default(10),
        latitude: Joi.string().trim().optional(),
        longitude: Joi.string().trim().optional(),
        sort: Joi.string().trim().optional().default('recommend'),
        features: Joi.string().trim().optional(),
        price: Joi.number().integer().optional(),
        allowedStorage: Joi.string().optional(),
        length: Joi.string().trim().optional(),
        width: Joi.string().trim().optional(),
    }),
};
export const listing_by_idSchema = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required().messages({
            'string.hex': 'id must be a hexadecimal string',
            'string.length': 'id length must be 24 characters',
            "any.required": "Id is required in params"
        }),
    }),
};
export const disputeSchema = {
    params: Joi.object({
        bookingId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'bookingId must be a hexadecimal string',
            'string.length': 'bookingId length must be 24 characters',
            "any.required": "bookingId is required in params"
        }),
    }),
    body: Joi.object({
        desc: Joi.string().required().messages({
            "string.empty": "desc is required",
        })
    })
};

export const booking_statusSchema = {
    body: Joi.object({
        status: Joi.string().required().messages({
            "string.empty": "status is required",
        }),
        bookingId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'bookingId must be a hexadecimal string',
            'string.length': 'bookingId length must be 24 characters',
            "any.required": "bookingId is required in params"
        }),
    })
};
export const check_inSchema = {
    body: Joi.object({
        note: Joi.string().required().messages({
            "string.empty": "note is required",
        }),
        agree: Joi.boolean().optional(),
        checkInDate: Joi.date().optional(),
        bookingId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'bookingId must be a hexadecimal string',
            'string.length': 'bookingId length must be 24 characters',
            "any.required": "bookingId is required in params"
        }),
    })
};
export const update_listingSchema = {
    body: Joi.object({
        address: Joi.string()
            .trim()
            .optional(),

        latitude: Joi.number()
            .optional(),

        longitude: Joi.number()
            .optional(),

        spaceType: Joi.string()
            .trim()
            .optional(),

        images: Joi.alternatives().try(
            Joi.array().items(Joi.string().trim()),
            Joi.string().trim()
        ).optional()
            .messages({ "array.base": "images must be an array of strings" }),
        features: Joi.alternatives().try(
            Joi.array().items(Joi.string().trim()),
            Joi.string().trim()
        ).optional()
            .messages({ "array.base": "Features must be an array of strings" }),

        allowedStorage: Joi.alternatives().try(
            Joi.array().items(Joi.string().trim()),
            Joi.string().trim()
        ).optional()
            .messages({ "number.base": "Allowed storage must be a number" }),

        length: Joi.number()
            .optional()
            .messages({ "number.base": "Length must be a number" }),

        width: Joi.number()
            .optional()
            .messages({ "number.base": "Width must be a number" }),

        price: Joi.number()
            .optional(),

        tagline: Joi.string()
            .trim()
            .optional(),

        description: Joi.string()
            .trim()
            .optional(),

        policies: Joi.string()
            .trim()
            .optional(),

        accessPolicy: Joi.string()
            .trim()
            .optional(),

        frequency: Joi.string()
            .trim()
            .optional(),

        verified: Joi.boolean()
            .optional()
            .messages({ "boolean.base": "Verified must be a boolean" }),

    })
};