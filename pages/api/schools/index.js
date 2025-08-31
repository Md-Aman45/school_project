import { getPool } from "../../../lib/db";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Disable Next.js default body parser
export const config = { api: { bodyParser: false } };

// Save uploaded file and return the URL path
function saveFile(file) {
  const dir = path.join(process.cwd(), "public", "schoolImages");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const ext = path.extname(file.originalFilename);
  const filename = `${uuidv4()}${ext}`;
  const filepath = path.join(dir, filename);

  fs.renameSync(file.filepath, filepath);

  return `/schoolImages/${filename}`;
}

export default async function handler(req, res) {
  const pool = await getPool();

  if (req.method === "GET") {
    // If ID is provided, return a specific school
    if (req.query.id) {
      const [rows] = await pool.query("SELECT * FROM schools WHERE id = ?", [req.query.id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "School not found" });
      }
      return res.json({ success: true, data: rows[0] });
    }
    
    // Otherwise return all schools
    const [rows] = await pool.query("SELECT * FROM schools ORDER BY id DESC");
    return res.json({ success: true, data: rows });
  }

  if (req.method === "POST") {
    const form = formidable({ multiples: false }); // single file only
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ success: false, message: "Error parsing form" });

      const { name, address, city, state, contact, email_id } = fields;

      let image = null;
      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        image = saveFile(file);
      }

      try {
        await pool.execute(
          "INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [name, address, city, state || null, contact || null, image, email_id]
        );
        res.status(200).json({ success: true, message: "School added!" });
      } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Database error" });
      }
    });
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ success: false, message: "School ID is required" });
      }
      
      // First, get the school to check if it has an image to delete
      const [school] = await pool.query("SELECT image FROM schools WHERE id = ?", [id]);
      
      if (school.length > 0 && school[0].image) {
        // Delete the image file if it exists
        const imagePath = path.join(process.cwd(), "public", school[0].image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      // Delete the school from the database
      const [result] = await pool.execute("DELETE FROM schools WHERE id = ?", [id]);
      
      if (result.affectedRows > 0) {
        return res.status(200).json({ success: true, message: "School deleted successfully" });
      } else {
        return res.status(404).json({ success: false, message: "School not found" });
      }
    } catch (error) {
      console.error("Error deleting school:", error);
      return res.status(500).json({ success: false, message: "Error deleting school" });
    }
  } else if (req.method === "PUT") {
    try {
      const form = formidable({ multiples: false });
      form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ success: false, message: "Error parsing form" });

        // Handle fields that might be arrays due to formidable parsing
        const id = Array.isArray(fields.id) ? fields.id[0] : fields.id;
        const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
        const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;
        const city = Array.isArray(fields.city) ? fields.city[0] : fields.city;
        const state = Array.isArray(fields.state) ? fields.state[0] : fields.state;
        const contact = Array.isArray(fields.contact) ? fields.contact[0] : fields.contact;
        const email_id = Array.isArray(fields.email_id) ? fields.email_id[0] : fields.email_id;
        
        if (!id) {
          return res.status(400).json({ success: false, message: "School ID is required" });
        }

        // Check if school exists
        const [school] = await pool.query("SELECT * FROM schools WHERE id = ?", [id]);
        if (school.length === 0) {
          return res.status(404).json({ success: false, message: "School not found" });
        }

        let image = school[0].image; // Keep existing image by default
        
        // If a new image is uploaded, save it and update the path
        if (files.image) {
          const file = Array.isArray(files.image) ? files.image[0] : files.image;
          
          // Delete old image if it exists
          if (school[0].image) {
            const oldImagePath = path.join(process.cwd(), "public", school[0].image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
          
          // Save new image
          image = saveFile(file);
        }

        // Update school in database
        await pool.execute(
          "UPDATE schools SET name = ?, address = ?, city = ?, state = ?, contact = ?, image = ?, email_id = ? WHERE id = ?",
          [name, address, city, state || null, contact || null, image, email_id, id]
        );

        res.status(200).json({ success: true, message: "School updated successfully" });
      });
    } catch (error) {
      console.error("Error updating school:", error);
      return res.status(500).json({ success: false, message: "Error updating school" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
