const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const TwitterController = require('../controllers/twitter');
const passport = require('../services/passport')();

router.route('/').post(UserController.create);
router.route('/accounts/Twitter').post(passport.authenticate(),TwitterController.addAccount);
router.route('/twitter/profile').get(passport.authenticate(),TwitterController.getProfile);

router.route('/:id')
      .get(UserController.find)
      .put(UserController.update)
      .delete(passport.authenticate(),UserController.destroy);
       
module.exports = router;
