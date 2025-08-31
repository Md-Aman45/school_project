import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-6">School Management System</h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A comprehensive platform to manage school information and records efficiently.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/showSchools" className="btn btn-primary text-center px-8 py-3">
            View Schools
          </Link>
          <Link href="/addSchool" className="btn btn-secondary text-center px-8 py-3">
            Add New School
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="card p-6 flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Image 
                src="/globe.svg" 
                alt="Browse" 
                width={32} 
                height={32} 
                className="text-blue-600" 
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Browse Schools</h3>
            <p className="text-gray-600 text-center">View all registered schools in our directory.</p>
          </div>
          
          <div className="card p-6 flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Image 
                src="/file.svg" 
                alt="Manage" 
                width={32} 
                height={32} 
                className="text-blue-600" 
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Manage Records</h3>
            <p className="text-gray-600 text-center">Add and update school information easily.</p>
          </div>
          
          <div className="card p-6 flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Image 
                src="/window.svg" 
                alt="Access" 
                width={32} 
                height={32} 
                className="text-blue-600" 
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Access</h3>
            <p className="text-gray-600 text-center">Access school information from anywhere.</p>
          </div>
        </div>
      </div>
    </div>
  );
}