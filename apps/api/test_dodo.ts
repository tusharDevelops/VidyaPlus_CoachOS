import { DodoPayments } from 'dodopayments';


const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
  environment: 'test_mode',
});

async function main() {
  try {
    console.log('Testing Dodopayments Subscription API...');
    const subscription = await dodoClient.subscriptions.create({
      billing: {
        city: 'Mumbai',
        country: 'IN',
        state: 'Maharashtra',
        street: 'Main Street',
        zipcode: '400001',
      },
      customer: {
        email: 'test@example.com',
        name: 'Test User',
      },
      product_id: 'pdt_0NhfE2lTQW2SC6uynTK60', // Pragati product ID
      quantity: 1,
      payment_link: true,
      return_url: `http://localhost:5173/dashboard`,
    });
    console.log('Success:', subscription);
  } catch (error: any) {
    console.error('Error:', error);
    if (error.response) {
      console.error('Response data:', await error.response.text());
    }
  }
}

main();
