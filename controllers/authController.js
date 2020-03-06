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
