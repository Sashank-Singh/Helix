import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

interface SettingsProps {
  user: any;
  apiUrl: string;
  onUserUpdate: (updatedUser: any) => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
  token?: string;
}

const Settings: React.FC<SettingsProps> = ({ user, apiUrl, onUserUpdate, darkMode, toggleDarkMode, token }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    position: '',
    company_size: '',
    industry: '',
    company_description: '',
    target_roles: '',
    recruiting_goals: '',
    outreach_preferences: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'security'>('profile');
  
  // Load user data
  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        company: user.company || '',
        position: user.position || '',
        company_size: user.company_size || '',
        industry: user.industry || '',
        company_description: user.company_description || '',
        target_roles: user.target_roles || '',
        recruiting_goals: user.recruiting_goals || '',
        outreach_preferences: user.outreach_preferences || '',
      }));
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      // Get the authentication token
      const authToken = localStorage.getItem('helix_token');
      
      if (!authToken) {
        setMessage({ text: 'Authentication token not found. Please log in again.', type: 'error' });
        setLoading(false);
        return;
      }
      
      // Prepare payload based on active tab
      const payload: any = {};
      
      if (activeTab === 'profile') {
        payload.first_name = formData.first_name;
        payload.last_name = formData.last_name;
        payload.email = formData.email;
        payload.position = formData.position;
      } else if (activeTab === 'company') {
        payload.company = formData.company;
        payload.company_size = formData.company_size;
        payload.industry = formData.industry;
        payload.company_description = formData.company_description;
        payload.target_roles = formData.target_roles;
        payload.recruiting_goals = formData.recruiting_goals;
        payload.outreach_preferences = formData.outreach_preferences;
      } else if (activeTab === 'security') {
        if (formData.new_password) {
          if (!formData.current_password) {
            setMessage({ text: 'Current password is required', type: 'error' });
            setLoading(false);
            return;
          }
          
          if (formData.new_password !== formData.confirm_password) {
            setMessage({ text: 'New passwords do not match', type: 'error' });
            setLoading(false);
            return;
          }
          
          payload.current_password = formData.current_password;
          payload.new_password = formData.new_password;
        }
      }
      
      console.log('Updating profile with payload:', payload);
      
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const responseData = await response.json();
      
      // Create a merged user object that preserves existing data
      const updatedUserData = {
        ...user,
        ...responseData
      };
      
      // Update local user data
      onUserUpdate(updatedUserData);
      
      // Also update localStorage directly to ensure consistency
      localStorage.setItem('helix_user', JSON.stringify(updatedUserData));
      
      // Show success message
      setMessage({ text: 'Profile updated successfully', type: 'success' });
      
      // Clear password fields
      if (activeTab === 'security') {
        setFormData(prevState => ({
          ...prevState,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }));
      }
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.message || 'Failed to update profile';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SettingsContainer>
      <Tabs>
        <Tab 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
        >
          Personal Info
        </Tab>
        <Tab 
          active={activeTab === 'company'} 
          onClick={() => setActiveTab('company')}
        >
          Company Details
        </Tab>
        <Tab 
          active={activeTab === 'security'} 
          onClick={() => setActiveTab('security')}
        >
          Security
        </Tab>
      </Tabs>
      
      {message && (
        <MessageBox className={message.type}>
          {message.text}
        </MessageBox>
      )}
      
      <Form onSubmit={handleSubmit}>
        {activeTab === 'profile' && (
          <>
            <FormRow>
              <FormGroup>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="position">Job Title</Label>
              <Input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
              />
            </FormGroup>
          </>
        )}
        
        {activeTab === 'company' && (
          <>
            <FormGroup>
              <Label htmlFor="company">Company Name</Label>
              <Input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="company_size">Company Size</Label>
                <Select
                  id="company_size"
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleInputChange}
                  aria-label="Company Size"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1001-5000">1001-5000 employees</option>
                  <option value="5000+">5000+ employees</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <Label htmlFor="company_description">Company Description</Label>
              <Textarea
                id="company_description"
                name="company_description"
                value={formData.company_description}
                onChange={handleInputChange}
                rows={3}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="target_roles">Target Roles</Label>
              <Input
                type="text"
                id="target_roles"
                name="target_roles"
                value={formData.target_roles}
                onChange={handleInputChange}
                placeholder="e.g. Software Engineers, Data Scientists, Product Managers"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="recruiting_goals">Recruiting Goals</Label>
              <Textarea
                id="recruiting_goals"
                name="recruiting_goals"
                value={formData.recruiting_goals}
                onChange={handleInputChange}
                rows={2}
                placeholder="e.g. Hire 5 engineers in the next quarter"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="outreach_preferences">Outreach Preferences</Label>
              <Textarea
                id="outreach_preferences"
                name="outreach_preferences"
                value={formData.outreach_preferences}
                onChange={handleInputChange}
                rows={2}
                placeholder="e.g. Prefer short, direct messages with clear call to action"
              />
            </FormGroup>
          </>
        )}
        
        {activeTab === 'security' && (
          <>
            <FormGroup>
              <Label htmlFor="dark_mode">Dark Mode</Label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="dark_mode"
                  name="dark_mode"
                  aria-label="Toggle dark mode"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  style={{ marginRight: '10px' }}
                />
                <label htmlFor="dark_mode" style={{ cursor: 'pointer' }}>
                  {darkMode ? 'Enabled' : 'Disabled'}
                </label>
              </div>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                type="password"
                id="current_password"
                name="current_password"
                value={formData.current_password}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="new_password">New Password</Label>
              <Input
                type="password"
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
              />
            </FormGroup>
          </>
        )}
        
        <SubmitButton type="submit" disabled={loading}>
          {loading ? <LoadingSpinner size={20} /> : 'Save Changes'}
        </SubmitButton>
      </Form>
    </SettingsContainer>
  );
};

const SettingsContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 0;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 30px;
`;

const Tab = styled.button<{active: boolean}>`
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#4285f4' : 'transparent'};
  color: ${props => props.active ? '#4285f4' : '#555'};
  font-weight: ${props => props.active ? '600' : 'normal'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #4285f4;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 6px;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border 0.2s;
  
  &:focus {
    border-color: #4285f4;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border 0.2s;
  background-color: white;
  
  &:focus {
    border-color: #4285f4;
    outline: none;
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border 0.2s;
  resize: vertical;
  
  &:focus {
    border-color: #4285f4;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    background-color: #3b78e7;
  }
  
  &:disabled {
    background-color: #a5c2f5;
    cursor: not-allowed;
  }
`;

const MessageBox = styled.div`
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  
  &.success {
    background-color: #e9f7ef;
    color: #2ecc71;
    border: 1px solid #d5f5e3;
  }
  
  &.error {
    background-color: #fdedeb;
    color: #e74c3c;
    border: 1px solid #fadbd8;
  }
`;

export default Settings; 