const express = require('express');
const bodyParser = require('body-parser');
const soap = require('soap');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const VIES_WSDL = 'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl';

app.post('/validate-vat', async (req, res) => {
    const { vatId } = req.body;

    if (!vatId || !/^[A-Z]{2}\d{8,12}$/.test(vatId)) {
        return res.status(400).json({ error: 'Invalid VAT ID format.' });
    }

    const countryCode = vatId.slice(0, 2);
    const vatNumber = vatId.slice(2);

    try {
        const client = await soap.createClientAsync(VIES_WSDL);
        const [result] = await client.checkVatAsync({ countryCode, vatNumber });

        if (result.valid) {
            res.json({
                valid: true,
                name: result.name,
                address: result.address,
            });
        } else {
            res.json({ valid: false });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to validate VAT ID. Please try again later.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`VAT validation service running on port ${PORT}`);
});