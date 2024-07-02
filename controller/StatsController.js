const { PintDataClass } = require('../utils/PintDataClass')
const NewsLetterModel = require('../models/newsletterModel')
const catchAsync = require('../utils/catchAsync');
const {Redis_DB, connectRedis} = require('../utils/redis')

exports.get_status = (req, res) => {

    res.status(200).json({
        "appointments": PintDataClass.get_Appointment_count,
        "customers": PintDataClass.get_customer_count,
        "matches": PintDataClass.get_matches
    })
}

exports.add_newsletter = catchAsync(async (req, res) => {

    const { email } = req.body
    const newsletter = await NewsLetterModel.create({ email })

    return res.status(200).json({
        "message": "newsletter added",
        "data": newsletter
    })
})


exports.get_redis_keys = catchAsync(async (req, res) => {
    await connectRedis(); // Ensure the client is connected

    let ans = {}
    const keys = await Redis_DB.keys('*')
    for (let key of keys) {
        ans[key] = await Redis_DB.get(key)
    }  
    
    return res.status(200).json({
        "message": "keys fetched",
        "data": ans
    })
}
)
