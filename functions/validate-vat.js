exports.handler = async (event) => {
    // Handle preflight (OPTIONS) requests for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://eontechbd.myshopify.com', // Allow only your Shopify domain
                'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allowed methods
                'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
            },
            body: '',
        };
    }

    // Handle POST requests for VAT validation
    try {
        const { vatId } = JSON.parse(event.body);

        // Simulate validation logic (replace with actual VIES API logic)
        const response = {
            valid: vatId === 'valid-vat-id', // Example check
            name: 'Example Business',
            address: '123 Example Street',
        };

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://eontechbd.myshopify.com', // Allow only your Shopify domain
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(response),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://eontechbd.myshopify.com', // Allow only your Shopify domain
            },
            body: JSON.stringify({ error: 'Something went wrong.' }),
        };
    }
};
