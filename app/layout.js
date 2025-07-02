// import Head from 'next/head';

// function Layout({ children }) {
//   return (
//     <html>
//       <body>
//         <Head>
//           <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
//           <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" />
//         </Head>
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 font-inter">
//           <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
//             <div className="container mx-auto px-4 py-2 flex justify-between items-center h-16">
//               {/* Logo on the left */}
//               <div className="h-full flex items-center">
//                 <img
//                   src="/evlogo.png"
//                   alt="EV Analyzer Logo"
//                   className="h-full object-contain scale-200 transform transition-transform duration-300 hover:scale-210"
//                 />
//               </div>

//               {/* Text on the right */}
//               <div className="text-right">
//                 <h1 className="text-xl font-semibold text-gray-800 dark:text-white leading-tight">
//                   EV Analyzer
//                 </h1>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Log Analyzing Dashboard
//                 </p>
//               </div>
//             </div>
//           </header>

//           <main className="container mx-auto px-4 py-6">{children}</main>

//           <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 py-4">
//             <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
//               ©{new Date().getFullYear()} EV Charger Analytics V3
//             </div>
//           </footer>
//         </div>
//       </body>
//     </html>
//   );
// }

// export default Layout;





import Head from 'next/head';


function Layout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" />
      </Head>
      <body className="font-inter bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-cyan-500/30 shadow-sm h-16">
            <div className="container mx-auto px-4 h-full flex justify-between items-center">
              {/* Logo */}
              <div className="h-full flex items-center">
                <img
                  src="/evlogo.png"
                  alt="EV Analyzer Logo"
                  className="h-full object-contain transition-transform duration-300 scale-180 hover:scale-200"
                />
              </div>

              {/* Title */}
              <div className="text-right">
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  EV Analyzer
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Log Analyzing Dashboard
                </p>
              </div>
            </div>
          </header>

          {/* Main content expands */}
          <main className="container mx-auto px-4 py-6 flex-grow">
            {children}
          </main>

          {/* Footer stays at the bottom */}
          <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              ©{new Date().getFullYear()} EV Charger Analytics V4.1
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

export default Layout;


