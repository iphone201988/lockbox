
import moment from "moment";
import UserModel from "../models/user.model";
import BookingModel from "../models/booking.model";
import ReviewModel from "../models/review.model";
import NotificationModel from "../models/notification.model";

async function notificationForLeaveReview() {
    try {
        const bookings = await BookingModel.find({ type: 'past', status: "approve" }).populate("listingId");
        for (let booking of bookings) {
            const listing = booking.listingId as any;
            const review = await ReviewModel.findOne({ userId: booking.renterId, listingId: listing._id });
            if (review) continue;
            await NotificationModel.create({
                bookingId: booking._id,
                userId: booking.renterId,
                renterId: booking.renterId,
                userRole: "rent",
                hostId: booking.hostId,
                listingId: listing._id,
                type: 1,
                title: `${listing?.spaceType} for storage in ${listing?.city}.`,
                body: `Leave a review for your recent rental.`,
            })

        }


    } catch (err) {
        console.error("Error fetching notificationForLeaveReview:", err);
    }
}

// check out date notification 
async function notificationForCheckout() {
    try {
        const currentDate = moment().startOf('day');

        // Define date ranges
        const today = currentDate.clone();
        const tomorrow = currentDate.clone().add(1, 'days');
        const twoDays = currentDate.clone().add(2, 'days');
        const threeDays = currentDate.clone().add(3, 'days');
        const fourDays = currentDate.clone().add(4, 'days');

        // Query for each time frame
        const bookings = await BookingModel.find({
            type: 'current',
            status: "approve",
            endDate: {
                $gte: currentDate.startOf('day').toDate(),
                $lte: fourDays.endOf('day').toDate()
            }
        }).populate("listingId");

        for (let booking of bookings) {
            const listing = booking.listingId as any;
            const endDate = moment(booking.endDate);
            let message = '';

            // Determine which timeframe this booking falls into
            if (endDate.isSame(today, 'day')) {
                message = 'Your checkout is today!';
            } else if (endDate.isSame(tomorrow, 'day')) {
                message = 'Your checkout is tomorrow!';
            } else if (endDate.isSame(twoDays, 'day')) {
                message = 'Your checkout is in 2 days!';
            } else if (endDate.isSame(threeDays, 'day')) {
                message = 'Your checkout is in 3 days!';
            } else if (endDate.isSame(fourDays, 'day')) {
                message = 'Your checkout is in 4 days!';
            }

            await NotificationModel.create({
                bookingId: booking._id,
                userId: booking.renterId,
                renterId: booking.renterId,
                userRole: "rent",
                hostId: booking.hostId,
                listingId: listing._id,
                type: 3,
                title: `${listing?.spaceType} for storage in ${listing?.city}.`,
                body: `${message} Date: ${endDate.format('MMM DD, YYYY')}`
            });
        }
    } catch (err) {
        console.error("Error fetching notificationForCheckout:", err);
    }
}
async function changeFutureToCurrent() {
    try {
        const bookings = await BookingModel.find({
            type: 'future', status: "approve", startDate: { $lte: new Date() }
        });

        // Loop through each booking and update it
        for (let booking of bookings) {
            booking.type = 'current';
            await booking.save();
            console.log(`Updated booking ${booking._id} to current`);
        }

    } catch (err) {
        console.error("Error fetching notificationForLeaveReview:", err);
    }
}
async function changeCurrentToPast() {
    try {
        const bookings = await BookingModel.find({
            type: 'current', status: "approve", endDate: { $lt: new Date() }
        });

        // Loop through each booking and update it
        for (let booking of bookings) {
            booking.type = 'past';
            await booking.save();
            console.log(`Updated booking ${booking._id} to past`);
        }

    } catch (err) {
        console.error("Error fetching notificationForLeaveReview:", err);
    }
}

export { notificationForLeaveReview, notificationForCheckout, changeFutureToCurrent, changeCurrentToPast };
