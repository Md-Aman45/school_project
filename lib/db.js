import mysql from "mysql2/promise";

// Initialize storage for persistent data across server restarts
let persistentStorage;
let pool;

// Define a mock pool for development and build environments
const mockPool = {
  query: async (sql, params) => {
    console.log("DB Query:", sql, params);
    
    // Handle SELECT queries
    if (sql.includes("SELECT")) {
      // If looking for a specific school by ID
      if (sql.includes("WHERE id")) {
        const idMatch = sql.match(/WHERE id\s*=\s*\?/i);
        if (idMatch && params && params.length > 0) {
          const id = params[0];
          const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
          const school = persistentStorage.find(s => s.id === idNum);
          console.log('Found school:', school);
          return [school ? [school] : []];
        }
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
      console.log('Attempting to delete school with ID:', idToDelete, 'Type:', typeof idToDelete);
      console.log('Current schools in storage:', JSON.stringify(persistentStorage));
      
      // Convert ID to number if it's a string
      const idToDeleteNum = typeof idToDelete === 'string' ? parseInt(idToDelete, 10) : idToDelete;
      console.log('Converted ID to delete:', idToDeleteNum, 'Type:', typeof idToDeleteNum);
      
      // Log each school ID for debugging
      persistentStorage.forEach((school, idx) => {
        console.log(`School ${idx}: ID=${school.id}, Type=${typeof school.id}`);
      });
      
      // Try both string and number comparison
      let index = persistentStorage.findIndex(s => s.id === idToDeleteNum);
      if (index === -1) {
        // Try string comparison if number comparison failed
        index = persistentStorage.findIndex(s => String(s.id) === String(idToDelete));
      }
      
      console.log('Found school at index:', index);
      
      if (index !== -1) {
        persistentStorage.splice(index, 1);
        saveData(); // Save data after modification
        console.log('School deleted, remaining schools:', JSON.stringify(persistentStorage));
        return [{ affectedRows: 1 }];
      } else {
        console.log('No school found with ID:', idToDelete);
        return [{ affectedRows: 0 }];
      }
    }
    
    return [{ affectedRows: 0 }];
  }
};

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

export async function getPool() {
  // Only create a real database connection in production environment
  // or when explicitly requested
  if (!pool && process.env.NODE_ENV === 'production') {
    try {
      console.log('Attempting to create database pool in production environment');
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
      });
      console.log('Database pool created successfully');
      return pool;
    } catch (error) {
      console.error('Error creating database pool:', error);
      // Return the mock pool in case of connection error
      return mockPool;
    }
  }
  
  // Use mock pool for development and build environments
  console.log('Using mock database pool for development/build');
  return mockPool;
}
