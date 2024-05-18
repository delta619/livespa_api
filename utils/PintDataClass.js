const customer = require('../models/customerModel');
const Appointment = require('../models/appointmentModel');

class PintDataClass{
    static customers_count = 0
    static appointments_count = 0
    static matches = 0

    constructor(){
        let customers = customer.find().then(res=>{
            PintDataClass.customers_count = res.length
            // console.log("customers initial data is " + PintDataClass.customers_count);
        }).catch(err=>{
            console.log(err);
        })
        let appointments = Appointment.find().then(res=>{
            PintDataClass.appointments_count = res.length
            // console.log("Appointments initial data is " + PintDataClass.appointments_count);
        }).catch(err=>{
            console.log(err);
        })
        let matches = Appointment.find({matchedEarlier:true}).then(res=>{
            PintDataClass.matches = res.length
        }).catch(err=>{
            console.log(err);
        })

    }

    static get get_Appointment_count(){
        return PintDataClass.appointments_count
    }
    static get get_customer_count(){
        return PintDataClass.customers_count
    }
    static get get_matches(){
        return PintDataClass.matches
    }

    static incr_Appointment_count(){
        PintDataClass.appointments_count +=1
    }
    static incr_customer_count(){
        PintDataClass.customers_count +=1
    }
    static incr_match_count(){
        PintDataClass.matches +=1
    }
    
}
exports.PintDataClass = PintDataClass