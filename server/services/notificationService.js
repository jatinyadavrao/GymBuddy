export const sendPushNotification = async (pushToken, payload) => {
  if (!pushToken) return false;

  // Replace this with Firebase/APNs provider in production.
  console.log("Push notification queued", { pushToken, payload });
  return true;
};
