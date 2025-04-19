const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
    // Create a payment intent
    async createPaymentIntent(amount, currency = 'usd') {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }

    // Create a customer
    async createCustomer(email, name) {
        try {
            const customer = await stripe.customers.create({
                email,
                name,
            });
            return customer;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    // Save payment method for future use
    async savePaymentMethod(customerId, paymentMethodId) {
        try {
            const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });

            // Set as default payment method
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethod.id,
                },
            });

            return paymentMethod;
        } catch (error) {
            console.error('Error saving payment method:', error);
            throw error;
        }
    }

    // Process payment
    async processPayment(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            console.error('Error processing payment:', error);
            throw error;
        }
    }

    // Handle webhook events
    async handleWebhookEvent(signature, payload) {
        try {
            const event = stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            switch (event.type) {
                case 'payment_intent.succeeded':
                    // Handle successful payment
                    const paymentIntent = event.data.object;
                    console.log('Payment succeeded:', paymentIntent.id);
                    break;
                case 'payment_intent.payment_failed':
                    // Handle failed payment
                    const failedPayment = event.data.object;
                    console.log('Payment failed:', failedPayment.id);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            return { received: true };
        } catch (error) {
            console.error('Error handling webhook:', error);
            throw error;
        }
    }

    // Calculate carbon offset fee
    calculateCarbonOffsetFee(carbonFootprint) {
        // $0.10 per kg of CO2
        return carbonFootprint * 0.10;
    }

    // Add carbon offset to order total
    async addCarbonOffsetToPayment(amount, carbonFootprint) {
        const carbonOffsetFee = this.calculateCarbonOffsetFee(carbonFootprint);
        const totalAmount = amount + carbonOffsetFee;

        return {
            totalAmount,
            carbonOffsetFee,
            paymentIntent: await this.createPaymentIntent(totalAmount)
        };
    }
}

module.exports = new PaymentService(); 