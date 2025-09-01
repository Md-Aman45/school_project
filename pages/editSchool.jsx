import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import Link from "next/link";

export default function EditSchool() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [preview, setPreview] = useState(null);
  const [school, setSchool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchSchool(id);
    }
  }, [id]);

  const fetchSchool = async (schoolId) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/schools?id=${schoolId}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        setSchool(data.data);
        // Pre-fill the form with school data
        reset(data.data);
        if (data.data.image) {
          setPreview(data.data.image);
        }
      } else {
        alert("School not found");
        router.push("/showSchools");
      }
    } catch (error) {
      console.error("Error fetching school:", error);
      alert("Error fetching school details");
    } finally {
      setIsLoading(false);
    }
  };

  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append all fields
      Object.keys(data).forEach((key) => {
        if (key === "image") {
          // Check if there's a file to upload
          if (data.image && data.image[0]) {
            formData.append("image", data.image[0]);
          }
        } else {
          // Handle null or undefined values
          formData.append(key, data[key] || "");
        }
      });

      // Add the school ID
      formData.append("id", id);

      setNotification({ show: true, message: "Updating school information...", type: "info" });

      const res = await fetch("/api/schools", {
        method: "PUT",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setNotification({ show: true, message: "School updated successfully!", type: "success" });
        // Delay redirect to show success message
        setTimeout(() => {
          Router.push("/showSchools");
        }, 1500);
      } else {
        setNotification({ show: true, message: result.message || "Something went wrong", type: "error" });
      }
    } catch (error) {
      console.error("Error updating school:", error);
      setNotification({ show: true, message: "An error occurred while updating the school", type: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Loading school details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Edit School</h2>
      
      {notification.show && (
        <div className={`mb-4 p-3 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
          <div className="flex items-center">
            {notification.type === 'success' && (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            )}
            {notification.type === 'info' && (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 102 0v-5a1 1 0 00-2 0v5z" clipRule="evenodd"></path>
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
      
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
          <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
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

        <div className="flex justify-between mt-4">
          <Link href="/showSchools" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Update School
          </button>
        </div>
      </form>
    </div>
  );
}