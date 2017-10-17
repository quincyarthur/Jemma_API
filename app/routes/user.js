const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const TwitterController = require('../controllers/twitter');
const FacebookController = require('../controllers/facebook');
const SubscriptionController = require('../controllers/subscription');
const passport = require('../services/passport')();

router.route('/').post(UserController.create);
router.route('/twitter/profile').get(passport.authenticate(),TwitterController.getProfile);
router.route('/subscriptions').get(passport.authenticate(),SubscriptionController.getSubscription);
router.route('/subscription').post(passport.authenticate(),SubscriptionController.updateSubscription);

router.route('/group/:id/accounts/Twitter').post(passport.authenticate(),TwitterController.addAccount);
router.route('/group/:id/accounts/Facebook').post(passport.authenticate(),FacebookController.addAccount);
//test route below please delete
router.route('/group/:id/accounts/test/Facebook').post(FacebookController.getPosts);

router.route('/:id')
      .get(UserController.find)
      .put(UserController.update)
      .delete(passport.authenticate(),UserController.destroy);
       
module.exports = router;
