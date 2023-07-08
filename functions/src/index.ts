import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

import serviceAccount from
  "../pyronnoia-280b1-firebase-adminsdk-p8ewp-cc460d44d8.json";

const serviceAccountObject = JSON.parse(JSON.stringify(serviceAccount));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountObject),
  databaseURL: "https://pyronnoia-280b1-default-rtdb.firebaseio.com/",
});

export const mq2Detected = functions.database
  .ref("/Sensor Data/{userId}/mq2")
  .onUpdate(async (change, context) => {
    try {
      const sensorData = change.after.val();
      const threshold = 20;
      logger.info(`value ${sensorData}`);
      logger.info(`thresh ${threshold}`);
      logger.info(serviceAccountObject);
      logger.info("after serve");

      if (sensorData > threshold) {
        logger.info("sign na to");
        const registeredUsersSnapshot = await admin.database()
          .ref("/Registered Users")
          .once("value");

        const userTokens: { [key: string]: string } = {};

        // Add registered users to the userTokens object
        registeredUsersSnapshot.forEach((userSnapshot) => {
          const userId = userSnapshot.key;
          const userToken = userSnapshot.child("token").val();

          if (!userToken) {
            logger.info(`User ${userId} has no token registered.`);
          } else if (userId) {
            userTokens[userId] = userToken;
            logger.info(`User ${userId} has token ${userToken}`);
          }
        });

        const notifications = [];

        for (const userId in userTokens) {
          if (userId !== context.params.userId && userTokens[userId]) {
            const userToken = userTokens[userId];

            if (typeof userToken === "string" && userToken.trim() !== "") {
              notifications.push(
                admin.messaging().sendToDevice(userToken, {
                  data: {
                    MQ2Pass: "true",
                  },
                  notification: {
                    title: "Threshold Passed",
                    body: `MQ2 value is ${sensorData}, 
                    which is above the threshold of ${threshold}`,
                    // imageUrl: "https://firebasestorage.googleapis.com/v0/b/pyronnoia-280b1.appspot.com/o/pyrologo.png?alt=media&token=b614f0c7-946f-448d-8949-fb321b9ded38",
                    click_action: "OPEN_ACTIVITY",
                    priority: "high",
                    color: "#FF0000",
                    sound: "https://firebasestorage.googleapis.com/v0/b/pyronnoia-280b1.appspot.com/o/FireAlarm.mp3?alt=media&token=5b96bda4-6de2-478c-963c-9bca8501380f",
                  },
                })
              );
              logger.info(`Notification sent to user ${userId}`);
            } else {
              logger.info(`Invalid token for user ${userId}, ${userToken}`);
            }
          }
        }

        await Promise.all(notifications);

        logger.info(`Threshold passed: ${sensorData}`);

        // Update the /Sensor Data/{userId}/status path with the value "true"
        admin.database()
          .ref(`/Sensor Data/${context.params.userId}/mq2Status`)
          .set("true")
          .then(() => {
            logger.info(`Status updated for user ${context.params.userId}`);
          })
          .catch((error) => {
            logger.error(`Failed to update status for user
            ${context.params.userId}:
            ${error}`);
          });

        // Retrieve all values of child nodes under /Sensor Data/{userId}
        const sensorDataSnapshot = await admin.database()
          .ref(`/Sensor Data/${context.params.userId}`)
          .once("value");
        const sensorDataValues = sensorDataSnapshot.val();

        // Retrieve all child nodes under /Registered Users/
        const registeredUserSnapshot = await admin.database()
          .ref("/Registered Users/")
          .once("value");
        const registeredUserDataValues = registeredUserSnapshot.val();

        // Convert the timestamp to a human-readable
        // date and time format (Philippine time)
        const timestamp = Date.now();
        const date = new Date(timestamp).toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });

        // Write to the logs node with a reference to /Sensor Data/{userId}/
        const logsRef = admin.database().ref("/Logs");
        const newLogRef = logsRef.push();
        const logData = {
          timestamp: date,
          userData: registeredUserDataValues,
          sensorDataValues: sensorDataValues,
          isread: "false",
        };
        newLogRef.set(logData);
      } else {
        logger.info("Threshold not passed.");
      }


      return null;
    } catch (error) {
      logger.error("Error occurred:", error);
      return null;
    }
  });

export const mq135Detected = functions.database
  .ref("/Sensor Data/{userId}/mq135")
  .onUpdate(async (change, context) => {
    try {
      const sensorData = change.after.val();
      const threshold = 0;
      logger.info(`value ${sensorData}`);
      logger.info(`thresh ${threshold}`);
      logger.info(serviceAccountObject);
      logger.info("after serve");

      if (sensorData > threshold) {
        logger.info("sign na to");
        const registeredUsersSnapshot = await admin.database()
          .ref("/Registered Users")
          .once("value");

        const userIds: string[] = [];
        const userTokens: { [key: string]: string } = {};
        registeredUsersSnapshot.forEach((userSnapshot) => {
          const userId = userSnapshot.key;
          const userToken = userSnapshot.child("token").val();

          if (!userToken) {
            logger.info(`User ${userId} has no token registered.`);
          } else if (userId) {
            userTokens[userId] = userToken;
            logger.info(`User ${userId} has token ${userToken}`);
            userIds.push(userId);
          }
        });

        const notifications = [];

        for (const userId of userIds) {
          if (userId !== context.params.userId && userTokens[userId]) {
            const userToken = userTokens[userId];

            if (typeof userToken === "string" && userToken.trim() !== "") {
              notifications.push(
                admin.messaging().sendToDevice(userToken, {
                  notification: {
                    title: "Threshold Passed",
                    body: `MQ135 value is ${sensorData}, 
                    which is above the threshold of ${threshold}`,
                    // imageUrl: "https://firebasestorage.googleapis.com/v0/b/pyronnoia-280b1.appspot.com/o/pyrologo.png?alt=media&token=b614f0c7-946f-448d-8949-fb321b9ded38",
                    sound: "alarm",
                    click_action: "OPEN_ACTIVITY",
                    priority: "high",
                    color: "#FF0000",
                  },
                })
              );
              logger.info(`Notification sent to user ${userId}`);
            } else {
              logger.info(`Invalid token for user ${userId}, ${userToken}`);
            }
          }
        }

        await Promise.all(notifications);
        // Update the /Sensor Data/{userId}/status path with the value "true"
        admin.database()
          .ref(`/Sensor Data/${context.params.userId}/mq135Status`)
          .set("true")
          .then(() => {
            logger.info(`Status updated for user ${context.params.userId}`);
          })
          .catch((error) => {
            logger.error(`Failed to update status for user
            ${context.params.userId}:
            ${error}`);
          });

        logger.info(`Threshold passed: ${sensorData}`);
        logger.info("Notifications sent to all registered users.");
        // Retrieve all values of child nodes under /Sensor Data/{userId}
        const sensorDataSnapshot = await admin.database()
          .ref(`/Sensor Data/${context.params.userId}`)
          .once("value");
        const sensorDataValues = sensorDataSnapshot.val();

        // Retrieve all child nodes under /Registered Users/
        const registeredUserSnapshot = await admin.database()
          .ref("/Registered Users/")
          .once("value");
        const registeredUserDataValues = registeredUserSnapshot.val();

        // Convert the timestamp to a human-readable
        // date and time format (Philippine time)
        const timestamp = Date.now();
        const date = new Date(timestamp).toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });

        // Write to the logs node with a reference to /Sensor Data/{userId}/
        const logsRef = admin.database().ref("/Logs");
        const newLogRef = logsRef.push();
        const logData = {
          timestamp: date,
          userData: registeredUserDataValues,
          sensorDataValues: sensorDataValues,
          isread: "false",
        };
        newLogRef.set(logData);
      } else {
        logger.info("Threshold not passed.");
      }


      return null;
    } catch (error) {
      logger.error("Error occurred:", error);
      return null;
    }
  });

export const flameDetected = functions.database
  .ref("/Sensor Data/{userId}/flame")
  .onUpdate(async (change, context) => {
    try {
      const sensorData = change.after.val();
      logger.info(`value ${sensorData}`);
      logger.info("flametrue");
      logger.info(serviceAccountObject);
      logger.info("after serve");

      if (sensorData === true) {
        logger.info("sign na to");
        const registeredUsersSnapshot = await admin.database()
          .ref("/Registered Users")
          .once("value");

        const userIds: string[] = [];
        const userTokens: { [key: string]: string } = {};
        const fullNames: string[] = []; // Array to store full names

        registeredUsersSnapshot.forEach((userSnapshot) => {
          const userId = userSnapshot.key;
          const userToken = userSnapshot.child("token").val();
          const fullName = userSnapshot
            .child("fullname").val(); // Get full name

          if (!userToken) {
            logger.info(`User ${userId} has no token registered.`);
          } else if (userId) {
            userTokens[userId] = userToken;
            logger.info(`User ${userId} has token ${userToken}`);
            userIds.push(userId);
            fullNames.push(fullName); // Store full name in the array
          }
        });

        const notifications = [];

        for (const userId of userIds) {
          if (userId !== context.params.userId && userTokens[userId]) {
            const userToken = userTokens[userId];

            if (typeof userToken === "string" && userToken.trim() !== "") {
              notifications.push(
                admin.messaging().sendToDevice(userToken, {
                  notification: {
                    title: "Threshold Passed",
                    body: "FLAME DETECTED!",
                    click_action: "OPEN_ACTIVITY",
                    priority: "high",
                    color: "#FF0000",
                    sound: "alarm.mp3",
                  },
                })
              );
              logger.info(`Notification sent to user ${userId}`);
            } else {
              logger.info(`Invalid token for user ${userId}, ${userToken}`);
            }
          }
        }


        // Update the /Sensor Data/{userId}/status path with the value "true"
        admin.database()
          .ref(`/Sensor Data/${context.params.userId}/flameStatus`)
          .set("true")
          .then(() => {
            logger.info(`Status updated for user ${context.params.userId}`);
          })
          .catch((error) => {
            logger.error(`Failed to update status for user 
            ${context.params.userId}: ${error}`);
          });
        logger.info("Notifications sent to all registered users.");
        // Retrieve all values of child nodes under /Sensor Data/{userId}
        const sensorDataSnapshot = await admin.database()
          .ref(`/Sensor Data/${context.params.userId}`)
          .once("value");
        const sensorDataValues = sensorDataSnapshot.val();

        // Retrieve all child nodes under /Registered Users/
        const registeredUserSnapshot = await admin.database()
          .ref("/Registered Users/")
          .once("value");
        const registeredUserDataValues = registeredUserSnapshot.val();

        // Convert the timestamp to a human-readable
        // date and time format (Philippine time)
        const timestamp = Date.now();
        const date = new Date(timestamp).toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });

        // Write to the logs node with a reference to /Sensor Data/{userId}/
        const logsRef = admin.database().ref("/Logs");
        const newLogRef = logsRef.push();
        const logData = {
          timestamp: date,
          userData: registeredUserDataValues,
          sensorDataValues: sensorDataValues,
          isread: "false",
        };
        newLogRef.set(logData);
      } else {
        logger.info("Threshold not passed.");
      }


      return null;
    } catch (error) {
      logger.error("Error occurred:", error);
      return null;
    }
  });


// For employees:
export const Emq2Detected = functions.database
  .ref("/Sensor Data/{userId}/status")
  .onUpdate(async (change, context) => {
    try {
      const sensorData = change.after.val();
      logger.info(`value ${sensorData}`);
      logger.info("notifstatus");
      logger.info(serviceAccountObject);
      logger.info("after serve");

      if (sensorData === "true") {
        logger.info("sign na to");
        const employeesSnapshot = await admin.database()
          .ref("/Employees")
          .once("value");

        const userTokens: { [key: string]: string } = {};

        // Add employees to the userTokens object
        employeesSnapshot.forEach((employeeSnapshot) => {
          const employeeId = employeeSnapshot.key;
          const employeeToken = employeeSnapshot.child("token").val();

          if (!employeeToken) {
            logger.info(`Employee ${employeeId} has no token registered.`);
          } else if (employeeId) {
            userTokens[employeeId] = employeeToken;
            logger.info(`Employee ${employeeId} has token ${employeeToken}`);
          }
        });

        const notifications = [];

        for (const userId in userTokens) {
          if (userId !== context.params.userId && userTokens[userId]) {
            const userToken = userTokens[userId];

            if (typeof userToken === "string" && userToken.trim() !== "") {
              notifications.push(
                admin.messaging().sendToDevice(userToken, {
                  data: {
                    MQ2Pass: "true",
                  },
                  notification: {
                    title: "Threshold Passed(Employee)",
                    body: "EMPLOYEE ALERT",
                    // imageUrl: "https://firebasestorage.googleapis.com/v0/b/pyronnoia-280b1.appspot.com/o/pyrologo.png?alt=media&token=b614f0c7-946f-448d-8949-fb321b9ded38",
                    click_action: "OPEN_ACTIVITY",
                    priority: "high",
                    color: "#FF0000",

                  },
                })
              );
              logger.info(`Notification sent to employee ${userId}`);
            } else {
              logger.info(`Invalid token for epmloyee ${userId}, ${userToken}`);
            }
          }
        }

        await Promise.all(notifications);

        logger.info(`Threshold passed: ${sensorData}`);

        // Update the /Sensor Data/{userId}/status path with the value "true"
        // admin.database()
        //   .ref(`/Sensor Data/${context.params.userId}/status`)
        //   .set("true")
        //   .then(() => {
        //     logger.info(`Status updated for user ${context.params.userId}`);
        //   })
        //   .catch((error) => {
        //     logger.error(`Failed to update status for user
        //     ${context.params.userId}:
        //     ${error}`);
        //   });
      } else {
        logger.info("Threshold not passed(employee).");
      }

      return null;
    } catch (error) {
      logger.error("Error occurred:", error);
      return null;
    }
  });
