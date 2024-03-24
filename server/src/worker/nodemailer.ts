import nodemailer from "nodemailer";
import { UpdatedEntry } from "./event_loop";
import Mail from "nodemailer/lib/mailer";

export async function sendPriceChangeEmails(updatedEntry: UpdatedEntry[]) {
  const perEntryHTML = updatedEntry.map((entry) => {
    return `
      <div>
        <h2>${entry.name}</h2>
        <p>Price changed from ${entry.beforePrice} to ${entry.afterPrice}</p>
        <a href="${entry.url}">View product</a>
      </div>
    `;
  });
  const html = `
    <h1>Price changes</h1>
    ${perEntryHTML.join("")}
  `;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions: Mail.Options = {
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: "Pricetrak'd",
    html,
  };

  const result = new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
  await result;
}
