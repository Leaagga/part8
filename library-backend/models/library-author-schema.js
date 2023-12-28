const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
// // you must install this library
// const uniqueValidator = require('mongoose-unique-validator')

// const uniqueValidator = require('mongoose-unique-validator')

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  born: {
    type: Number,
  },
  bookOf: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
  ],
})

// schema.plugin(uniqueValidator)

module.exports = mongoose.model('Author', authorSchema)
