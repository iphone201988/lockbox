import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../middleware/uploadImage";
import { validate } from "../middleware/validate.middleware";
import { createListing, findListings, getAllListings, getListingById } from "../controllers/listing.controller";
import { booking_statusSchema, check_inSchema, create_listingSchema, disputeSchema, find_listingSchema, get_my_listingSchema, listing_by_idSchema } from "../validations/listing.schema";
import { bookingStatusUpdate, cleckInBooking, disputeStorage, requestBooking } from "../controllers/booking.controller";
import { request_bookingSchema } from "../validations/booking.schema";
const bookingRouter = express.Router();

bookingRouter.post('/request', authMiddleware, validate(request_bookingSchema), requestBooking);
bookingRouter.get('/me',authMiddleware, validate(get_my_listingSchema), getAllListings);
bookingRouter.get('/find_listing',authMiddleware, validate(find_listingSchema), findListings);
bookingRouter.get('/:id',authMiddleware, validate(listing_by_idSchema), getListingById);
bookingRouter.put('/:bookingId/status', authMiddleware, validate(booking_statusSchema),  bookingStatusUpdate);
bookingRouter.post('/dispute_storage', authMiddleware, upload.array("images"), validate(disputeSchema), disputeStorage);
bookingRouter.post('/cleck_in', authMiddleware, upload.array("images"), validate(check_inSchema), cleckInBooking);









export default bookingRouter;