var mysql = require('mysql');

const conn = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'root',
  database:`Serhant Construction`
})

conn.connect(err => {
  if(!err){
    console.log(`Connected to Database .... THANK YOU JESUS!!`);
  }else{
    console.log(`An Error occured connecting .... THANK JESUS ANYHOW`);
  }
})

module.exports = conn;