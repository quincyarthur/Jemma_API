var express = require('express');
var router = express.Router();
const GroupController = require('../controllers/group');
const passport = require('../services/passport')();

router.route('/').post(GroupController.addGroup);
//Temporary Solution
router.route('/member').get(GroupController.addGroupMember);

router.route('/:id')
      .get(GroupController.findGroup)
      .put(GroupController.updateGroup)
      .delete(GroupController.deleteGroup)

module.exports = router