var express = require('express');
const conn = require('../lib/db');
var router = express.Router();
var wages;
var paycycle = '';

//* Functions

salaryCalc = (normHrs = 0 , ovrHrs = 0 , wage , data) => {
  let normHrsWages = normHrs * wage.hrly_wage
  let ovrHrsWages = ovrHrs * (wage.hrly_wage * wage.ovrtime_rate);

  data.basic_pay = normHrsWages;
  data.ovrtime_pay = ovrHrsWages
  data.salary =  data.basic_pay + data.ovrtime_pay

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

checkDate = (date) => {
  var result
  if(date == ''){
    result = null;
  }else{
    result = date
  }

  return result
}


// End of Functions

router.get('/', function(req, res, next) {
  let salDets;
  let str = req.body.cycle || 4 ;
  
  let salarySQL = "SELECT s.id, em.emp_id , em.f_name , em.l_name ,d.department , p.position , d.ovrtime_rate,s.hours, s.ovrtime_hrs, s.salary, pc.cycle_strt , pc.cycle_end, st.state  FROM employees em, departments d, employee_departments ed, positions p,  employee_positions ep, postion_wages pw, employee_salaries s , paycycles pc , states st WHERE ed.emp_id = em.emp_id AND ep.emp_id = em.emp_id   AND ed.dep_id = d.id AND ep.pos_id = p.id  AND pw.pos_id = p.id AND s.cycle_id = pc.id AND pw.dep_id = d.id  AND s.emp_id = em.emp_id AND s.state_id = st.id AND s.cycle_id = '"+str+"'"

  getSummaryDetsAll = (callback) => {
    let salSummaryAllSQL = "SELECT d.department , Sum(s.hours) as tot_wrk_hrs, SUM(s.ovrtime_hrs) as tot_ovr_time_hrs, Sum(s.salary) as tot_salary FROM employees em, departments d, employee_departments ed, employee_salaries s , states st WHERE ed.emp_id = em.emp_id AND ed.dep_id = d.id AND s.emp_id = em.emp_id AND s.state_id = st.id AND NOT s.salary <= 0  AND NOT s.state_id = 2 AND NOT s.state_id = 3 "
  
    conn.query(salSummaryAllSQL, (err,rows) => {
      if (err){
        console.log(err);
      }else{
        return callback(rows[0])
      }
    })
  
  }
  
 
  //* Call back Function call
    getSummaryDetsAll(function(result){
      return salDets = result
    });


  conn.query(salarySQL, (err,rows)=> {
    if(!err) {
      conn.query('Select * From paycycles', (err,result)=>{
        if(!err){
          var locals = {
            title : 'Serhant Construction',
            stylesheet:'/stylesheets/salaries.css',
            my_session : req.session,
            bootstrap:true,
            salDets:salDets,
            cycles:result,
            data:rows,
          };
          
          res.render('salaries/salaries-list-all', locals);
          
        }else{
          console.log('Query 2', err);
        }
      })
    }else{
      console.log(err);
    
  }

  });
  
});

router.post('/', function(req, res, next) {
  let salDets;
  let str = req.body.cycle
  
  let salarySQL = "SELECT s.id, em.emp_id , em.f_name , em.l_name ,d.department , p.position , d.ovrtime_rate,s.hours, s.ovrtime_hrs, s.salary, pc.cycle_strt , pc.cycle_end, st.state  FROM employees em, departments d, employee_departments ed, positions p,  employee_positions ep, postion_wages pw, employee_salaries s , paycycles pc , states st WHERE ed.emp_id = em.emp_id AND ep.emp_id = em.emp_id   AND ed.dep_id = d.id AND ep.pos_id = p.id  AND pw.pos_id = p.id AND s.cycle_id = pc.id AND pw.dep_id = d.id  AND s.emp_id = em.emp_id AND s.state_id = st.id AND s.cycle_id = " + str

  getSummaryDetsAll = (callback) => {
    let salSummaryAllSQL = "SELECT d.department , Sum(s.hours) as tot_wrk_hrs, SUM(s.ovrtime_hrs) as tot_ovr_time_hrs, Sum(s.salary) as tot_salary FROM employees em, departments d, employee_departments ed, employee_salaries s , states st WHERE ed.emp_id = em.emp_id AND ed.dep_id = d.id AND s.emp_id = em.emp_id AND s.state_id = st.id AND NOT s.salary <= 0  AND NOT s.state_id = 2 AND NOT s.state_id = 3 "
  
    conn.query(salSummaryAllSQL, (err,rows) => {
      if (err){
        console.log(err);
      }else{
        return callback(rows[0])
      }
    })
  
  }


//   //* Call back Function call
    getSummaryDetsAll(function(result){
      return salDets = result
    });


  conn.query(salarySQL, (err,rows)=> {
    if(!err) {
      conn.query('Select * From paycycles', (err,result)=>{
        if(!err){
          var locals = {
            title : 'Serhant Construction',
            stylesheet:'/stylesheets/salaries.css',
            my_session : req.session,
            bootstrap:true,
            data:rows,
            salDets:salDets,
            cycles:result
          };
          console.log(locals.data);
          res.render('salaries/salaries-list-all',locals);
        }else{
          console.log('Query 2', err);
        }
      })
    }else{
      console.log(err);
    
  }

  });

});

router.get('/department', function(req, res, next) {
  let salDets

  let salarySQL = "SELECT s.id, em.emp_id , em.f_name , em.l_name ,d.department , p.position , d.ovrtime_rate,s.hours, s.ovrtime_hrs, s.salary, pc.cycle_strt , pc.cycle_end, st.state  FROM employees em, departments d, employee_departments ed, positions p,  employee_positions ep, postion_wages pw, employee_salaries s , paycycles pc , states st WHERE ed.emp_id = em.emp_id AND ep.emp_id = em.emp_id   AND ed.dep_id = d.id AND ep.pos_id = p.id  AND pw.pos_id = p.id AND s.cycle_id = pc.id AND pw.dep_id = d.id  AND s.emp_id = em.emp_id AND s.state_id = st.id AND d.department = '"+req.session.department+"'";

  getSummaryDets = (callback) => {
    let salSummarySQL = "SELECT d.department , Sum(s.hours) as tot_wrk_hrs, SUM(s.ovrtime_hrs) as tot_ovr_time_hrs, Sum(s.salary) as tot_salary FROM employees em,departments d,employee_departments ed,employee_salaries s ,states st WHERE ed.emp_id = em.emp_id AND ed.dep_id = d.id AND s.emp_id = em.emp_id AND s.state_id = st.id AND ed.dep_id = "+req.session.department_id+" AND NOT s.salary <= 0  AND NOT s.state_id = 2 AND NOT s.state_id = 3 GROUP BY d.department"
  
    conn.query(salSummarySQL, (err,rows) => {
      if (err){
        console.log(err);
      }else{
        return callback(rows[0])
      }
    })
  
  }
  
 
  //* Call back Function call
    getSummaryDets(function(result){
      return salDets = result
    });


  //* Route SQL query call
  conn.query(salarySQL, (err,rows)=> {
    if(err) {
      console.log(err);
    }else{
      if(req.session.position == "Supervisor"){
        var locals = {
          title : 'Serhant Construction',
          stylesheet:'/stylesheets/salaries.css',
          my_session : req.session,
          bootstrap:true,
          data:rows,
          salDets:salDets
        };
    
        res.render('salaries/department-salaries', locals);
      }else{
        req.flash('error','You dont have access here');
        res.redirect('/');
      }
  }
  });
});

router.get('/employee/:id', function(req, res, next) {
  let salarySQL = "SELECT s.id, em.emp_id , em.f_name , em.l_name ,d.department , p.position , d.ovrtime_rate,s.hours, s.ovrtime_hrs, s.salary, pc.cycle_strt , pc.cycle_end, st.state  FROM employees em, departments d, employee_departments ed, positions p,  employee_positions ep, postion_wages pw, employee_salaries s , paycycles pc , states st WHERE ed.emp_id = em.emp_id AND ep.emp_id = em.emp_id   AND ed.dep_id = d.id AND ep.pos_id = p.id  AND pw.pos_id = p.id AND s.cycle_id = pc.id AND pw.dep_id = d.id  AND s.emp_id = em.emp_id AND s.state_id = st.id AND em.emp_id = '"+req.params.id+"'"

  conn.query(salarySQL, (err,rows)=> {
    if(err) throw err
    console.log(salarySQL);
   var locals = {
      title : 'Serhant Construction',
      stylesheet:'/stylesheets/salaries.css',
      data:rows,
      bootstrap:true,
      my_session : req.session
    }

    if(req.session.loggedIn && req.session.emp_id == req.params.id){
      res.render('salaries/salary-list', locals);
    }else{
      res.redirect('/')
    }
    
  })
  
});

router.get('/sal-info/:id', function(req, res, next) {
 
  conn.query('SELECT * FROM paycycles' , (err,rows) => {
    if (err) console.log(err);
    var locals = {
      title : 'Serhant Construction',
      stylesheet:'',
      bootstrap:true,
      my_session : req.session,
      empID : req.params.id,
      cycles:rows
    };

    res.render('salaries/salaries-form', locals);
    
  })
 
});

router.get('/find' , function(req,res,next){
  conn.query('Select * From paycycles', (err,rows) => {
    var locals = {
      title : 'Serhant Construction',
      stylesheet:'',
      my_session : req.session,
      cycles:rows
    };
    res.render('salaries/paycycle-select',locals)
  })
})

router.get('/result/:id', function(req,res,next){

})

router.post('/add-hours' , (req,res,next) => {

  //* Callback Function to get wages
 function getWages(callback){
    let wageSQL = `SELECT em.emp_id , em.f_name , em.l_name , d.department , p.position , d.ovrtime_rate, pw.wrk_hrs, pw.hrly_wage , p.id AS pos_id , d.id AS dep_id FROM employees em, departments d, employee_departments ed, positions p, employee_positions ep, postion_wages pw WHERE ed.emp_id = em.emp_id  AND ep.emp_id = em.emp_id  AND ed.dep_id = d.id AND ep.pos_id = p.id AND pw.pos_id = p.id AND pw.dep_id = d.id AND em.emp_id = '${req.body.emp_id}' `

    conn.query(wageSQL,(err,rows) => {
      if(err) throw err;
      return callback(rows[0]);
    })
   
  };

  let data = {};

   // Calling callback
   var retVal = getWages(function(result){
    wages = result;
    data = {
      emp_id: req.body.emp_id,
      tot_hours:req.body.hours,
      hours: workHrsCalc(req.body.hours,wages),
      ovrtime_hrs: overtimeCalc(req.body.hours,wages),
      basic_pay:null,
      ovrtime_pay:null,
      salary:null,
      start_dt: checkDate(req.body.start_dt),
      end_dt: checkDate(req.body.end_dt),
      state_id: req.body.state,
    }
    salaryCalc(data.hours,data.ovrtime_hrs,wages , data);
    console.log(data.salary);
    
    let hourSql = " INSERT INTO employee_salaries SET ?"

    conn.query( hourSql , data , (err , rows) => {
      if(err) throw err;
      console.log(data.emp_id);
      res.redirect('/salaries')
    });
  
    // return data;
    });
  // End of Callback
  console.log(wages);

   
  
  
})

router.get('/sal-info/edit/:id', function(req, res, next) {

  let search = `'${req.params.id}'`;

   let salarySQL = `SELECT s.id, em.emp_id , em.f_name , em.l_name ,d.department , p.position , d.ovrtime_rate,s.hours, s.ovrtime_hrs, s.salary, pc.id, st.state  FROM employees em, departments d, employee_departments ed, positions p, employee_positions ep, postion_wages pw, employee_salaries s , paycycles pc , states st WHERE ed.emp_id = em.emp_id AND ep.emp_id = em.emp_id   AND ed.dep_id = d.id AND ep.pos_id = p.id  AND pw.pos_id = p.id AND s.cycle_id = pc.id AND pw.dep_id = d.id  AND s.emp_id = em.emp_id AND s.state_id = st.id AND s.id = ${search} `

  conn.query(salarySQL, (err,rows)=> {
  if(!err){
    console.log('search' + search);
    conn.query('Select * From paycycles' , (err,result) =>{
      if (err) throw err;
      var locals = {
        title : 'Serhant Construction',
        stylesheet:'',
        bootstrap:true,
        empID: rows[0].emp_id,
        salaryID : search,
        cycleID : rows[0].id,
        my_session : req.session,
        data:rows[0],
        cycles:result
      }
      // console.log(search);
      res.render('salaries/salaries-edit', locals);
    })
  }else{
    console.log(err);
  }
    
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

let data = {};

   // Calling callback
   var retVal = getWages(function(result){
    wages = result;
    data = {
      emp_id: req.body.emp_id,
      tot_hours:req.body.hours,
      hours: workHrsCalc(req.body.hours,wages),
      ovrtime_hrs: overtimeCalc(req.body.hours,wages),
      basic_pay:null,
      ovrtime_pay:null,
      salary:null,
      start_dt: checkDate(req.body.start_dt),
      end_dt: checkDate(req.body.end_dt),
      state_id: req.body.state,
    }

    salaryCalc(data.hours,data.ovrtime_hrs,wages , data);
    
    let editSQL = `Update employee_salaries Set hours = '${data.hours}', ovrtime_hrs = '${data.ovrtime_hrs}', salary='${data.salary}', cycle_id='${req.body.cycleID}', state_id='${data.state_id}' Where id = ${req.body.salaryID}`

    conn.query(editSQL, data , (err,rows) => {
      if(err) console.log(err);
      console.log(editSQL);
      res.redirect('/salaries')
    })
    // return data;
    });
  
  
})

router.get('/payslip/:id' , (req,res,next) => {
   
   let payslipSQL = `SELECT s.id as Salary_id, em.emp_id , em.f_name , em.l_name , em.nis, d.department , p.position , d.ovrtime_rate,s.hours, s.ovrtime_hrs, s.salary, pc.cycle_strt , pc.cycle_end, st.state, pw.hrly_wage FROM employees em, departments d, employee_departments ed, positions p,  employee_positions ep,  postion_wages pw,  employee_salaries s , paycycles pc , states st WHERE ed.emp_id = em.emp_id AND ep.emp_id = em.emp_id AND ed.dep_id = d.id AND ep.pos_id = p.id  AND pw.pos_id = p.id AND s.cycle_id = pc.id AND pw.dep_id = d.id  AND s.emp_id = em.emp_id AND s.state_id = st.id AND em.emp_id = '${req.params.id}'`

   conn.query(payslipSQL,(err,rows) => {
     if(req.session.loggedIn && req.session.department == 'Accounts'){

      let details = [];

      console.log(rows);

      rows.forEach(element => {
        details.push({
          tot_hours: element.hours + element.ovrtime_hrs,
          ovrtime_hrs : element.ovrtime_hrs,
          basic_pay:element.hours * element.hrly_wage,
          ovrtime_pay: element.ovrtime_hrs * (element.hrly_wage * element.ovrtime_rate),
          cycle_strt:element.cycle_strt,
          end_strt:element.end_strt,
          tot_salary: element.salary
        })
      });

      
      
       var locals = {
         title : 'Serhant Construction',
         stylesheet:'/stylesheets/salaries.css',
         bootstrap:true,
         my_session : req.session,
         data:rows,
         details:details,

       }
       res.render('salaries/payslip', locals);
     }else{
       res.redirect('/')
     }
   })
   // return data;
   });
 




module.exports = router;
