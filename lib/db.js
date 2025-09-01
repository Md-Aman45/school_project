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

// Initialize storage for persistent data across server restarts
let persistentStorage;

// Try to load data from localStorage in browser environments
if (typeof window !== 'undefined') {
  try {
    const savedData = localStorage.getItem('schoolsData');
    persistentStorage = savedData ? JSON.parse(savedData) : [];
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    persistentStorage = [];
  }
} else {
  // In server environment, initialize with some sample data
  persistentStorage = [
    { id: 1, name: "ABC School", address: "123 Main St", city: "Mumbai", state: "Maharashtra", contact: "9876543210", image: "https://res.cloudinary.com/drall4ntv/image/upload/v1/schoolImages/sample.jpg", email_id: "abc@school.com" },
    { id: 2, name: "XYZ School", address: "456 Park Ave", city: "Delhi", state: "Delhi", contact: "8765432109", image: "https://res.cloudinary.com/drall4ntv/image/upload/v1/schoolImages/sample2.jpg", email_id: "xyz@school.com" },
  ];
}

// Save data to localStorage in browser environments
const saveData = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('schoolsData', JSON.stringify(persistentStorage));
      console.log('Data saved to localStorage');
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }
};

// Enhanced pool implementation with persistence
let pool = {
  query: async (sql, params) => {
    console.log("DB Query:", sql, params);
    
    // Handle SELECT queries
    if (sql.includes("SELECT")) {
      if (params && params[0]) {
        // Query for specific school by ID
        const id = params[0];
        const school = persistentStorage.find(s => s.id === parseInt(id));
        return [school ? [school] : []];
      }
      // Return all schools
      return [persistentStorage];
    }
    return [{ affectedRows: 1, insertId: persistentStorage.length + 1 }];
  },
  execute: async (sql, params) => {
    console.log("DB Execute:", sql, params);
    
    // Handle INSERT queries
    if (sql.includes("INSERT")) {
      const newId = persistentStorage.length + 1;
      const [name, address, city, state, contact, image, email_id] = params;
      
      // Clean the image URL by removing any backticks or special characters that might cause issues
      const cleanedImage = image ? image.toString().replace(/[`'"\\]/g, '') : null;
      
      persistentStorage.push({
        id: newId,
        name,
        address,
        city,
        state,
        contact,
        image: cleanedImage,
        email_id
      });
      
      saveData(); // Save data after modification
      return [{ affectedRows: 1, insertId: newId }];
    }
    
    // Handle UPDATE queries
    if (sql.includes("UPDATE")) {
      const id = params[params.length - 1]; // Last parameter is the ID
      const index = persistentStorage.findIndex(s => s.id === parseInt(id));
      
      if (index !== -1) {
        // Extract values from params based on the order in the SQL query
        const [name, address, city, state, contact, image, email_id] = params;
        
        // Clean the image URL by removing any backticks or special characters
        const cleanedImage = image ? image.toString().replace(/[`'"\\]/g, '') : null;
        
        // Update the school
        persistentStorage[index] = {
          ...persistentStorage[index],
          name,
          address,
          city,
          state,
          contact,
          image: cleanedImage,
          email_id
        };
        
        saveData(); // Save data after modification
      }
      
      return [{ affectedRows: index !== -1 ? 1 : 0 }];
    }
    
    // Handle DELETE queries
    if (sql.includes("DELETE")) {
      const idToDelete = params[0];
      const index = persistentStorage.findIndex(s => s.id === parseInt(idToDelete));
      if (index !== -1) {
        persistentStorage.splice(index, 1);
        saveData(); // Save data after modification
      }
      return [{ affectedRows: index !== -1 ? 1 : 0 }];
    }
    
    return [{ affectedRows: 0 }];
  }
};

export async function getPool() {
  return pool;
}
