const catchAsync = require('../utils/catchAsync');
const { v4: uuid } = require("uuid");
const { createAppointmentIntent, getAppointmentIntent, updateAppointmentDB, sendAppointmentMails } = require('./appointmentController');

exports.create_paypal_order = catchAsync(async (req, res, next) => {
    get_paypal_access_token()
        .then(access_token => {
            console.log(`New access token - ${access_token}`)

            let order_data_json = {
                "intent": req.body.intent,
                "purchase_units": [
                    {
                        "amount": {
                            "currency_code": "USD",
                            "value": req.body.amount
                        }
                    }]
            }
            const data = JSON.stringify(order_data_json);

            fetch(process.env.PAYPAL_ENDPOINT + "/v2/checkout/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + access_token
                },
                body: data
            })
                .then(res => res.json())
                .then(json => {
                    if (json.id) {
                        createAppointmentIntent(req.body.userData, "PAYPAL", json.id)
                        return res.json({ status: 200, id: json.id })
                    } else {
                        console.log("NO orderid received from create-orderid");
                        throw new Error(json)
                    }
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
});

exports.capture_paypal_transaction = catchAsync(async (req, res, next) => {
    let appointment;
    get_paypal_access_token()
        .then(async access_token => {
            return fetch(`${process.env.PAYPAL_ENDPOINT}/v2/checkout/orders/${req.body.orderId}/capture`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access_token}`
                }
            }).then(res => res.json())
                .then(async json => {
                    console.log("Capture response", json)
                    appointment = await getAppointmentIntent(req.body.orderId)
                    if (appointment) {
                        console.log("Capturing, appointment found", appointment)
                    } else {
                        console.log("Capturing, appointment not found")
                    }
                    let appt = await updateAppointmentDB(appointment, req.body)
                    await sendAppointmentMails(appt)
                    return res.json({ status: 200, message: "Order captured successfully" })

                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).send({ status: 500, error: "Error capturing order" })
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).send({ status: 500, error: "Error oauth" })
        })

});

function get_paypal_access_token() {
    const auth = `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    const data = `grant_type=client_credentials`
    return fetch(`${process.env.PAYPAL_ENDPOINT}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${Buffer.from(auth).toString('base64')}`
        },
        body: data
    })
        .then(res => res.json())
        .then(json => { return json.access_token })
}
