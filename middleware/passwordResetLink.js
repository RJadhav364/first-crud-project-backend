// created passord link

import "../config/dotenv.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import { jwtKey, link } from "../config/common.js";

const generatePasswordLink = (email,id,role) => {
    const token = jwt.sign({email:email, id: id, role: role}, jwtKey, {
        expiresIn: "5m"
    });
    const resetLink = `${link}/${id}/${token}`;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        secure: false,
        auth: {
            user: process.env.MY_GMAIL,
            pass: process.env.MY_PASSWORD
          },
        tls: {
            rejectUnauthorized: true
        },
        logger: false,  // Enable logging to see the underlying network process
        debug: false
    });
    var mailOptions = {
        from: process.env.MY_GMAIL,
        to: email,
        subject: 'Password Reset Request',
        text: `Click on this link to reset your password ${resetLink}`
    };
    transporter.sendMail(mailOptions, function(error, info){
        // console.log("mailOptions",mailOptions)
        if (error) {
            // console.log(transporter)
          console.log("error",error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
}

export default generatePasswordLink;