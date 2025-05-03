'use client';

import { useState, useEffect } from 'react';

export default function DbStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkDbStatus() {
      try {
        setLoading(true);
        const response = await fetch('/api/db-test');
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to check database status');
      } finally {
        setLoading(false);
      }
    }

    checkDbStatus();
  }, []);

  const addSampleData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/db-test', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        // Refresh the status after adding data
        const statusResponse = await fetch('/api/db-test');
        const statusData = await statusResponse.json();
        setStatus(statusData);
        setError(null);
      } else {
        setError(data.error || 'Failed to add sample data');
      }
    } catch (err) {
      setError(err.message || 'Failed to add sample data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Checking database connection...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">MongoDB Connection Status</h2>
      
      {status ? (
        <div>
          <div className="mb-4">
            <p>
              <strong>Connection:</strong>{' '}
              <span 
                className={`px-2 py-1 rounded ${
                  status.connection.status === 'connected' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {status.connection.status}
              </span>
            </p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold">Collection Counts:</h3>
            <ul className="list-disc ml-6">
              <li>Playlists: {status.collections.playlists}</li>
              <li>Videos: {status.collections.videos}</li>
            </ul>
          </div>
          
          <button
            onClick={addSampleData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Sample Data
          </button>
        </div>
      ) : (
        <p>No status available</p>
      )}
    </div>
  );
} 