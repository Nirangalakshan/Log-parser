import Head from 'next/head';

function Layout({ children }) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 font-inter">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              EV Charger Analytics
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">
                 Log analyzing Dashboard
              </span>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">{children}</main>
        <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 py-4 ">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} EV Charger Analytics 
          </div>
        </footer>
      </div>
    </>
  );
}

export default Layout;