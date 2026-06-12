import React from 'react';
import StatsCard from './StatsCard';
import { Users, FileCheck, AlertCircle, TrendingUp } from 'lucide-react';

/**
 * StatsCard Component Examples
 * 
 * This file demonstrates various usage patterns for the StatsCard component.
 * Use these examples as reference for implementing dashboard statistics.
 */

export const StatsCardExamples = () => {
  return (
    <div style={{ padding: '24px', background: '#faf9f5' }}>
      <h2 style={{ marginBottom: '24px' }}>StatsCard Examples</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        {/* Basic Card */}
        <StatsCard
          title="Total Users"
          value="145"
          icon={Users}
        />
        
        {/* Card with Upward Trend */}
        <StatsCard
          title="Pending Verifications"
          value="23"
          icon={FileCheck}
          trend={{ value: "+12%", direction: "up" }}
        />
        
        {/* Card with Downward Trend */}
        <StatsCard
          title="Active Users"
          value="132"
          icon={TrendingUp}
          trend={{ value: "-5%", direction: "down" }}
        />
        
        {/* Card with Large Number */}
        <StatsCard
          title="Total Submissions"
          value="2,847"
          icon={AlertCircle}
          trend={{ value: "+23%", direction: "up" }}
        />
      </div>
    </div>
  );
};

export default StatsCardExamples;
