// // import mysql from "mysql2/promise";

// // let pool;

// // export async function getPool() {
// //     if(!pool) {
// //         pool = mysql.createPool({
// //             host: process.env.DB_HOST,
// //             user: process.env.DB_USER || "root"  ,
// //             password: process.env.DB_PASSWORD || "Aman@123#/45",
// //             database: process.env.DB_NAME,
// //             port: process.env.DB_PORT,
// //             waitForConnections: true,
// //             connectionLimit: 10,
// //         });
// //     }
// //     return pool;
// // }



// import mysql from "mysql2/promise";

// let pool;

// export async function getPool() {
//   if (!pool) {
//     pool = mysql.createPool({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//       port: process.env.DB_PORT,
//       waitForConnections: true,
//       connectionLimit: 10,
//     });
//   }
//   return pool;
// }


import mysql from "mysql2/promise";

let pool;

export async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "user",
      password: process.env.DB_PASSWORD || "Schools_123_db",
      database: process.env.DB_NAME || "schools_db",
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}
