const passport = require('passport');

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
