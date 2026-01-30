import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ViewPaste() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paste, setPaste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/pastes/${id}`);
        setPaste(response.data);
        setError('');
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Paste not found or has expired');
        } else {
          setError('Failed to load paste. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaste();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading paste...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div className="error">
            <h2>404 - Paste Not Found</h2>
            <p>{error}</p>
            <button className="btn" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
              Create New Paste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: 'transparent', 
              border: '2px solid #667eea', 
              color: '#667eea',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Create New Paste
          </button>
        </div>

        {paste && (
          <>
            <div className="paste-meta">
              {paste.remaining_views !== null && (
                <div className="meta-item">
                  <span className="meta-label">Remaining Views: </span>
                  {paste.remaining_views}
                </div>
              )}
              {paste.expires_at && (
                <div className="meta-item">
                  <span className="meta-label">Expires: </span>
                  {formatDate(paste.expires_at)}
                </div>
              )}
            </div>

            <div className="paste-content">{paste.content}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default ViewPaste;
