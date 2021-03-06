const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const promisify = require('es6-promisify');

const mail = require('../handlers/mail');

const User = mongoose.model('User');

exports.login = passport.authenticate(
  'local',
  {
    failureRedirect: '/login',
    failureFlash: 'Failer to log in!',
    successRedirect: '/',
    successFlash: 'Successfully logged in!',
  }
);

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  req.flash('error', 'Oops! You must be logged it!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // 1. See if user wit that email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'A password reset link will be sent to your email if it is linked to existing account.');
    return res.redirect('/login');
  }

  // 2. Set the reset token and expiry
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExipres = Date.now() + 3600000; // 1 hour from now
  await user.save();

  // 3. Send an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

  await mail.send({
    user,
    subject: 'Password Reset',
    resetURL,
    filename: 'password-reset',
  });

  req.flash('success', `You have been emailed a password reset link.`);

  // 4. Redirect to login page
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExipres: {
      $gt: Date.now(),
    },
  });

  if (!user){
    req.flash('error', 'Password reset token is invalid or has expired!');
    return res.redirect('/login');
  }

  // If there is a user, render password reset form
  res.render('reset', { title: 'Reset your password' });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    return next();
  }

  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExipres: {
      $gt: Date.now(),
    },
  });

  if (!user){
    req.flash('error', 'Password reset token is invalid or has expired!');
    return res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExipres = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', '🕺💃 Your password has been reset!');
  res.redirect('/');
};
