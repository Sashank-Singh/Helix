import React, { useState, useEffect } from 'react';
import '../styles/Auth.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

interface AuthProps {
  onAuthSuccess: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Regular expressions for basic validations.
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordPattern = /^.{6,}$/;

  // Scroll to the top on auth form changes.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isLogin]);

  // Reset errors when switching between login and signup.
  useEffect(() => {
    setErrorMsg('');
    setFieldErrors({});
    setApiError('');
  }, [isLogin]);

  // Run validations and return a boolean.
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!emailPattern.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!passwordPattern.test(password)) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!isLogin) {
      if (!firstName.trim()) errors.firstName = 'First name is required.';
      if (!lastName.trim()) errors.lastName = 'Last name is required.';
      if (!company.trim()) errors.company = 'Company name is required.';
      if (!position.trim()) errors.position = 'Job title is required.';
      if (!industry.trim()) errors.industry = 'Industry is required.';
      if (!companySize) errors.companySize = 'Please select company size.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors.
    setErrorMsg('');
    setFieldErrors({});
    setApiError('');

    // Validate input fields.
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin
        ? `${API_BASE_URL}/api/auth/login`
        : `${API_BASE_URL}/api/auth/signup`;

      // Prepare payload based on auth mode.
      const payload = isLogin
        ? { email, password }
        : {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            company,
            position,
            company_size: companySize,
            industry,
          };

      console.log(`Sending request to: ${endpoint}`);
      console.log('Request payload:', { ...payload, password: '******' });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (!response.ok) {
        if (data.errors && typeof data.errors === 'object') {
          setFieldErrors(data.errors);
          setErrorMsg("Please correct the errors in the form.");
        } else {
          const errMsg =
            data.message || data.error || 'Authentication failed';
          setApiError(`API Error (${response.status}): ${errMsg}`);
        }
        return;
      }

      // Save the token and user info on success.
      localStorage.setItem('helix_token', data.token);
      localStorage.setItem('helix_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch (error) {
      console.error('Auth error:', error);
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during authentication.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <h1>Helix</h1>
          <p>The Agentic Recruiter</p>
        </div>

        <h2>{isLogin ? 'Login' : 'Create Account'}</h2>

        {apiError && (
          <div className="api-error">
            <p>{apiError}</p>
            <p className="api-error-help">
              API connection issue. Please check server status.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={fieldErrors.firstName ? 'error' : ''}
                    required
                  />
                  {fieldErrors.firstName && (
                    <span className="field-error">{fieldErrors.firstName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={fieldErrors.lastName ? 'error' : ''}
                    required
                  />
                  {fieldErrors.lastName && (
                    <span className="field-error">{fieldErrors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={fieldErrors.company ? 'error' : ''}
                  required
                />
                {fieldErrors.company && (
                  <span className="field-error">{fieldErrors.company}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="position">Job Title</label>
                  <input
                    type="text"
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className={fieldErrors.position ? 'error' : ''}
                    required
                  />
                  {fieldErrors.position && (
                    <span className="field-error">{fieldErrors.position}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="industry">Industry</label>
                  <input
                    type="text"
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className={fieldErrors.industry ? 'error' : ''}
                    required
                  />
                  {fieldErrors.industry && (
                    <span className="field-error">{fieldErrors.industry}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="companySize">Company Size</label>
                <select
                  id="companySize"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className={fieldErrors.companySize ? 'error' : ''}
                  required
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1001-5000">1001-5000 employees</option>
                  <option value="5000+">5000+ employees</option>
                </select>
                {fieldErrors.companySize && (
                  <span className="field-error">{fieldErrors.companySize}</span>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldErrors.email ? 'error' : ''}
              required
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldErrors.password ? 'error' : ''}
              required
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
            {!isLogin && !fieldErrors.password && (
              <span className="field-hint">
                Password must be at least 6 characters
              </span>
            )}
          </div>

          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;