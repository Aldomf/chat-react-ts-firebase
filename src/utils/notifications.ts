// import { getMessaging } from "firebase/messaging";

// export const sendNotification = async (token: string, title: string, body: string) => {
//   const messaging = getMessaging();
//   const payload = {
//     notification: {
//       title: title,
//       body: body,
//     },
//   };

//   try {
//     await messaging.sendToDevice(token, payload);
//     console.log('Notification sent successfully');
//   } catch (error) {
//     console.error('Error sending notification:', error);
//   }
// };