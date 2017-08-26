var express = require('express');
var router = express.Router();
const AuthController = require('../controllers/auth');

router.route('/').post(AuthController.authLocal);
router.route('/verify').get(AuthController.verifyAccount);

module.exports = router;