const { checkVAT } = require('node-vat');

exports.handler = async (event) => {
    // Handle CORS preflight (OPTIONS) requests
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
                body: JSON.stringify({ error: 'VAT ID is required.' }),
            };
        }

        // Use node-vat to validate the VAT ID
        const result = await checkVAT(vatId);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                valid: result.valid,
                name: result.name || 'No name available',
                address: result.address || 'No address available',
            }),
        };
    } catch (error) {
        console.error('Error validating VAT:', error);

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Failed to validate VAT. Please try again later.' }),
        };
    }
};
