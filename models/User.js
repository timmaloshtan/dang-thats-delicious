const mongoose = require('mongoose');
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: 'Please supply an email address',
    lowercase: true,
    trim: true,
    validate: [
      validator.isEmail,
      'Invalid email address!'
    ],
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true,
  },
});

userSchema.plugin(
  passportLocalMongoose,
  { usernameField: 'email' },
);

userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);