import vies from 'vies';

const client = new vies();

exports.handler = async (event) => {
  console.log('Incoming request:', event);

  // Handle preflight (OPTIONS) request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  try {
    const { vatId } = JSON.parse(event.body);

    if (!vatId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'VAT ID is required' }),
      };
    }

    const countryCode = vatId.slice(0, 2);
    const vatNumber = vatId.slice(2);

    console.log('Validating VAT ID:', { countryCode, vatNumber });

    const result = await client.validateVAT({
      countryCode,
      vatNumber,
    });

    if (result.valid) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          valid: true,
          name: result.traderName || 'N/A',
          address: result.traderAddress || 'N/A',
        }),
      };
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ valid: false }),
      };
    }
  } catch (error) {
    console.error('Error validating VAT:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
