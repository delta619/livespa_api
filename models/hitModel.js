const mongoose = require("mongoose");



const hitSchema = new mongoose.Schema({
    hit:{
        type:Number,
        
    },
    data:{
        type:String,
        trim:true,
    }
});


const hitModel = mongoose.model('Analytics',hitSchema)

module.exports = hitModel;