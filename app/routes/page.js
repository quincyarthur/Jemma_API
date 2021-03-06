var express = require('express');
var router = express.Router();
const PageController = require('../controllers/page');
const passport = require('../services/passport')();

router.route('/:id/keywords')
      .get(passport.authenticate(),PageController.findKeywords)
      .put(passport.authenticate(),PageController.updateKeywords)

module.exports = router