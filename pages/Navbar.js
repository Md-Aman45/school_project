import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  const linkClasses = (path) =>
    `px-4 py-2 rounded-md font-medium transition-colors ${
      router.pathname === path ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
    }`;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
          School Management System
        </Link>

        <div className="flex space-x-3">
          <Link href="/showSchools" className={linkClasses("/showSchools")}>
            View Schools
          </Link>
          <Link href="/addSchool" className={linkClasses("/addSchool")}>
            Add School
          </Link>
        </div>
      </div>
    </nav>
  );
}
