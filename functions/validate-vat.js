exports.handler = async (event) => {
    // Handle preflight (OPTIONS) requests for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow requests from all origins
                'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allowed methods
                'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
            },
            body: '',
        };
    }
};
