import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

const API_BASE = 'http://localhost:8080/api/v1/analytics';

const STAGE_COLORS = {
  PAGE_VIEW: '#3b82f6',
  ADD_TO_CART: '#6366f1',
  CHECKOUT_START: '#f59e0b',
  PURCHASE: '#10b981',
  ABANDON: '#ef4444'
};

export default function AnalyticsDashboard() {
  const [trending, setTrending] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(1);
  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const loadTrendingAndCourses = async () => {
    try {
      const [trendingRes, coursesRes] = await Promise.all([
        axios.get(`${API_BASE}/trending`),
        axios.get(`${API_BASE}/courses`)
      ]);
      setTrending(trendingRes.data);
      setCourses(coursesRes.data);
      if (coursesRes.data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(coursesRes.data[0].courseId);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const loadFunnel = async (courseId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/funnel/${courseId}`);
      setFunnelData(res.data);
    } catch (err) {
      console.error('Failed to load funnel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrendingAndCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadFunnel(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleSimulateEvent = async (eventType) => {
    setSimulating(true);
    try {
      await axios.post(`${API_BASE}/events`, {
        userId: 3,
        courseId: Number(selectedCourseId),
        eventType
      });
      await Promise.all([loadFunnel(selectedCourseId), loadTrendingAndCourses()]);
    } catch (err) {
      console.error('Failed to record event:', err);
    } finally {
      setSimulating(false);
    }
  };

  const chartSeries = funnelData
    ? Object.entries(funnelData.funnelStages).map(([stage, count]) => ({
        stage: stage.replace('_', ' '),
        rawStage: stage,
        count
      }))
    : [];

  const totalEvents = chartSeries.reduce((sum, item) => sum + item.count, 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '4px' }}>EduMarket — Growth & Funnel Analytics</h1>
      <p style={{ color: '#6b7280', marginTop: 0, marginBottom: '28px' }}>
        Real-time course demand ranking and student conversion drop-off diagnostics
      </p>

      {/* Feature 17: Trending Courses */}
      <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', marginBottom: '28px' }}>
        <h2 style={{ marginTop: 0 }}>Trending Courses (Last 7 Days)</h2>
        {trending.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No trending activity recorded in the last 7 days.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#374151' }}>
                <th style={{ padding: '10px' }}>Rank</th>
                <th style={{ padding: '10px' }}>Course Title</th>
                <th style={{ padding: '10px' }}>Price</th>
                <th style={{ padding: '10px' }}>Searches (7d)</th>
                <th style={{ padding: '10px' }}>Purchases (7d)</th>
                <th style={{ padding: '10px' }}>Trend Score</th>
              </tr>
            </thead>
            <tbody>
              {trending.map((course, idx) => (
                <tr key={course.courseId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>#{idx + 1}</td>
                  <td style={{ padding: '10px' }}>{course.title}</td>
                  <td style={{ padding: '10px' }}>${Number(course.price).toFixed(2)}</td>
                  <td style={{ padding: '10px' }}>{course.searches7d}</td>
                  <td style={{ padding: '10px' }}>{course.purchases7d}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '999px', fontWeight: 600 }}>
                      {course.trendScore} pts
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Feature 18: Course Funnel Drop-Off */}
      <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0 }}>Course Funnel Drop-Off Analysis</h2>
            {funnelData && (
              <p style={{ margin: '4px 0 0', color: '#059669', fontWeight: 600 }}>
                Overall View-to-Purchase Conversion Rate: {funnelData.overallConversionRatePercent}%
              </p>
            )}
          </div>

          <div>
            <label htmlFor="course-select" style={{ marginRight: '8px', fontWeight: 500 }}>Select Course:</label>
            <select
              id="course-select"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            >
              {courses.map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Event Simulator for Demo / Testing */}
        <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginRight: '6px' }}>
            Record Live Event:
          </span>
          {['PAGE_VIEW', 'SEARCH', 'ADD_TO_CART', 'CHECKOUT_START', 'PURCHASE', 'ABANDON'].map((evt) => (
            <button
              key={evt}
              disabled={simulating}
              onClick={() => handleSimulateEvent(evt)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              + {evt}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading funnel metrics...</p>
        ) : totalEvents === 0 ? (
          <p style={{ color: '#6b7280', padding: '20px 0' }}>
            No funnel events recorded for this course yet. Use the buttons above to simulate student interactions.
          </p>
        ) : (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={chartSeries} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartSeries.map((entry) => (
                    <Cell key={entry.rawStage} fill={STAGE_COLORS[entry.rawStage] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}