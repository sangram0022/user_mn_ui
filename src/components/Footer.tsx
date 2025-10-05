interface FooterProps {
  apiVersion?: string;
  buildVersion?: string;
}

const Footer = ({ apiVersion = "v1.0", buildVersion = "2024.8.2" }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'API Documentation', href: 'http://localhost:8000/docs', external: true },
    { name: 'User Guide', href: '#user-guide' },
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
  ];

  const socialLinks = [
    { name: 'GitHub', href: '#github', icon: '📚' },
    { name: 'Documentation', href: '#docs', icon: '📖' },
    { name: 'Support', href: '#support', icon: '💬' },
    { name: 'Community', href: '#community', icon: '👥' },
  ];

  const features = [
    'User Lifecycle Management',
    'Advanced Analytics & Segmentation',
    'Workflow Automation',
    'GDPR Compliance Tracking',
    'Role-Based Access Control',
    'Real-time Monitoring'
  ];

  return (
    <footer style={{
      background: 'var(--background-secondary)',
      borderTop: '1px solid var(--border-color)',
      marginTop: 'auto',
      padding: '3rem 0 1.5rem 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Company Info */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}>
                🚀
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  UserMgmt Pro
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  Enterprise User Management
                </p>
              </div>
            </div>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              Comprehensive FastAPI-based user management system with advanced lifecycle tracking, 
              analytics, and enterprise-grade security features.
            </p>
            
            {/* System Status */}
            <div style={{
              background: 'var(--background-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <h4 style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: 'var(--accent-color)' }}>●</span>
                System Status
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span>API:</span> <span style={{ color: 'var(--accent-color)', fontWeight: '500' }}>Online</span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span>DB:</span> <span style={{ color: 'var(--accent-color)', fontWeight: '500' }}>Connected</span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span>Version:</span> <span style={{ fontWeight: '500' }}>{apiVersion}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span>Build:</span> <span style={{ fontWeight: '500' }}>{buildVersion}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Key Features
            </h4>
            <div style={{
              display: 'grid',
              gap: '0.5rem'
            }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    background: 'var(--background-primary)',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span style={{ color: 'var(--primary-color)' }}>✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links & Resources */}
          <div>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Resources
            </h4>
            <div style={{
              display: 'grid',
              gap: '0.75rem',
              marginBottom: '2rem'
            }}>
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.external ? '_blank' : '_self'}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = 'var(--primary-color)';
                    e.currentTarget.style.background = 'var(--background-primary)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0px)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.color = 'var(--primary-color)';
                    e.currentTarget.style.background = 'var(--background-primary)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0px)';
                  }}
                >
                  <span>→</span>
                  <span>{link.name}</span>
                  {link.external && <span style={{ fontSize: '0.75rem' }}>↗</span>}
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <h5 style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Connect & Support
              </h5>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}>
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    title={social.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'var(--background-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontSize: '1.1rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'var(--primary-color)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px var(--shadow-medium)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'var(--background-primary)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = 'var(--primary-color)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px var(--shadow-medium)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = 'var(--background-primary)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <span>© {currentYear} UserMgmt Pro. All rights reserved.</span>
            <span style={{
              padding: '0.25rem 0.75rem',
              background: 'var(--background-primary)',
              borderRadius: '16px',
              fontSize: '0.75rem',
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              FastAPI + React
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-light)'
          }}>
            <span>Built with ❤️ for Enterprise</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              borderRadius: '16px',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              <span>🔐</span>
              <span>Enterprise Security</span>
            </div>
          </div>
        </div>

        {/* Developer Info */}
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'var(--background-primary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>Development Environment:</strong> Frontend React ({window.location.origin}) ↔ Backend FastAPI (localhost:8000)
          </p>
          <p style={{ margin: 0 }}>
            <strong>API Integration Ready:</strong> Authentication, User Management, Analytics, Workflows & Compliance
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
