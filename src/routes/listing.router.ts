import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import upload from "../middleware/uploadImage";
import { validate } from "../middleware/validate.middleware";
import { createListing, findListings, getAllListings, getListingById, updateListing } from "../controllers/listing.controller";
import { create_listingSchema, find_listingSchema, get_my_listingSchema, listing_by_idSchema, update_listingSchema } from "../validations/listing.schema";
const listingRouter = express.Router();

listingRouter.post('/create',authMiddleware, upload.array("storageImages"), validate(create_listingSchema), createListing);
listingRouter.get('/me',authMiddleware, validate(get_my_listingSchema), getAllListings);
listingRouter.get('/find_listing',authMiddleware, validate(find_listingSchema), findListings);
listingRouter.get('/:id',authMiddleware, validate(listing_by_idSchema), getListingById);
listingRouter.put('/:id',authMiddleware, upload.array("storageImages"), validate(update_listingSchema), updateListing);








export default listingRouter;