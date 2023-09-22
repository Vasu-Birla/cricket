
import mysql from 'mysql2/promise'; // Import mysql2/promise for promise-based API

// MySQL connection configuration
const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  port: '3306',
  database: 'cricket',
  connectTimeout: 20000
};

// Create and export the connection
const con = async () => {
  const connection = await mysql.createConnection(connectionConfig);
  return connection;
};

export default con;

//-----------------------------------------------------  sql 18 sept 2023


// import mysql from 'mysql2/promise'; // Import mysql2/promise for promise-based API

// // MySQL connection configuration
// const connectionConfig = {
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   port: '3306',
//   database: 'myhw',
//   connectTimeout: 20000
// };

// let conn;


// // Create and export the connection
// const con = await mysql.createConnection(connectionConfig);

// export default con;

// export const con1 = async () => {
//   if (!conn) {
//     conn = await mysql.createConnection(connectionConfig);
//   }
//   return conn;
// };

//---------------------------------------------------------

// //const mysql = require('mysql');
// import mysql from 'mysql';
// //upated till 14 july ..by Kilvish 
// //host: 'punocoin-instance-1.cvsqbbwugs3b.ap-southeast-1.rds.amazonaws.com',
// const con = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   port:'3306',
//   database: 'myhw',
//  connectTimeout: 20000
// });
// con.connect(err => err?console.log(err):console.log('myHW Database connectivity successfully'));

// //module.exports = con;
// // export {con };
// export default con;
