'use strict';

const nodemailer = require(`nodemailer`)
    , { sprintf } = require(`sprintf-js`)
;

class MailHelper {

    /**
     * Loads weather information and builds info message of it
     * @param {string} from
     * @param {string} to
     * @param {string} subject
     * @param {string} text
     * @param {string} sign
     *
     * @return {Promise<boolean>}
     */
    static async send(from, to, subject, text, sign) {
        let textWithSign = text;
        if (sign) {
            textWithSign = sprintf(`%s\n---\n%s`, text, sign);
        }
        const transporter = nodemailer.createTransport(process.env.MAIL_TRANSPORT)
            , mailOptions = {
                from: from
                , to: to
                , subject: subject
                , text: textWithSign
            }
        ;
        return transporter.sendMail(mailOptions)
            .then(info => {
                // TODO: log required info
                // console.log('Message sent: ' + info.response);

                return true;
            });
    }
}

module.exports = MailHelper;
