
const nodemailer = require("nodemailer");

module.exports = send;

async function send(user, code){

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth:{
          user: process.env.NODE_GMAIL_USER,
          pass: process.env.NODE_GMAIL_PASS
        }  
    });
    console.log("sending mail to: ", user);
    await transporter.sendMail({
        to:user,
        subject:"One Time Password",
        html:`
        <h1>This is your OTP</h1>
        <h2>${code}</h2>
        <i>this code expires in 60 seconds</i>
        `
    });
}