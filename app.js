'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080;
const path = require('path');
const favicon = require('serve-favicon');
const app = express();
const countries = require('./lib/eu-countries');
const endpoint = 'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl';
const soap = require('soap');