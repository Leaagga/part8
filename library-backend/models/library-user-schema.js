const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, require: true, minlength: 3 },
  // passwordHash: { type: String, require: true },
  favoriteGenre: { type: String },
})
module.exports = mongoose.model('User', userSchema)
