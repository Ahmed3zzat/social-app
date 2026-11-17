import { EventEmitter } from "events";
import sendEmail, { subjects } from "./sendEmailFile.js";
import { signUp } from "./generatorHtml.js";
import { generateToken } from "../token/token.js";

export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async ({email, otp}) => {
  // console.log("Email event triggered:", emailData);

  await sendEmail({
    to: email,
    subject: subjects.WELCOME,
    html: signUp(otp),
  }).catch((error) => {
    console.error("Failed to send verification email:", error);
  });
});
