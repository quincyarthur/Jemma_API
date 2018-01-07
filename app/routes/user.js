const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const TwitterController = require('../controllers/twitter');
const FacebookController = require('../controllers/facebook');
const InstagramController = require('../controllers/instagram');
const SubscriptionController = require('../controllers/subscription');
const GroupController = require('../controllers/group');
const passport = require('../services/passport')();

//Create User Account
router.route('/').post(UserController.create);
router.route('/account/info').get(passport.authenticate(),UserController.getAccountInfo)

//User Groups
router.route('/groups/').get(passport.authenticate(),GroupController.getUserGroups);

//User Subscriptions
router.route('/subscriptions').get(passport.authenticate(),SubscriptionController.getSubscription);
router.route('/subscription').post(passport.authenticate(),SubscriptionController.updateSubscription);

//User Twitter Account
router.route('/group/:group_id/account/:account_id/twitter').post(passport.authenticate(),TwitterController.addAccount);
router.route('/twitter/account/:account_id/info').get(passport.authenticate(),TwitterController.getProfile);
router.route('/twitter/page/:page_id/customer/sentiments').post(passport.authenticate(),TwitterController.getMentionSentiments)
router.route('/twitter/page/:page_id/customer/tones').post(passport.authenticate(),TwitterController.getMentionTones)

//User Facebook Account
router.route('/group/:group_id/account/:account_id/facebook').post(passport.authenticate(),FacebookController.addAccount);
router.route('/facebook/account/:account_id/page/:page_id/info').get(passport.authenticate(),FacebookController.getPageInfo)
router.route('/facebook/page/:page_id/post/:post_id/sentiments').get(passport.authenticate(),FacebookController.getPostSentiment)
router.route('/facebook/page/:page_id/sentiments').get(passport.authenticate(),FacebookController.getAllPostSentiment)
router.route('/facebook/post/:post_id/tones').get(passport.authenticate(),FacebookController.getPostTones)
router.route('/facebook/page/:page_id/tones').get(passport.authenticate(),FacebookController.getAllPostTones)
router.route('/facebook/post/:post_id/demographics').get(passport.authenticate(),FacebookController.getPostDemographics)
router.route('/facebook/page/:page_id/customer/sentiments').post(passport.authenticate(),FacebookController.getMentionSentiments)
router.route('/facebook/page/:page_id/customer/tones').post(passport.authenticate(),FacebookController.getMentionTones)
router.route('/facebook/account/:account_id').post(passport.authenticate(),FacebookController.addPages)

//User Instagram Account
router.route('/group/:group_id/:access_token/instagram').post(passport.authenticate(),InstagramController.addAccount);
router.route('/instagram/account/:account_id/info').get(passport.authenticate(),InstagramController.getProfile);
router.route('/instagram/account/:account_id/posts').get(passport.authenticate(),InstagramController.getPosts);
router.route('/instagram/account/:account_id/post/:post_id/comments').get(passport.authenticate(),InstagramController.getComments);

//test route below please delete
router.route('/group/:id/accounts/test/Facebook').post(FacebookController.getPosts);

//User CRUD
router.route('/:id')
      .get(UserController.find)
      .put(UserController.update)
      .delete(passport.authenticate(),UserController.destroy);
       
module.exports = router;
