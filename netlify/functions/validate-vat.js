import fetch from 'node-fetch';

// VAT Validation Function
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { vatId } = JSON.parse(event.body);

    if (!vatId || vatId.length < 3) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid VAT ID format.' }),
      };
    }

    const countryCode = vatId.slice(0, 2).toUpperCase(); // Extract country code
    const vatNumber = vatId.slice(2);                  // Extract VAT number
    const apiUrl = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.isValid) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          valid: data.isValid,
          name: data.name,
          address: data.address,
          message: data.userError,
        }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          valid: data.isValid,
          message: data.userError || 'VAT ID is invalid.',
        }),
      };
    }
  } catch (error) {
    console.error('Error fetching VAT data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error.' }),
    };
  }
}
