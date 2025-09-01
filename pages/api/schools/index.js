import { getPool } from "../../../lib/db";
import formidable from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../../../lib/cloudinary";

// Disable Next.js default body parser
export const config = { api: { bodyParser: false } };

// Upload file to Cloudinary with enhanced error handling
async function uploadToCloudinary(file) {
  try {
    const uniqueFilename = uuidv4();
    console.log(`Attempting to upload file to Cloudinary with ID: ${uniqueFilename}`);
    
    const result = await cloudinary.uploader.upload(file.filepath, {
      public_id: uniqueFilename,
      folder: "schoolImages",
    });
    
    console.log(`Successfully uploaded to Cloudinary: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    // Return a placeholder image URL instead of throwing an error
    return { 
      secure_url: "https://res.cloudinary.com/drall4ntv/image/upload/v1/schoolImages/placeholder.jpg" 
    };
  }
}

export default async function handler(req, res) {
  const pool = await getPool();

  // ================= GET =================
  if (req.method === "GET") {
    try {
      if (req.query.id) {
        const [rows] = await pool.query("SELECT * FROM schools WHERE id = ?", [
          req.query.id,
        ]);
        if (rows.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "School not found" });
        }
        return res.json({ success: true, data: rows[0] });
      }

      const [rows] = await pool.query("SELECT * FROM schools ORDER BY id DESC");
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }
  }

  // ================= POST =================
  if (req.method === "POST") {
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err)
        return res
          .status(400)
          .json({ success: false, message: "Error parsing form" });

      try {
        // Extract fields, handling both string values and arrays (from formidable)
        const name = fields.name instanceof Array ? fields.name[0] : fields.name;
        const address = fields.address instanceof Array ? fields.address[0] : fields.address;
        const city = fields.city instanceof Array ? fields.city[0] : fields.city;
        const state = fields.state instanceof Array ? fields.state[0] : fields.state;
        const contact = fields.contact instanceof Array ? fields.contact[0] : fields.contact;
        const email_id = fields.email_id instanceof Array ? fields.email_id[0] : fields.email_id;

        let image = null;
        if (files.image) {
          const file = Array.isArray(files.image) ? files.image[0] : files.image;
          try {
            const result = await uploadToCloudinary(file);
            // Remove any backticks or special characters that might cause database issues
            image = result.secure_url ? result.secure_url.replace(/[`'"\\]/g, '') : null; // Cloudinary hosted image URL
          } catch (cloudinaryError) {
            console.error("Cloudinary upload error:", cloudinaryError);
            // Use a placeholder image if Cloudinary upload fails
            image = "https://res.cloudinary.com/drall4ntv/image/upload/v1/schoolImages/placeholder.jpg";
          }
        }

        const result = await pool.execute(
          "INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [name, address, city, state || null, contact || null, image, email_id]
        );
        
        // Create a school object to return to the client
        const newSchool = {
          id: result[0].insertId,
          name,
          address,
          city,
          state: state || null,
          contact: contact || null,
          image,
          email_id
        };
        
        res.status(200).json({ success: true, message: "School added!", data: newSchool });
      } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Database error" });
      }
    });
  }

  // ================= DELETE =================
  else if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "School ID is required" });

      const [school] = await pool.query(
        "SELECT image FROM schools WHERE id = ?",
        [id]
      );

      if (school.length > 0 && school[0].image) {
        // Extract public_id from Cloudinary URL
        const urlParts = school[0].image.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = "schoolImages/" + publicIdWithExt.split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      }

      const [result] = await pool.execute("DELETE FROM schools WHERE id = ?", [
        id,
      ]);

      if (result.affectedRows > 0) {
        return res
          .status(200)
          .json({ success: true, message: "School deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "School not found" });
      }
    } catch (error) {
      console.error("Error deleting school:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error deleting school" });
    }
  }

  // ================= PUT =================
  else if (req.method === "PUT") {
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err)
        return res
          .status(400)
          .json({ success: false, message: "Error parsing form" });

      const id = Array.isArray(fields.id) ? fields.id[0] : fields.id;
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const address = Array.isArray(fields.address)
        ? fields.address[0]
        : fields.address;
      const city = Array.isArray(fields.city) ? fields.city[0] : fields.city;
      const state = Array.isArray(fields.state) ? fields.state[0] : fields.state;
      const contact = Array.isArray(fields.contact)
        ? fields.contact[0]
        : fields.contact;
      const email_id = Array.isArray(fields.email_id)
        ? fields.email_id[0]
        : fields.email_id;

      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "School ID is required" });

      const [school] = await pool.query("SELECT * FROM schools WHERE id = ?", [
        id,
      ]);
      if (school.length === 0)
        return res
          .status(404)
          .json({ success: false, message: "School not found" });

      let image = school[0].image;

      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;

        // Delete old image from Cloudinary
        if (school[0].image) {
          const urlParts = school[0].image.split("/");
          const publicIdWithExt = urlParts[urlParts.length - 1];
          const publicId = "schoolImages/" + publicIdWithExt.split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }

        // Upload new one
        const result = await uploadToCloudinary(file);
        // Remove any backticks or special characters that might cause database issues
        image = result.secure_url ? result.secure_url.replace(/[`'"\\]/g, '') : null;
      }

      await pool.execute(
        "UPDATE schools SET name = ?, address = ?, city = ?, state = ?, contact = ?, image = ?, email_id = ? WHERE id = ?",
        [name, address, city, state || null, contact || null, image, email_id, id]
      );

      // Create an updated school object to return to the client
      const updatedSchool = {
        id: parseInt(id),
        name,
        address,
        city,
        state: state || null,
        contact: contact || null,
        image,
        email_id
      };

      res
        .status(200)
        .json({ success: true, message: "School updated successfully", data: updatedSchool });
    });
  }

  // ================= OTHER =================
  else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
