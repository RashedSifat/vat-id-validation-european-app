const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { country, vat } = event.queryStringParameters;

  // Ensure both country and vat are provided
  if (!country || !vat) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Country and VAT number are required' }),
    };
  }

  try {
    // Construct the API URL for VAT validation
    const apiUrl = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${vat}`;

    // Call the EU VAT validation API
    const response = await fetch(apiUrl);

    // If the response is not OK, throw an error
    if (!response.ok) {
      throw new Error(`VAT validation failed with status: ${response.status}`);
    }

    // Parse the response body as JSON
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: data.valid,
        companyName: data.traderName || 'N/A',
        companyAddress: data.traderAddress || 'N/A',
        countryCode: country,
        vatNumber: vat,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Internal Server Error: ${error.message}` }),
    };
  }
};
