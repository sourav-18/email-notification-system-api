const nodemailer = require('nodemailer');
const queueController = require("../controllers/queue.controller");
const mongoDbConstant = require("../db/mongo/constant.mongo");
const envUtil = require("../utils/env.util");

function getTransporter(user, pass) {
    return nodemailer.createTransport({
        service: 'gmail', // Use your email provider
        auth: {
            user: user,
            pass: pass
        }
    });
}


exports.sendMail = async ({ notificationId, emailUserName, emailPassword, receiverEmailId, subject, text }) => {
    const transporter = getTransporter(emailUserName, emailPassword);
    const mailOptions = {
        from: emailUserName,
        to: receiverEmailId,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            queueController.updateToError(notificationId, error.message);
        } else {
            queueController.updateToSuccess(notificationId);
            console.log('Email sent: ' + info.response);
        }
        transporter.close()
    });
};

const transporter = getTransporter(envUtil.SERVER_EMAIL_USERNAME, envUtil.SERVER_EMAIL_PASSWORD);

exports.sendOrganizationPassword = (organizationEmailId, password) => {

    const mailOptions = {
        from: envUtil.SERVER_EMAIL_USERNAME,
        to: organizationEmailId,
        subject: 'Your Organization Account Credentials',
        text: `Hello,

Your organization account has been successfully created.

Please find your login credentials below:

Email: ${organizationEmailId}
Password: ${password}

For security reasons, we strongly recommend that you change your password after your first login.

If you have any questions or need assistance, feel free to contact our support team.

    Best regards,
    Support Team`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error sending organization password email:', error);
        } else {
            // console.log('Organization password email sent: ' + info.response);
        }
    });

}