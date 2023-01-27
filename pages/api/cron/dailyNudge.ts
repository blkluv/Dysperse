const webPush = require("web-push");
import { DispatchNotification } from "../../../lib/notification";
import { prisma } from "../../../lib/prismaClient";

const Notification = async (req, res) => {
  if (
    req.headers.authorization !== `Bearer ${process.env.COACH_CRON_API_KEY}` &&
    process.env.NODE_ENV === "production"
  ) {
    res.status(401).json({
      currentHeaders: req.headers.authorization,
      error: "Unauthorized",
    });
    return;
  }
  // Select user's push notification subscription URL, also asking one of their incompleted goals.
  let subscriptions = await prisma.notificationSettings.findMany({
    where: {
      dailyRoutineNudge: true,
    },
    select: {
      user: {
        select: {
          notificationSubscription: true,
          RoutineItem: {
            select: {
              id: true,
            },
            where: {
              completed: false,
            },
          },
        },
      },
    },
  });

  // Make sure that user actually has goals (which aren't completed!)
  subscriptions = subscriptions.filter(
    (subscription) => subscription.user.RoutineItem.length > 0
  );

  webPush.setVapidDetails(
    `mailto:${process.env.WEB_PUSH_EMAIL}`,
    process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
    process.env.WEB_PUSH_PRIVATE_KEY
  );

  // For each user
  for (let i = 0; i < subscriptions.length; i++) {
    const subscription = subscriptions[i];
    const { notificationSubscription }: any = subscription.user;
    try {
      await DispatchNotification({
        title: "Let's work on your goals!",
        body: "Tap to start your daily routine",
        actions: [
          {
            title: "⚡ Start my daily routine",
            action: "startDailyRoutine",
          },
        ],
        subscription: notificationSubscription,
      });
    } catch (error) {
      // If there's an error, log it
      console.log(error);
    }
  }

  res.status(200).json({ message: "Notification sent" });
};

export default Notification;
