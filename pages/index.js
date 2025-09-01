import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/showSchools');
  }, []);

  return (
    <>
      <Head>
        <title>School Management System</title>
        <meta name="description" content="School Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Redirecting to Schools...</p>
        </div>
      </main>
    </>
  )
}