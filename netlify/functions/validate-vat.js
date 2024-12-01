const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    // Parse input from the request body
    const { vatId } = JSON.parse(event.body);

    // Extract country code (first two characters) and VAT number
    const countryCode = vatId.slice(0, 2).toUpperCase();
    const vatNumber = vatId.slice(2);

    // Construct the VIES API URL
    const apiUrl = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`;

    // Fetch data from the VIES API
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from VIES API: ${response.statusText}`);
    }

    const data = await response.json();

    // Return the API result
    return {
      statusCode: 200,
      body: JSON.stringify({
        isValid: data.isValid,
        name: data.name,
        address: data.address,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
