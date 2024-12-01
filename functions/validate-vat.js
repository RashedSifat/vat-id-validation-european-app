export async function handler(event) {
  const { vatId } = JSON.parse(event.body);

  const countryCode = vatId.substring(0, 2);
  const vatNumber = vatId.substring(2);

  try {
    const response = await fetch(
      `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`
    );
    const data = await response.json();

    if (data.isValid) {
      return {
        statusCode: 200,
         headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
          valid: true,
          name: data.name,
          address: data.address,
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ valid: false, message: 'Invalid VAT ID' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
