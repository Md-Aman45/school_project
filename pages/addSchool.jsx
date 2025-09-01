import { useForm } from "react-hook-form";
import { useState } from "react";
import Router from "next/router";

export default function AddSchool() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [preview, setPreview] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const formData = new FormData();

      // Append all fields
      Object.keys(data).forEach((key) => {
        if (key === "image") {
          if (data.image[0]) formData.append("image", data.image[0]);
        } else {
          formData.append(key, data[key]);
        }
      });

      // Use window.location.origin to get the base URL in any environment
      const baseUrl = window.location.origin;
      console.log(`Submitting form to: ${baseUrl}/api/schools`);
      
      const res = await fetch(`${baseUrl}/api/schools`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      console.log('API response:', result);
      
      if (res.ok) {
        // If the API call was successful, update localStorage
        if (typeof window !== 'undefined' && result.data) {
          try {
            // Get existing data from localStorage
            const existingData = localStorage.getItem('schoolsData');
            const schools = existingData ? JSON.parse(existingData) : [];
            
            // Add the new school to the array
            schools.push(result.data);
            
            // Save back to localStorage
            localStorage.setItem('schoolsData', JSON.stringify(schools));
            console.log('School added to localStorage');
          } catch (error) {
            console.error('Error updating localStorage:', error);
          }
        }
        
        Router.push("/showSchools");
      } else {
        setErrorMessage(result.message || "Failed to add school. Please try again.");
        console.error('Error adding school:', result);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Add School</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4 card p-6"
      >
        <div>
          <label htmlFor="name" className="form-label">School Name</label>
          <input
            id="name"
            placeholder="Enter school name"
            {...register("name", { required: true })}
            className="form-input"
          />
          {errors.name && <span className="form-error">Name is required</span>}
        </div>

        <div>
          <label htmlFor="address" className="form-label">Address</label>
          <textarea
            id="address"
            placeholder="Enter school address"
            {...register("address", { required: true })}
            className="form-input min-h-[80px]"
          />
          {errors.address && <span className="form-error">Address is required</span>}
        </div>

        <div>
          <label htmlFor="city" className="form-label">City</label>
          <input
            id="city"
            placeholder="Enter city"
            {...register("city", { required: true })}
            className="form-input"
          />
          {errors.city && <span className="form-error">City is required</span>}
        </div>

        <div>
          <label htmlFor="state" className="form-label">State</label>
          <input
            id="state"
            placeholder="Enter state"
            {...register("state", { required: true })}
            className="form-input"
          />
          {errors.state && <span className="form-error">State is required</span>}
        </div>

        <div>
          <label htmlFor="contact" className="form-label">Contact</label>
          <input
            id="contact"
            placeholder="Enter contact information"
            {...register("contact")}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            id="email"
            placeholder="Enter email address"
            type="email"
            {...register("email_id", { required: true, pattern: /^\S+@\S+$/i })}
            className="form-input"
          />
          {errors.email_id && <span className="form-error">Valid email is required</span>}
        </div>

        <div>
          <label htmlFor="image" className="form-label">School Image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            {...register("image")}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setPreview(URL.createObjectURL(e.target.files[0]));
              }
            }}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {preview && (
          <div className="mt-2">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary mt-4 justify-self-center w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding School..." : "Add School"}
        </button>
      </form>
    </div>
  );
}
