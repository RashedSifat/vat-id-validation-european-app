const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allowed methods
    'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
  };

  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { vatId } = JSON.parse(event.body);

    if (!vatId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'VAT ID is required.' }),
      };
    }

    const countryCode = vatId.slice(0, 2); // Extract country code
    const vatNumber = vatId.slice(2); // Extract VAT number

    const response = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`);
    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
