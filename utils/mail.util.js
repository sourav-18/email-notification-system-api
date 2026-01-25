const nodemailer = require('nodemailer');


function getTransporter(user, pass) {
    return nodemailer.createTransport({
        service: 'gmail', // Use your email provider
        auth: {
            user: user,
            pass: pass
        }
    });
}


exports.sendMail = ({emailUserName, emailPassword, receiverEmailId, subject, text}) => {
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
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}