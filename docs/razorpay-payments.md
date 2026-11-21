# Razorpay payment setup

Razorpay is an additional gateway. Payment forms default to HDFC SmartGateway; selecting Razorpay creates an independent Razorpay order and uses `/payment/razorpay` for Checkout.

## Server environment

Configure these server-only values in the deployment environment:

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

The key ID is returned to the Checkout page by a session-bound server endpoint. The key secret and webhook secret are never sent to the browser.

## Webhook

Configure a Razorpay webhook to call:

```text
https://<your-domain>/api/payment/razorpay/webhook
```

Subscribe to `payment.captured` and `payment.failed`. Use the same webhook secret in `RAZORPAY_WEBHOOK_SECRET`. Razorpay webhook signatures are verified against the unmodified request body.

Payment creation records gateway metadata in the existing `payments` collection. Verified capture updates the payment and calls the existing registration finalizer, which handles registration records, confirmation email, and invoice eligibility. No Firestore migration is required.

Use Razorpay test mode credentials and test cards before enabling live credentials. Live end-to-end payment and webhook delivery require the deployed webhook URL and credentials.
