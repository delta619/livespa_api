const catchAsync = require('../utils/catchAsync');
const { v4: uuid } = require("uuid");


exports.create_paypal_order = (catchAsync(async (req, res, next) => {

    const order = await createPaypalOrder(req, res);

}));

exports.capture_paypal_transaction = (catchAsync(async (req, res, next) => {
    console.log(`ORDER COMPLETED` + req.body)
    return res.json(req.body)
}));

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


function createPaypalOrder(req, res) {
    get_paypal_access_token()
        .then(access_token => {
            console.log(`New access token - ${access_token}`)

            let order_data_json = {
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "amount": {
                            "currency_code": "USD",
                            "value": "8.01"
                        }
                    }
                ]
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
                .then(json => { res.send(json) })

        })
        .catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
}