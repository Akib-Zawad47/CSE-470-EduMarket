import React, { useEffect, useState } from 'react';

export default function CourseRecommendationsPage({ onBack }) {
  const [studentId, setStudentId] = useState(1);
  const [inputStudentId, setInputStudentId] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8080/api/recommendations/student/${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error('No recommendations found for this student ID');
        return res.json();
      })
      .then((data) => {
        setRecommendations(data);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setRecommendations([]);
        setLoading(false);
      });
  }, [studentId]);

  const handleSearch = (e) => {
    e.preventDefault();
    const id = parseInt(inputStudentId, 10);
    if (!isNaN(id)) {
      setStudentId(id);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recommended Courses</h1>
          <p className="text-gray-600 mt-1">Curated AI recommendations based on your academic interests.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg shadow-sm">
            <label className="text-sm font-medium text-gray-700">Student ID:</label>
            <input 
              type="number" 
              value={inputStudentId} 
              onChange={(e) => setInputStudentId(e.target.value)}
              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700">
              Load
            </button>
          </form>

          {onBack && (
            <button
              onClick={onBack}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {loading && <div className="text-gray-500 text-center py-10">Loading recommendations for Student ID {studentId}...</div>}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600 text-center">
          <p className="font-semibold">No Data Found</p>
          <p className="text-sm mt-1">Make sure recommendation records exist in your database for Student ID {studentId}.</p>
        </div>
      )}

      {!loading && !error && (
        recommendations.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-gray-600">No recommendations available for Student ID {studentId}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <div key={rec.recommendationId} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      Match: {(rec.score * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded">
                      {rec.course?.level || 'All Levels'}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 mt-1">{rec.course?.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {rec.course?.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    {rec.course?.price ? `$${rec.course.price}` : 'Free'}
                  </span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}