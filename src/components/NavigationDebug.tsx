// Enhanced React Router Navigation Debug Component
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '@features/auth';

const NavigationDebug: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const testRoutes = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/users', name: 'User Management' },
    { path: '/security', name: 'Security Center' },
    { path: '/analytics', name: 'Analytics' }
  ];

  const handleNavigation = (path: string) => {
    console.log(`🧭 Navigating to: ${path}`);
    navigate(path);
  };

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px 0' }}>
      <h3>🔧 Navigation Debug Panel</h3>
      <p><strong>Current Location:</strong> {location.pathname}</p>
      <p><strong>User:</strong> {user?.email || 'Not logged in'}</p>
      
      <div style={{ margin: '20px 0' }}>
        <h4>React Router Link Test:</h4>
        {testRoutes.map(route => (
          <div key={route.path} style={{ margin: '10px 0' }}>
            <Link 
              to={route.path} 
              style={{ 
                display: 'inline-block', 
                padding: '8px 16px', 
                background: '#007bff', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '4px',
                marginRight: '10px'
              }}
            >
              {route.name} (Link)
            </Link>
            <button 
              onClick={() => handleNavigation(route.path)}
              style={{ 
                padding: '8px 16px', 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px' 
              }}
            >
              {route.name} (Navigate)
            </button>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        If Links render as &lt;a&gt; tags, there's a Router issue.<br/>
        If Navigate buttons work but Links don't, it's a Link component issue.
      </div>
    </div>
  );
};

export default NavigationDebug;
