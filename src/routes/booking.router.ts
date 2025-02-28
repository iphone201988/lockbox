import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../middleware/uploadImage";
import { validate } from "../middleware/validate.middleware";
import { booking_statusSchema, check_inSchema, disputeSchema,  } from "../validations/listing.schema";
import { bookingStatusUpdate, checkBooking, cleckInBooking, disputeStorage, getAllBookingOfHost, getAllBookingOfRenter, getInsurancePlan, requestBooking } from "../controllers/booking.controller";
import { check_availabilitychema, get_my_bokingchema, request_bookingSchema } from "../validations/booking.schema";
const bookingRouter = express.Router();

bookingRouter.post('/request', authMiddleware, validate(request_bookingSchema), requestBooking);
bookingRouter.get('/check_availability', authMiddleware, validate(check_availabilitychema), checkBooking);
bookingRouter.get('/rent_booking',authMiddleware, validate(get_my_bokingchema), getAllBookingOfRenter);
bookingRouter.get('/host_booking',authMiddleware, validate(get_my_bokingchema), getAllBookingOfHost);
bookingRouter.put('/:bookingId/status', authMiddleware, validate(booking_statusSchema),  bookingStatusUpdate);
bookingRouter.post('/dispute_storage', authMiddleware, upload.array("images"), validate(disputeSchema), disputeStorage);
bookingRouter.post('/cleck_in', authMiddleware, upload.array("images"), validate(check_inSchema), cleckInBooking);




bookingRouter.get('/insurance_plan',authMiddleware, getInsurancePlan);





export default bookingRouter;