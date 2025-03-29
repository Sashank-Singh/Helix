import React from 'react';
import styled from 'styled-components';
import LoadingSpinner from './LoadingSpinner';

interface DashboardProps {
  user: any;
  stats: {
    totalSequences: number;
    activeSequences: number;
    totalMessages: number;
    completionRate: number;
  };
  loading: boolean;
}

const DashboardContainer = styled.div`
  padding: 30px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const WelcomeMessage = styled.div`
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  
  h3 {
    margin: 0 0 5px 0;
    font-size: 14px;
    color: #666;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  p {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }
`;

const RecentActivity = styled.div`
  margin-top: 30px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 15px 0;
    color: #333;
  }
`;

const ActivityList = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
`;

const ActivityItem = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  h4 {
    margin: 0 0 5px 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px;
  color: #888;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`;

const Dashboard: React.FC<DashboardProps> = ({ user, stats, loading }) => {
  // Placeholder data for recent activity
  const recentActivity = [
    {
      id: 1,
      title: "Created new sequence",
      description: "Senior Frontend Developer outreach",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      title: "Updated sequence",
      description: "Data Scientist follow-up emails",
      timestamp: "Yesterday"
    },
    {
      id: 3,
      title: "Sent messages",
      description: "5 messages sent to Product Manager candidates",
      timestamp: "3 days ago"
    }
  ];

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <LoadingSpinner size={60} />
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Dashboard</Title>
      </Header>
      
      <WelcomeMessage>
        Welcome back, {user?.first_name || user?.username || 'there'}! Here's an overview of your recruiting activities.
      </WelcomeMessage>
      
      <StatsGrid>
        <StatCard>
          <h3>Total Sequences</h3>
          <p>{stats.totalSequences}</p>
        </StatCard>
        <StatCard>
          <h3>Active Sequences</h3>
          <p>{stats.activeSequences}</p>
        </StatCard>
        <StatCard>
          <h3>Total Messages</h3>
          <p>{stats.totalMessages}</p>
        </StatCard>
        <StatCard>
          <h3>Completion Rate</h3>
          <p>{stats.completionRate}%</p>
        </StatCard>
      </StatsGrid>
      
      <RecentActivity>
        <h3>Recent Activity</h3>
        <ActivityList>
          {recentActivity.length > 0 ? (
            recentActivity.map(activity => (
              <ActivityItem key={activity.id}>
                <h4>{activity.title}</h4>
                <p>{activity.description} • {activity.timestamp}</p>
              </ActivityItem>
            ))
          ) : (
            <EmptyState>No recent activity to display</EmptyState>
          )}
        </ActivityList>
      </RecentActivity>
    </DashboardContainer>
  );
};

export default Dashboard; 