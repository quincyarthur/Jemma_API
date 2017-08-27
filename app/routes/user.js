const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const passport = require('../services/passport')();

router.route('/').post(UserController.create);
router.route('/accounts/Twitter').post(passport.authenticate(),UserController.addTwitterAccounts);

router.route('/:id')
      .get(UserController.find)
      .put(UserController.update)
      .delete(passport.authenticate(),UserController.destroy);
       
module.exports = router;
