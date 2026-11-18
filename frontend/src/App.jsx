import { useState } from 'react';
import CourseRecommendationsPage from './components/CourseRecommendationsPage';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md px-8 flex justify-between items-center">
        <h1 className="font-bold text-xl cursor-pointer" onClick={() => setCurrentView('home')}>
          EduMarket Portal
        </h1>
        <button 
          onClick={() => setCurrentView('recommendations')}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
        >
          My Recommendations
        </button>
      </header>

      <main className="flex-grow">
        {currentView === 'home' ? (
          <div className="p-12 text-center max-w-xl mx-auto mt-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Home Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Click the button below to open your recommendations page. You can change student IDs directly inside the page.
            </p>
            <button
              onClick={() => setCurrentView('recommendations')}
              className="bg-blue-600 text-white font-medium px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition"
            >
              Explore Course Recommendations →
            </button>
          </div>
        ) : (
          <CourseRecommendationsPage onBack={() => setCurrentView('home')} />
        )}
      </main>
    </div>
  );
}

export default App;