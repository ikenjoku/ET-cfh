/* eslint no-useless-escape: 0, no-console: 0 */
import nodemailer from 'nodemailer';
import IsUrl from 'is-url';

/**
 * @param {string} email - is the user's email
 * @returns {boolean} boolean if email verification fails
 */
const IsEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * @param {object} user - the email of the user to be invited
 * @param {string} link - the custom link for the current game
 * @description this function takes a (email, link) argument and sends
 * a meal bearing the game's link
 * @returns {null} returns nothing
 */
const sendInvitationEmail = (user, link) => {
  if (!(IsEmail(user.email) && IsUrl(link))) {
    return false;
  }
  // Setup mail transport config
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'bendevtester@gmail.com',
      pass: process.env.GMAIL_PASSWORD
    }
  });

  const message = `Hello, <b>${user.name}</b><br/><br/><p>Your friend has invited you to join the ongoing CFH game.<br/><br/>You can click <a href="${link}">here</a> to join the game.</p>`;

  // Setup mail transport options
  const mailOptions = {
    from: '"Bigger Ben" <no-reply@cfh.et>',
    to: user.email,
    subject: 'CFH Invitation',
    html: message
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });
  return true;
};

export default sendInvitationEmail;
