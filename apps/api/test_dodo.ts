import { DodoPayments } from 'dodopayments';


const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
  environment: 'test_mode',
});

async function main() {
  try {
    console.log('Testing Dodopayments API...');
    const products = await dodoClient.products.list();
    console.log('Success:', products);
  } catch (error: any) {
    console.error('Error:', error);
    if (error.response) {
      console.error('Response data:', await error.response.text());
    }
  }
}

main();
