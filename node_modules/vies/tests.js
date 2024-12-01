'use strict';

const test = require('tape');
const vies = require('./index');

test('Invalid VAT', (t) => {
    const testData = {
        countryCode: 'NL',
        vatNumber: '0123456789',
    };
    vies.validate(testData.vatNumber, testData.countryCode)
    .then((result) => {
        t.ok(result.data);
        t.equal(result.data.countryCode, testData.countryCode);
        t.equal(result.data.valid, false);
        t.equal(result.data.vatNumber, testData.vatNumber);
        t.equal(result.data.address, '---');
        t.equal(result.data.name, '---');
        t.equal(result.error, null);
        t.equal(result.error, null);
        t.equal(result.is_valid, false);
        t.end();
    })
    .catch((error) => {
        console.log('this should not happen.');
        console.log(error);
    });
});

test('Invalid input', (t) => {
    const testData = {
        countryCode: 'ZZ',
        vatNumber: '0641818415',
    };
    vies.validate(testData.vatNumber, testData.countryCode)
    .then((result) => {
        console.log('this should not happen.');
        console.log(result);
    })
    .catch((error) => {
        t.equal(error.data, null);
        t.equal(error.error, 'INVALID_INPUT');
        t.equal(error.is_valid, false);
        t.end();
    });
});

test('Valid VAT', (t) => {
    const testData = {
        countryCode: 'BE',
        vatNumber: '0641818415',
    };
    vies.validate(testData.vatNumber, testData.countryCode)
    .then((result) => {
        t.ok(result.data);
        t.equal(result.data.countryCode, testData.countryCode);
        t.equal(result.data.valid, true);
        t.equal(result.data.vatNumber, testData.vatNumber);
        t.ok(result.data.address);
        t.ok(result.data.name);
        t.equal(result.error, null);
        t.equal(result.error, null);
        t.equal(result.is_valid, true);
        t.end();
    })
    .catch((error) => {
        console.log('this should not happen.');
        console.log(error);
    });
});

test('Valid VAT with lowercase country code', (t) => {
    const testData = {
        countryCode: 'be',
        vatNumber: '0641818415',
    };
    vies.validate(testData.vatNumber, testData.countryCode)
    .then((result) => {
        t.ok(result.data);
        t.equal(result.data.countryCode, testData.countryCode.toUpperCase());
        t.equal(result.data.valid, true);
        t.equal(result.data.vatNumber, testData.vatNumber);
        t.ok(result.data.address);
        t.ok(result.data.name);
        t.equal(result.error, null);
        t.equal(result.error, null);
        t.equal(result.is_valid, true);
        t.end();
    })
    .catch((error) => {
        console.log('this should not happen.');
        console.log(error);
    });
});
