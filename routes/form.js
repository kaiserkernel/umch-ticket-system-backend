const express = require('express');
const { handleFormSubmission } = require('../controllers/formController');

const router = express.Router();

router.post('/submit-form', handleFormSubmission);

module.exports = router;
