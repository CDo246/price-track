import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "redacted",
      pass: "redacted",
    },
  });

  const mailOptions = {
    from: "your_email@gmail.com",
    to: "redacted",
    subject: "Hello from Nodemailer",
    text: "This is a test email sent using Nodemailer.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });

  export type ProductPriceChange = {
    name: string;
    url: string;
    oldPrice: number;
    newPrice: number;
  }

  export async function sendPriceChangeEmail(products: ProductPriceChange[]) {

  }