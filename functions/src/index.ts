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
      const threshold = 100;
      logger.info(`value ${sensorData}`);
      logger.info(`thresh ${threshold}`);
      logger.info(serviceAccountObject);
      logger.info("after serve");

      if (sensorData > threshold) {
        logger.info("sign na to");
        const registeredUsersSnapshot = await admin.database()
          .ref("/Registered Users")
          .once("value");

        const employeesSnapshot = await admin.database()
          .ref("/Employees")
          .once("value");

        const userIds: string[] = [];
        const userTokens: { [key: string]: string } = {};

        // Add registered users to the user list
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

        // Add employees to the user list
        employeesSnapshot.forEach((employeeSnapshot) => {
          const employeeId = employeeSnapshot.key;
          const employeeToken = employeeSnapshot.child("token").val();

          if (!employeeToken) {
            logger.info(`Employee ${employeeId} has no token registered.`);
          } else if (employeeId) {
            userTokens[employeeId] = employeeToken;
            logger.info(`Employee ${employeeId} has token ${employeeToken}`);
            userIds.push(employeeId);
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
                    body: `MQ2 value is ${sensorData}, 
                    which is above the threshold of ${threshold}`,
                    // imageUrl: "https://firebasestorage.googleapis.com/v0/b/pyronnoia-280b1.appspot.com/o/pyrologo.png?alt=media&token=b614f0c7-946f-448d-8949-fb321b9ded38",
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

        logger.info(`Threshold passed: ${sensorData}`);
        logger.info("Notification sent to all registered users and employees.");
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
      const threshold = -39;
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

        logger.info(`Threshold passed: ${sensorData}`);
        logger.info("Notifications sent to all registered users.");
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
                    body: "FLAME DETECTED!",
                    // imageUrl: "https://firebasestorage.googleapis.com/v0/b/pyronnoia-280b1.appspot.com/o/pyrologo.png?alt=media&token=b614f0c7-946f-448d-8949-fb321b9ded38",
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
        logger.info(`Threshold passed: ${sensorData}`);
        logger.info("Notifications sent to all registered users.");
      } else {
        logger.info("Threshold not passed.");
      }

      return null;
    } catch (error) {
      logger.error("Error occurred:", error);
      return null;
    }
  });
