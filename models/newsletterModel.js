const mongoose = require("mongoose");



const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,

    },
    registeredAt: {
        type: Date,
        default: Date.now
    }

});


const NewsLetterModel = mongoose.model('Newsletter', newsletterSchema)

module.exports = NewsLetterModel;