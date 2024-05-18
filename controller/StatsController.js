const {PintDataClass} = require('../utils/PintDataClass')

exports.get_status = (req , res )=>{
    
    res.status(200).json({
        "appointments": PintDataClass.get_Appointment_count,
        "customers":PintDataClass.get_customer_count,
        "matches":PintDataClass.get_matches
    })
}