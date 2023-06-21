const crypto = require("crypto");
const Razorpay = require("razorpay");

// const razorpay = new Razorpay({
//     key: '<YOUR_KEY_ID>',
//       // logo, displayed in the payment processing popup
//     image: 'https://i.imgur.com/n5tjHFD.jpg',
//   });

const checkout = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.donationAmount) * 100,
      currency: "INR",
    };
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_API_SECRET,
    });
    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.json("Internal Server error");
  }
};

const paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Database comes here
    res.redirect(
      `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({
      success: false,
    });
  }
};

module.exports = { paymentVerification, checkout };
