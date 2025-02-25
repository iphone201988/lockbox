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
        hostId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'hostId must be a hexadecimal string',
            'string.length': 'hostId length must be 24 characters',
            "any.required": "hostId is required in params"
        }),
    })
};
