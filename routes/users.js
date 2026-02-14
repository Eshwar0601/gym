var express = require('express');
var router = express.Router();
const authController = require('./../controllers/auth.controller');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({
    users : [
    ]
  });
});

router.post('/login', authController.login)
router.post('/register', authController.registerUser)

module.exports = router;
