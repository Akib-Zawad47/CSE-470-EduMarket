import React, { useEffect, useState } from 'react';

export default function CourseRecommendations({ studentId = 1 }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/recommendations/student/${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        return res.json();
      })
      .then((data) => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [studentId]);

  if (loading) return <div className="p-4">Loading personalized recommendations...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Recommended Courses For You</h2>
      {recommendations.length === 0 ? (
        <p>No recommendations available yet. Try selecting some interests!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.recommendationId} className="border p-4 rounded-lg shadow-sm bg-white">
              <h3 className="font-semibold text-lg">Course ID: {rec.courseId}</h3>
              <p className="text-sm text-gray-600 mt-1">Match Score: {(rec.score * 100).toFixed(0)}%</p>
              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}