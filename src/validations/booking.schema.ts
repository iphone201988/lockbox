import Joi from 'joi';

export const request_bookingSchema = {
    body: Joi.object({
        listingId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'listingId must be a hexadecimal string',
            'string.length': 'listingId length must be 24 characters',
            "any.required": "listingId is required in params"
        }),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        content: Joi.string().optional(),
        amount: Joi.number().optional(),
        tax: Joi.number().optional(),
        serviceFee: Joi.number().optional(),
        totalAmount: Joi.number().optional(),

        currency: Joi.string().optional(),
        paymentMethodId: Joi.string().optional(),
        insuranceId: Joi.string().hex().length(24).optional().messages({
            'string.hex': 'insuranceId must be a hexadecimal string',
            'string.length': 'insuranceId length must be 24 characters',
        }),
        hostId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'hostId must be a hexadecimal string',
            'string.length': 'hostId length must be 24 characters',
            "any.required": "hostId is required in body"
        }),
    })
};
export const check_availabilitychema = {
    query: Joi.object({
        listingId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'listingId must be a hexadecimal string',
            'string.length': 'listingId length must be 24 characters',
            "any.required": "listingId is required in query"
        }),
        startDate: Joi.string().required().messages({
            "any.required": "startDate is required in query"

        }),
        endDate: Joi.string().required().messages({
            "any.required": "endDate is required in query"
        }),
    }),
};
export const get_my_bokingchema = {
    query: Joi.object({
        page: Joi.number().integer().optional().default(1),
        limit: Joi.number().integer().optional().default(10),
        type: Joi.string().optional().default("future")
    }),
};