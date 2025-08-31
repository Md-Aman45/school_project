import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function ShowSchools() {
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, schoolId: null, schoolName: "" });
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/schools")
      .then((res) => res.json())
      .then((data) => {
        const schoolsData = data.data || [];
        setSchools(schoolsData);
        setFilteredSchools(schoolsData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching schools:", error);
        setIsLoading(false);
      });
  }, []);
  
  const openDeleteModal = (id, name) => {
    setDeleteModal({ isOpen: true, schoolId: id, schoolName: name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, schoolId: null, schoolName: "" });
  };

  const handleDelete = async () => {
    const id = deleteModal.schoolId;
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/schools?id=${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted school from the state
        const updatedSchools = schools.filter(school => school.id !== id);
        setSchools(updatedSchools);
        setFilteredSchools(updatedSchools.filter(school =>
          school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.state?.toLowerCase().includes(searchTerm.toLowerCase())
        ));
        // Close the modal
        closeDeleteModal();
      } else {
        alert(data.message || "Error deleting school");
      }
    } catch (error) {
      console.error("Error deleting school:", error);
      alert("An error occurred while deleting the school");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const results = schools.filter(school =>
      school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.state?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSchools(results);
  }, [searchTerm, schools]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-blue-600">Schools Directory</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Browse through our comprehensive list of schools or add a new one to our directory.</p>
      </div>
      
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            className="form-input pl-10 w-full"
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/addSchool" className="btn btn-primary whitespace-nowrap">
          Add New School
        </Link>
      </div>
      
      {!isLoading && filteredSchools.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Found {filteredSchools.length} {filteredSchools.length === 1 ? 'school' : 'schools'}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Loading schools...</p>
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="text-center py-10">
          {searchTerm ? (
            <>
              <p className="text-gray-500 mb-4">No schools found matching "{searchTerm}"</p>
              <button 
                onClick={() => setSearchTerm('')} 
                className="btn btn-secondary inline-block mr-4"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-4">No schools found</p>
              <Link href="/addSchool" className="btn btn-primary inline-block">Add a School</Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {filteredSchools.map((s) => (
            <div key={s.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                {s.image ? (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-blue-700">{s.name}</h3>
                  <div className="flex space-x-2">
                    <Link 
                      href={`/editSchool?id=${s.id}`}
                      className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                      title="Edit School"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </Link>
                    <button 
                      onClick={() => openDeleteModal(s.id, s.name)} 
                      disabled={isDeleting}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      title="Delete School"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {s.address && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-gray-500 mt-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <div>
                        <p className="text-gray-600 text-sm">{s.address}</p>
                        <p className="text-gray-500 text-sm">{s.city}, {s.state}</p>
                      </div>
                    </div>
                  )}
                  
                  {s.contact && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <p className="text-gray-600 text-sm">{s.contact}</p>
                    </div>
                  )}
                  
                  {s.email_id && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      <a href={`mailto:${s.email_id}`} className="text-blue-600 text-sm font-medium hover:underline">
                        {s.email_id}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        schoolName={deleteModal.schoolName}
      />
    </div>
  );
}
