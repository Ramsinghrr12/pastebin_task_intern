import React, { useState } from 'react';
import axios from 'axios';

// If REACT_APP_API_URL is not set, use relative paths (same origin)
const API_URL = process.env.REACT_APP_API_URL || '';

function CreatePaste() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        content: content.trim()
      };

      if (ttlSeconds) {
        payload.ttl_seconds = parseInt(ttlSeconds, 10);
      }

      if (maxViews) {
        payload.max_views = parseInt(maxViews, 10);
      }

      const response = await axios.post(`${API_URL}/api/pastes`, payload);
      
      setSuccess({
        id: response.data.id,
        url: response.data.url
      });

      // Reset form
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      console.error('Error creating paste:', err);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          setError(err.response.data.errors.map(e => e.msg).join(', '));
        } else {
          setError(err.response.data.error || 'Failed to create paste');
        }
      } else if (err.request) {
        setError('Unable to connect to server. Please make sure the backend is running on port 5000.');
      } else {
        setError('Failed to create paste. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Pastebin-Lite</h1>
        <p className="subtitle">Share your text snippets easily</p>

        {error && <div className="error">{error}</div>}

        {success && (
          <div className="success">
            <strong>Paste created successfully!</strong>
            <a href={success.url} className="success-link" target="_blank" rel="noopener noreferrer">
              {success.url}
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="content">Paste Content *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text here..."
              required
              rows="10"
              style={{ minHeight: '200px' }}
            />
          </div>

          <div className="input-group">
            <div className="form-group">
              <label htmlFor="ttl">Time to Live (seconds)</label>
              <input
                type="number"
                id="ttl"
                value={ttlSeconds}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (parseInt(val, 10) >= 1)) {
                    setTtlSeconds(val);
                  }
                }}
                placeholder="e.g., 3600"
                min="1"
              />
              <div className="help-text">Optional: Paste expires after this many seconds</div>
            </div>

            <div className="form-group">
              <label htmlFor="maxViews">Max Views</label>
              <input
                type="number"
                id="maxViews"
                value={maxViews}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (parseInt(val, 10) >= 1)) {
                    setMaxViews(val);
                  }
                }}
                placeholder="e.g., 10"
                min="1"
              />
              <div className="help-text">Optional: Maximum number of times paste can be viewed</div>
            </div>
          </div>

          <button type="submit" className="btn" disabled={loading || !content.trim()}>
            {loading ? 'Creating...' : 'Create Paste'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePaste;
