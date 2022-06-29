var express = require('express');
const conn = require('../lib/db');
var router = express.Router();
var wages;



//* Function to Calculate salaries

salaryCalc = (normHrs = 0 , ovrHrs = 0 , wage) => {
  let normHrsWages = normHrs * wage.hrly_wage
  let ovrHrsWages = ovrHrs * (wage.hrly_wage * wage.ovrtime_rate);

  let totalWages = normHrsWages + ovrHrsWages;

  return totalWages
}

overtimeCalc = (tot_hrs = 0 , wage) => {
  var result;
    if(tot_hrs > wage.wrk_hrs){
      result = tot_hrs - wage.wrk_hrs
    }else{
      result = 0
    }

    return result
}

workHrsCalc = (tot_hrs = 0 , wage) => {
  var result
  result = tot_hrs - overtimeCalc(tot_hrs,wage);
  return result
}

// End of Function

/* GET home page. */
router.get('/', function(req, res, next) {
  let salarySQL = "SELECT s.id, em.emp_id , em.f_name , em.l_name ,d.department , p.position , d.ovrtime_rate,s.hours, s.ovrtime_hrs, s.start_dt ,s.end_dt , s.salary, st.state FROM employees em, departments d, employee_departments ed, positions p,  employee_positions ep, postion_wages pw, employee_salaries s , states st  WHERE ed.emp_id = em.emp_id   AND ep.emp_id = em.emp_id   AND ed.dep_id = d.id  AND ep.pos_id = p.id  AND pw.pos_id = p.id  AND pw.dep_id = d.id  AND s.emp_id = em.emp_id AND s.state_id = st.id "

  conn.query(salarySQL, (err,rows)=> {
    if(err) throw err

    var locals = {
      title : 'Serhant Construction',
      stylesheet:'/stylesheets/salaries.css',
      data:rows,
      bootstrap:true,
      my_session : req.session
    }

    res.render('salaries/salaries-list-all', locals);
  })
  
});


router.get('/sal-info/:id', function(req, res, next) {
  var locals = {
    title : 'Serhant Construction',
    stylesheet:'',
    bootstrap:true,
    my_session : req.session,
    empID : req.params.id
  }
  res.render('salaries/salaries-form', locals);
});


router.post('/add-hours' , (req,res,next) => {

  //* Callback Function to get wages
 function getWages(callback){
    let wageSQL = `SELECT em.emp_id , em.f_name , em.l_name , d.department , p.position , d.ovrtime_rate, pw.wrk_hrs, pw.hrly_wage , p.id AS pos_id , d.id AS dep_id FROM employees em, departments d, employee_departments ed, positions p, employee_positions ep, postion_wages pw WHERE ed.emp_id = em.emp_id  AND ep.emp_id = em.emp_id  AND ed.dep_id = d.id AND ep.pos_id = p.id AND pw.pos_id = p.id AND pw.dep_id = d.id AND em.emp_id = ${req.body.emp_id} `

    conn.query(wageSQL,(err,rows) => {
      if(err) throw err;
      return callback(rows[0]);
    })
  }

  // Calling callback
  getWages(function(result){
    return wages = result
  })
  // End of Function
  
  let data = {
    emp_id: wages.emp_id,
    hours: workHrsCalc(req.body.hours,wages),
    ovrtime_hrs: overtimeCalc(req.body.hours,wages),
    salary:null,
    start_dt: req.body.start_dt,
    end_dt: req.body.end_dt,
    state_id: req.body.state,
  }

  data.salary = salaryCalc(data.hours,data.ovrtime_hrs,wages);


  let hourSql = " INSERT INTO employee_salaries SET ?"

  
  conn.query( hourSql , data , (err , rows) => {
    if(err) throw err;
    res.redirect('/salaries')
  })

  
})

router.get('/sal-info/edit/:id', function(req, res, next) {

  let search = `'${req.params.id}'`;

   let salarySQL = `SELECT s.id , em.emp_id , em.f_name , em.l_name ,d.department , p.position , d.ovrtime_rate,s.hours, s.ovrtime_hrs, s.start_dt ,s.end_dt , s.salary, st.state FROM employees em, departments d, employee_departments ed, positions p,  employee_positions ep, postion_wages pw, employee_salaries s , states st  WHERE ed.emp_id = em.emp_id   AND ep.emp_id = em.emp_id   AND ed.dep_id = d.id  AND ep.pos_id = p.id  AND pw.pos_id = p.id  AND pw.dep_id = d.id  AND s.emp_id = em.emp_id AND s.state_id = st.id AND s.id = ${search} `

  conn.query(salarySQL, (err,rows)=> {
    if(err) console.log(err);

    var locals = {
      title : 'Serhant Construction',
      stylesheet:'',
      data:rows[0],
      bootstrap:true,
      empID: rows[0].emp_id,
      salaryID : rows[0].id,
      my_session : req.session
    }
    
    console.log(search);
    res.render('salaries/salaries-edit', locals);
  })
  
});

router.post('/edit', function(req,res,next) {

 //* Callback Function to get wages
 function getWages(callback){
  let wageSQL = `SELECT em.emp_id , em.f_name , em.l_name , d.department , p.position , d.ovrtime_rate , pw.wrk_hrs, pw.hrly_wage , p.id AS pos_id , d.id AS dep_id FROM employees em, departments d, employee_departments ed, positions p, employee_positions ep, postion_wages pw WHERE ed.emp_id = em.emp_id  AND ep.emp_id = em.emp_id  AND ed.dep_id = d.id AND ep.pos_id = p.id AND pw.pos_id = p.id AND pw.dep_id = d.id AND em.emp_id = '${req.body.emp_id}' `

  conn.query(wageSQL,(err,rows) => {
    if(err) throw err;
    return callback(rows[0]);
  })
}

// Calling callback
getWages(function(result){
  return wages = result
})


let data = {
  emp_id: wages.emp_id,
  hours: workHrsCalc(req.body.hours,wages),
  ovrtime_hrs: overtimeCalc(req.body.hours,wages),
  salary: salaryCalc(this.hours,this.ovrtime_hrs, wages),
  start_dt: req.body.start_dt,
  end_dt: req.body.end_dt,
  state_id: req.body.state,
}

 data.salary = salaryCalc(data.hours,data.ovrtime_hrs,wages);
  // let editSQL = "UPDATE employee_salaries SET hours ='" + req.body.hours +
  //  "', ovrtime_hrs ='" + newOvertime + 
  //  "', salary = WHERE id = " + req.body.salaryID ;

   let hourSQL = ` INSERT INTO employee_salaries SET ? where id = ${req.body.salaryID} `
  

  conn.query(hourSQL, data , (err,rows) => {
    if(err) console.log(err);
    res.redirect('/salaries')
  })
  
})







module.exports = router;
