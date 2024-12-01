const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { countryCode, vatNumber } = JSON.parse(event.body);

    if (!countryCode || !vatNumber) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Country code and VAT number are required.' }),
        };
    }

    try {
        const response = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`);

        if (!response.ok) {
            throw new Error('Failed to fetch data from the VIES API.');
        }

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
