var express = require('express');
var router = express.Router();
var conn = require('../lib/db');
var bcrypt = require('bcrypt');
var employeeDets;


/* GET home page. */
router.get('/', function(req, res, next) {
  var locals = {
    title : 'Serhant Construction',
    stylesheet:'',
    bootstrap:true,
    my_session : req.session
  }
  res.render('login/login', locals);
});


router.post('/authlogin' , (req, res, next) => {
  var data = [req.body.email]
  var authSql = " SELECT * FROM users WHERE email = ?"

  conn.query( authSql, data, (err,rows) => {

    if(rows.length <= 0){
      req.flash('error', 'Invalid Credientials');
      res.redirect('/login');
    }

    function getDets(callback){
      let sessionSQL = "SELECT em.emp_id , em.f_name , em.l_name , d.department , p.position , pw.hrly_wage , p.id AS pos_id , d.id AS dep_id FROM `Serhant Construction`.employees em, `Serhant Construction`.departments d, `Serhant Construction`.employee_departments ed, `Serhant Construction`.positions p, `Serhant Construction`.employee_positions ep, `Serhant Construction`.postion_wages pw WHERE ed.emp_id = em.emp_id  AND ep.emp_id = em.emp_id  AND ed.dep_id = d.id AND ep.pos_id = p.id AND pw.pos_id = p.id AND pw.dep_id = d.id AND em.emp_id = '"+ rows[0].emp_id +"' " 
    
      conn.query(sessionSQL , (err,rows) => {
        if(err) throw err;
        return callback(rows[0])
      })
    }


    getDets(function(result){
      console.log('res ' + JSON.stringify(result));
      return employeeDets = result
     })
    

    bcrypt.compare(req.body.password, rows[0].password, (err,result) => {
      if(result){
        req.session.loggedIn = true;
        req.session.emp_id = rows[0].emp_id;
        req.session.usertype = rows[0].usertype;
        req.session.fname = employeeDets.f_name 
        req.session.position_id = employeeDets.pos_id;
        req.session.position = employeeDets.position;
        req.session.department_id = employeeDets.dep_id;
        req.session.department = employeeDets.department;
        req.flash('success' , 'Welcome Back')
        res.redirect('/')
    
      
      }else{
        req.flash('error' , 'Incorrect Password')
        res.redirect('/login')
      }
    })

  })

})


router.get('/logout', (req,res) =>{
  res.redirect('/');
  req.session.destroy();
})


module.exports = router;
