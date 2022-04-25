      
//     const booking = await BookingSchema.findOne({
//       bookingUserId: this.data,
//     })
//       .populate(
//         "apartmentId bookingUserId apartmentOwnerId",
//         "apartmentName profilePicture apartmentImages _id userId email fullName companyName"
//       )
//       .orFail(() => {
//         throwError(`Booking not found`, 404);
//       });
//     const { status } = await flutterResponse(this.data);

//     // const booking = await BookingSchema.findOne({
//     //   paystackReference: this.data,
//     // })
//     //   .populate(
//     //     "apartmentId bookingUserId apartmentOwnerId",
//     //     "apartmentName profilePicture apartmentImages _id userId email fullName companyName"
//     //   )
//     //   .orFail(() => {
//     //     throwError(`Booking not found`, 404);
//     //   });
//     // const { status, paymentDate } = await verifyPayment(this.data);
// if (booking.paymentStatus === "SUCCESS") {
//   booking.paymentDate = paymentDate;
//   booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
//   const transactionDetails = {
//     userId: booking.bookingUserId,
//     amount: booking.bookingAmount,
//     reason: "Booking payment",
//     type: TRANSACTION_TYPE.WITHDRAWAL,
//     reference: "WD" + Date.now().valueOf() + "REF",
//     paymentDate,
//   };
//     if ((booking.paymentStatus = status.toUpperCase())) {
//       if (booking.paymentStatus === "SUCCESS") {
//         booking.paymentDate = paymentDate;
//         booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
//         const transactionDetails = {
//           userId: booking.bookingUserId,
//           amount: booking.bookingAmount,
//           reason: "Booking payment",
//           type: TRANSACTION_TYPE.WITHDRAWAL,
//           reference: "WD" + Date.now().valueOf() + "REF",
//           paymentDate,
//         };
//         await Transaction.createTransaction(transactionDetails);
//         const notificationDetailsUser = {
//           bookingUserId: booking.bookingUserId,
//           bookingId: booking._id,
//           message: `${booking.apartmentId.apartmentName} booking has been confirmed`,
//           image: booking.apartmentId.apartmentImages[0],
//           price: booking.bookingAmount,
//           apartmentId: booking.apartmentId._id,
//           notificationType: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
//         };
//         Notification.createNotification(notificationDetailsUser);
//         const notificationDetailsBusinessAndIndividual = {
//           apartmentOwnerId: booking.apartmentId.userId,
//           bookingId: booking._id,
//           message: `${booking.apartmentId.apartmentName} booking has been confirmed`,
//           image: booking.apartmentId.apartmentImages[0],
//           price: booking.bookingAmount,
//           apartmentId: booking.apartmentId._id,
//           notificationType: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
//         };
//         Notification.createNotification(
//           notificationDetailsBusinessAndIndividual
//         );
//         bookingEmail(
//           booking.bookingUserId.fullName,
//           booking.bookingUserId.email,
//           booking.apartmentId.apartmentName,
//           booking.checkInDate,
//           booking.checkOutDate,
//           booking.bookingAmount,
//           booking.bookingOrderId
//         );
//         bookingEmail(
//           booking.apartmentOwnerId.fullName ||
//             booking.apartmentOwnerId.companyName,
//           booking.apartmentOwnerId.email,
//           booking.apartmentId.apartmentName,
//           booking.checkInDate,
//           booking.checkOutDate,
//           booking.bookingAmount,
//           booking.bookingOrderId
//         );
//         await booking.save();
//       }
//       return booking;
//     } else {
//       throwError(`Payment failed Please Try again`, 400);
//     }