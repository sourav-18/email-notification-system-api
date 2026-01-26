const nodemailer = require('nodemailer');
const queueController=require("../controllers/queue.controller");
const mongoDbConstant = require("../db/mongo/constant.mongo");

function getTransporter(user, pass) {
    return nodemailer.createTransport({
        service: 'gmail', // Use your email provider
        auth: {
            user: user,
            pass: pass
        }
    });
}


exports.sendMail = async ({notificationId,emailUserName, emailPassword, receiverEmailId, subject, text}) => {
    const transporter = getTransporter(emailUserName,emailPassword);
    const mailOptions = {
        from: emailUserName,
        to: receiverEmailId,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            queueController.updateStatus(notificationId,mongoDbConstant.notificationQueue.status.attempt);
        } else {
            queueController.updateToSuccess(notificationId);
            console.log('Email sent: ' + info.response);
        }
    });
};