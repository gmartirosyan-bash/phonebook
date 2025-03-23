const mongoose = require('mongoose')
require('dotenv').config()

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

console.log("connecting to mongoDB");
mongoose.connect(url)
    .then(response => {
        console.log("connected to MongoDB");
    })
    .catch(error => {
        console.log(`couldn't connect to MongoDB: ${error.message}`);
    })
            
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
        validator: function(val) {
            if(!val)
                return false
            return /^\d{2,3}-\d+$/.test(val);
        },
        message: props =>  `Phone number should have a form of XX-XX... or XXX-XX...`
    },
    required: true
  },
})


personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema)

module.exports = Person