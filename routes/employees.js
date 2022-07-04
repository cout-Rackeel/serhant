var express = require('express');
var router = express.Router();
var conn = require('../lib/db');
var bcrypt = require('bcrypt');
var saltRounds = 10;

function genEmpId(min = 1000, max = 9999) {

	let s4 = Math.floor((1 + Math.random()) * 0x1000).toString(16).substring(1);

    // find diff
    let difference = max - min;

    // generate random number 
    let rand = Math.random();

    // multiply with difference 
    rand = Math.floor( rand * difference);

    // add with min value 
    rand = rand + min;

    return rand + '-' + s4 ;
}

router.get('/', function(req, res, next) {
  var empSQL = " SELECT em.emp_id , em.f_name , em.l_name , dp.department , p.position, u.email FROM employees em , departments dp, employee_departments ed, positions p, employee_positions ep, users u WHERE dp.id = ed.dep_id AND p.id = ep.pos_id AND ed.emp_id = em.emp_id AND ep.emp_id = em.emp_id AND u.emp_id = em.emp_id "

  if(req.session.loggedIn && req.session.department == 'Accounts'){
    conn.query(empSQL , (err,rows) => {
      if(err) throw err
  
      var locals = {
        title : 'Serhant Construction',
        stylesheet:'',
        bootstrap:true,
        data:rows,
        my_session : req.session
      }
      res.render('employees/employees-list-all', locals);
    })
  }else{
    res.redirect('/')
  }

});

router.get('/department', function(req, res, next) {
  var empSQL = " SELECT em.emp_id , em.f_name , em.l_name , dp.department , p.position, u.email FROM employees em , departments dp, employee_departments ed, positions p, employee_positions ep, users u WHERE dp.id = ed.dep_id AND p.id = ep.pos_id AND ed.emp_id = em.emp_id AND ep.emp_id = em.emp_id AND u.emp_id = em.emp_id AND dp.department = '"+ req.session.department +"' "

  if(req.session.loggedIn && req.session.position == 'Supervisor'){
    conn.query(empSQL , (err,rows) => {
      if(err){
        console.log(err);
      }else{
        if(req.session.position == 'Supervisor'){
          var locals = {
            title : 'Serhant Construction',
            stylesheet:'',
            bootstrap:true,
            data:rows,
            my_session : req.session
          }
          res.render('employees/employees-list', locals);
        }else{
          req.flash('error','You dont have access here');
          res.redirect('/');
        }
      }
  
  
    })
  }else{
    res.redirect('/')
  }
  
});
  
router.get('/add-employee', function(req, res, next) {
  

    var locals = {
      title : 'Serhant Construction',
      stylesheet:'',
      bootstrap:true,
      my_session : req.session
    }
    if(req.session.loggedIn && req.session.department == 'Accounts'){
    res.render('employees/add-employee', locals);
    }else{
      res.redirect('/')
    }
});

router.post('/add' , (req,res,next) => {

  req.session.empDets = {
    emp_id : genEmpId(),
    f_name : req.body.f_name,
    l_name : req.body.l_name,
    email :  req.body.email,
    department : req.body.dep,
    position : req.body.pos,

  }

  let empDets = req.session.empDets
  let set1 = {emp_id: empDets.emp_id , f_name: empDets.f_name, l_name: empDets.l_name}
  let set2 = {emp_id: empDets.emp_id , dep_id: empDets.department}
  let set3 = {emp_id: empDets.emp_id , pos_id: empDets.position}
 


  console.log(set1);
  console.log(set2);
  console.log(set3);



  conn.query('Insert Into employees set ?' , set1 , (err,rows) => {
     if(!err){
        conn.query('Insert Into employee_departments set ?' , set2 , (err,rows) => {
          if(!err){
            conn.query('Insert Into employee_positions set ?' , set3 , (err,rows) => { 
              if(!err){
              bcrypt.hash(empDets.emp_id , saltRounds , (err,hash) => {
                let set4 = {emp_id: empDets.emp_id , email: empDets.email , password:hash , usertype:'new employee' }
                console.log(hash);
                conn.query('Insert Into users set ?' , set4 , (err,rows) => { 
                  if(!err){
                    res.redirect('/employees/department')
                  }else{throw err}
              })
              })
            }else{throw err}     
          })
        }else{throw err}
      })
    }else{throw err}
  })
 
  
})



module.exports = router;
