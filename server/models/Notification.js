const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  // The user who the notification is FOR
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The text to display
  text: {
    type: String,
    required: true,
  },
  // Where to go when clicked (e.g., the project page)
  link: {
    type: String,
  },
  // Has the user seen this?
  read: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', NotificationSchema);