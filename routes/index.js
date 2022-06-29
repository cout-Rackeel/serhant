var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var locals = {
    title : 'Serhant Construction',
    stylesheet:'',
    bootstrap:true,
    my_session : req.session
  }
  res.render('index', locals);
});

module.exports = router;
