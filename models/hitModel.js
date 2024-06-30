const mongoose = require("mongoose");



const hitSchema = new mongoose.Schema({
    hit:{
        type:String,
        
    },
    data:{
        type:String,
        trim:true,
    }
});


const hitModel = mongoose.model('Analytics',hitSchema)

module.exports = hitModel;