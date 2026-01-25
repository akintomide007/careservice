import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Database, Cloud, Smartphone, Monitor, Users, FileText, Bell, Shield, BarChart3, Zap, CheckCircle, AlertCircle, Clock, Camera, Mic, MapPin } from 'lucide-react';

const FlowDiagram = () => {
  const [activeView, setActiveView] = useState('architecture');
  const [expandedSections, setExpandedSections] = useState({
    mobile: true,
    backend: true,
    m365: true,
    powerPlatform: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          padding: '40px',
          color: 'white'
        }}>
          <h1 style={{
            margin: '0 0 12px 0',
            fontSize: '36px',
            fontWeight: '700',
            letterSpacing: '-0.02em'
          }}>
            Care Provider System - Hybrid Architecture
          </h1>
          <p style={{
            margin: 0,
            fontSize: '18px',
            opacity: 0.9,
            fontWeight: '400'
          }}>
            Custom Mobile App + Power Platform Admin + M365 Integration
          </p>
        </div>

        {/* View Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          {[
            { id: 'architecture', label: 'System Architecture' },
            { id: 'dataflow', label: 'Data Flow' },
            { id: 'userflow', label: 'User Journeys' },
            { id: 'approval', label: 'Approval Workflow' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              style={{
                padding: '16px 32px',
                border: 'none',
                background: activeView === tab.id ? 'white' : 'transparent',
                borderBottom: activeView === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                color: activeView === tab.id ? '#1e40af' : '#6b7280',
                fontWeight: activeView === tab.id ? '600' : '500',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '-2px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ padding: '40px' }}>
          
          {/* Architecture View */}
          {activeView === 'architecture' && (
            <div>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                marginBottom: '24px',
                color: '#1f2937'
              }}>
                Hybrid System Components
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                
                {/* Mobile App Layer */}
                <ArchitectureCard
                  title="Custom Mobile App"
                  subtitle="React Native (iOS & Android)"
                  icon={<Smartphone size={32} />}
                  color="#10b981"
                  expanded={expandedSections.mobile}
                  onToggle={() => toggleSection('mobile')}
                  items={[
                    { icon: <Clock size={16} />, text: 'Clock In/Out with GPS', detail: 'Geolocation tracking' },
                    { icon: <FileText size={16} />, text: 'Progress Notes (5 types)', detail: 'Offline capable' },
                    { icon: <AlertCircle size={16} />, text: 'Incident Reporting', detail: 'Real-time alerts' },
                    { icon: <Camera size={16} />, text: 'Photo/Video Capture', detail: 'Activity documentation' },
                    { icon: <Mic size={16} />, text: 'Voice-to-Text', detail: 'Observation dictation' },
                    { icon: <MapPin size={16} />, text: 'Service Location Tracking', detail: 'Compliance verification' }
                  ]}
                />

                {/* Power Platform Layer */}
                <ArchitectureCard
                  title="Power Platform Admin"
                  subtitle="Power Apps & Dataverse"
                  icon={<Monitor size={32} />}
                  color="#8b5cf6"
                  expanded={expandedSections.powerPlatform}
                  onToggle={() => toggleSection('powerPlatform')}
                  items={[
                    { icon: <Users size={16} />, text: 'Client Management', detail: 'ISP tracking' },
                    { icon: <CheckCircle size={16} />, text: 'Note Approval Dashboard', detail: 'Manager interface' },
                    { icon: <BarChart3 size={16} />, text: 'Reporting & Analytics', detail: 'Power BI embedded' },
                    { icon: <FileText size={16} />, text: 'ISP Outcome Tracking', detail: 'Progress monitoring' },
                    { icon: <Users size={16} />, text: 'Staff Management', detail: 'Role assignments' },
                    { icon: <Shield size={16} />, text: 'Compliance Dashboard', detail: 'Audit ready' }
                  ]}
                />

                {/* Backend Layer */}
                <ArchitectureCard
                  title="Custom Backend API"
                  subtitle="Node.js + PostgreSQL"
                  icon={<Database size={32} />}
                  color="#f59e0b"
                  expanded={expandedSections.backend}
                  onToggle={() => toggleSection('backend')}
                  items={[
                    { icon: <Zap size={16} />, text: 'REST API Endpoints', detail: 'Mobile app communication' },
                    { icon: <Database size={16} />, text: 'PostgreSQL Database', detail: 'Primary data store' },
                    { icon: <Shield size={16} />, text: 'Azure AD Authentication', detail: 'SSO integration' },
                    { icon: <Zap size={16} />, text: 'Microsoft Graph API', detail: 'M365 integration' },
                    { icon: <Bell size={16} />, text: 'Real-time Notifications', detail: 'WebSocket support' },
                    { icon: <FileText size={16} />, text: 'Document Processing', detail: 'PDF generation' }
                  ]}
                />

                {/* M365 Integration Layer */}
                <ArchitectureCard
                  title="M365 Services"
                  subtitle="Teams, SharePoint, Power Automate"
                  icon={<Cloud size={32} />}
                  color="#3b82f6"
                  expanded={expandedSections.m365}
                  onToggle={() => toggleSection('m365')}
                  items={[
                    { icon: <Bell size={16} />, text: 'Teams Adaptive Cards', detail: 'Approval requests' },
                    { icon: <FileText size={16} />, text: 'SharePoint Document Library', detail: 'Note storage' },
                    { icon: <Zap size={16} />, text: 'Power Automate Flows', detail: '20+ workflows' },
                    { icon: <BarChart3 size={16} />, text: 'Power BI Reports', detail: 'Advanced analytics' },
                    { icon: <Shield size={16} />, text: 'Azure AD Security', detail: 'MFA & compliance' },
                    { icon: <Users size={16} />, text: 'Teams Collaboration', detail: 'Communication hub' }
                  ]}
                />
              </div>

              {/* Integration Flow Diagram */}
              <div style={{
                marginTop: '40px',
                padding: '32px',
                background: '#f9fafb',
                borderRadius: '16px',
                border: '2px solid #e5e7eb'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  marginBottom: '24px',
                  color: '#1f2937'
                }}>
                  Integration Flow
                </h3>
                <FlowVisualization />
              </div>
            </div>
          )}

          {/* Data Flow View */}
          {activeView === 'dataflow' && (
            <DataFlowView />
          )}

          {/* User Flow View */}
          {activeView === 'userflow' && (
            <UserFlowView />
          )}

          {/* Approval Workflow View */}
          {activeView === 'approval' && (
            <ApprovalWorkflowView />
          )}
        </div>
      </div>
    </div>
  );
};

const ArchitectureCard = ({ title, subtitle, icon, color, expanded, onToggle, items }) => (
  <div style={{
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s'
  }}>
    <div 
      onClick={onToggle}
      style={{
        padding: '24px',
        background: `${color}15`,
        borderBottom: expanded ? '2px solid #e5e7eb' : 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ color: color }}>
          {icon}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            {title}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            {subtitle}
          </p>
        </div>
      </div>
      {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
    </div>
    
    {expanded && (
      <div style={{ padding: '20px 24px' }}>
        {items.map((item, idx) => (
          <div 
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 0',
              borderBottom: idx < items.length - 1 ? '1px solid #f3f4f6' : 'none'
            }}
          >
            <div style={{ color: color, marginTop: '2px', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '2px' }}>
                {item.text}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {item.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const FlowVisualization = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <FlowRow
      from="Mobile App (DSP)"
      to="Backend API"
      label="HTTPS/REST"
      description="Submit notes, clock in/out, upload media"
    />
    <FlowRow
      from="Backend API"
      to="PostgreSQL"
      label="SQL"
      description="Store primary data"
    />
    <FlowRow
      from="Backend API"
      to="Dataverse"
      label="Graph API"
      description="Sync for Power Platform access"
    />
    <FlowRow
      from="Backend API"
      to="Teams"
      label="Graph API"
      description="Send adaptive cards for approvals"
    />
    <FlowRow
      from="Backend API"
      to="SharePoint"
      label="Graph API"
      description="Store final approved documents"
    />
    <FlowRow
      from="Dataverse"
      to="Power Apps"
      label="Direct"
      description="Admin dashboard data access"
    />
    <FlowRow
      from="Power Automate"
      to="All Systems"
      label="Workflows"
      description="Orchestrate approval flows, notifications"
    />
  </div>
);

const FlowRow = ({ from, to, label, description }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  }}>
    <div style={{
      flex: '0 0 200px',
      padding: '12px',
      background: '#eff6ff',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e40af',
      textAlign: 'center'
    }}>
      {from}
    </div>
    
    <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '40px',
        height: '2px',
        background: '#3b82f6'
      }} />
      <div style={{
        padding: '4px 12px',
        background: '#3b82f6',
        color: 'white',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {label}
      </div>
      <div style={{
        width: '0',
        height: '0',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: '10px solid #3b82f6'
      }} />
    </div>
    
    <div style={{
      flex: '0 0 200px',
      padding: '12px',
      background: '#f0fdf4',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#15803d',
      textAlign: 'center'
    }}>
      {to}
    </div>
    
    <div style={{
      flex: 1,
      fontSize: '13px',
      color: '#6b7280',
      fontStyle: 'italic'
    }}>
      {description}
    </div>
  </div>
);

const DataFlowView = () => (
  <div>
    <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
      Data Flow Scenarios
    </h2>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {[
        {
          title: '1. Progress Note Creation & Submission',
          color: '#10b981',
          steps: [
            { actor: 'DSP', action: 'Opens mobile app, clocks in with GPS' },
            { actor: 'Mobile App', action: 'Sends location & time to Backend API' },
            { actor: 'Backend API', action: 'Validates and stores in PostgreSQL' },
            { actor: 'DSP', action: 'Completes progress note with photos/voice' },
            { actor: 'Mobile App', action: 'Uploads media to Azure Blob Storage' },
            { actor: 'Mobile App', action: 'Submits note data to Backend API' },
            { actor: 'Backend API', action: 'Stores note in PostgreSQL (status: Pending)' },
            { actor: 'Backend API', action: 'Syncs to Dataverse for Power Platform' },
            { actor: 'Backend API', action: 'Triggers Power Automate flow' },
            { actor: 'Power Automate', action: 'Sends adaptive card to manager in Teams' }
          ]
        },
        {
          title: '2. Manager Approval Process',
          color: '#3b82f6',
          steps: [
            { actor: 'Manager', action: 'Receives adaptive card in Teams' },
            { actor: 'Manager', action: 'Clicks "Approve" button' },
            { actor: 'Teams', action: 'Sends approval webhook to Power Automate' },
            { actor: 'Power Automate', action: 'Calls Backend API to update note status' },
            { actor: 'Backend API', action: 'Updates PostgreSQL (status: Approved)' },
            { actor: 'Backend API', action: 'Generates PDF of note' },
            { actor: 'Backend API', action: 'Uploads PDF to SharePoint document library' },
            { actor: 'Backend API', action: 'Sends notification to DSP mobile app' },
            { actor: 'Backend API', action: 'Logs audit trail' }
          ]
        },
        {
          title: '3. Incident Report with Alert',
          color: '#ef4444',
          steps: [
            { actor: 'DSP', action: 'Reports incident in mobile app' },
            { actor: 'Mobile App', action: 'Captures photo/video + GPS location' },
            { actor: 'Mobile App', action: 'Submits to Backend API (priority: High)' },
            { actor: 'Backend API', action: 'Stores in PostgreSQL' },
            { actor: 'Backend API', action: 'Immediately triggers Power Automate' },
            { actor: 'Power Automate', action: 'Posts urgent message to Teams incident channel' },
            { actor: 'Power Automate', action: 'Sends email to supervisor' },
            { actor: 'Power Automate', action: 'Creates task in Planner for follow-up' },
            { actor: 'Power Automate', action: 'Sends push notification to on-call manager' }
          ]
        }
      ].map((scenario, idx) => (
        <div key={idx} style={{
          padding: '24px',
          background: '#f9fafb',
          borderRadius: '16px',
          border: '2px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            color: scenario.color
          }}>
            {scenario.title}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scenario.steps.map((step, stepIdx) => (
              <div key={stepIdx} style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  flex: '0 0 140px',
                  padding: '8px 12px',
                  background: 'white',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: scenario.color,
                  border: `1px solid ${scenario.color}30`
                }}>
                  {step.actor}
                </div>
                
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: scenario.color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {stepIdx + 1}
                </div>
                
                <div style={{
                  flex: 1,
                  padding: '8px 0',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  {step.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UserFlowView = () => (
  <div>
    <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
      User Journey Maps
    </h2>
    
    <div style={{ display: 'grid', gap: '24px' }}>
      {[
        {
          role: 'Direct Support Professional (DSP)',
          color: '#10b981',
          journey: [
            { time: '9:00 AM', action: 'Opens mobile app', screen: 'Home', detail: 'Views assigned clients for the day' },
            { time: '9:05 AM', action: 'Clocks in', screen: 'Clock In/Out', detail: 'GPS verification, selects client & service type' },
            { time: '9:30 AM', action: 'Starts community activity', screen: 'Activity Tracker', detail: 'Café visit - uses pre-loaded activity template' },
            { time: '9:45 AM', action: 'Documents activity', screen: 'Progress Note', detail: 'Takes photo, selects prompt level, dictates observation' },
            { time: '10:30 AM', action: 'Reports minor incident', screen: 'Incident Report', detail: 'Fill form, attach photo, submit' },
            { time: '11:00 AM', action: 'Completes service', screen: 'Progress Note', detail: 'Finalizes note, reviews, submits' },
            { time: '11:05 AM', action: 'Clocks out', screen: 'Clock In/Out', detail: 'Auto-calculates time, confirms' },
            { time: '2:00 PM', action: 'Receives notification', screen: 'Notifications', detail: 'Note approved by manager' }
          ]
        },
        {
          role: 'Manager/Supervisor',
          color: '#3b82f6',
          journey: [
            { time: '8:00 AM', action: 'Checks Power Apps dashboard', screen: 'Dashboard', detail: 'Reviews pending approvals, staff schedules' },
            { time: '11:10 AM', action: 'Receives Teams notification', screen: 'Microsoft Teams', detail: 'Adaptive card for new progress note' },
            { time: '11:12 AM', action: 'Reviews note in card', screen: 'Teams Adaptive Card', detail: 'Sees summary, photos, prompt levels' },
            { time: '11:15 AM', action: 'Clicks "Approve"', screen: 'Teams', detail: 'Adds comment "Great work on prompt fading!"' },
            { time: '11:20 AM', action: 'Reviews incident alert', screen: 'Teams Incident Channel', detail: 'High priority incident posted' },
            { time: '11:25 AM', action: 'Opens Power Apps', screen: 'Incident Dashboard', detail: 'Reviews full incident details, assigns follow-up' },
            { time: '3:00 PM', action: 'Runs weekly report', screen: 'Power BI', detail: 'Service hours, prompt progression, ISP outcomes' },
            { time: '4:00 PM', action: 'Reviews in SharePoint', screen: 'SharePoint', detail: 'Checks approved notes for the week' }
          ]
        },
        {
          role: 'Administrator',
          color: '#8b5cf6',
          journey: [
            { time: '9:00 AM', action: 'Opens admin portal', screen: 'Power Apps Admin', detail: 'System health check' },
            { time: '9:15 AM', action: 'Adds new staff member', screen: 'User Management', detail: 'Assigns role, sends invite' },
            { time: '9:30 AM', action: 'Configures Azure AD', screen: 'Azure Portal', detail: 'Sets up MFA for new user' },
            { time: '10:00 AM', action: 'Reviews compliance', screen: 'Compliance Dashboard', detail: 'Audit logs, data retention status' },
            { time: '11:00 AM', action: 'Exports data', screen: 'Reports', detail: 'Monthly DDD report for state submission' },
            { time: '2:00 PM', action: 'Updates forms', screen: 'Form Builder', detail: 'Adds new ISP outcome category' },
            { time: '3:00 PM', action: 'Monitors system', screen: 'Analytics', detail: 'App usage, performance metrics' }
          ]
        }
      ].map((userflow, idx) => (
        <div key={idx} style={{
          padding: '24px',
          background: '#f9fafb',
          borderRadius: '16px',
          border: `2px solid ${userflow.color}30`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <Users size={24} style={{ color: userflow.color }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: 0,
              color: userflow.color
            }}>
              {userflow.role}
            </h3>
          </div>
          
          <div style={{ position: 'relative', paddingLeft: '40px' }}>
            <div style={{
              position: 'absolute',
              left: '15px',
              top: '12px',
              bottom: '12px',
              width: '2px',
              background: `${userflow.color}30`
            }} />
            
            {userflow.journey.map((step, stepIdx) => (
              <div key={stepIdx} style={{
                position: 'relative',
                marginBottom: '24px',
                paddingBottom: '24px',
                borderBottom: stepIdx < userflow.journey.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '-28px',
                  top: '4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: userflow.color,
                  border: '3px solid white',
                  boxShadow: '0 0 0 2px #f9fafb'
                }} />
                
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: userflow.color,
                  marginBottom: '4px'
                }}>
                  {step.time}
                </div>
                
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  {step.action}
                </div>
                
                <div style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  background: `${userflow.color}15`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: userflow.color,
                  marginBottom: '8px'
                }}>
                  📱 {step.screen}
                </div>
                
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  {step.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ApprovalWorkflowView = () => (
  <div>
    <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
      Teams Approval Workflow - Detailed Flow
    </h2>
    
    <div style={{
      padding: '32px',
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      borderRadius: '16px',
      marginBottom: '32px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {[
          {
            step: 1,
            title: 'Note Submission',
            actor: 'DSP via Mobile App',
            actions: [
              'DSP completes progress note form',
              'Attaches photos/videos from activity',
              'Uses voice-to-text for observations',
              'Reviews and clicks "Submit for Approval"'
            ],
            system: 'Mobile app validates all required fields',
            nextStep: 'Sends HTTPS POST to Backend API'
          },
          {
            step: 2,
            title: 'Backend Processing',
            actor: 'Backend API',
            actions: [
              'Receives note data and media files',
              'Validates data integrity and completeness',
              'Stores note in PostgreSQL (status: Pending)',
              'Uploads media to Azure Blob Storage',
              'Syncs note record to Dataverse'
            ],
            system: 'Transaction committed, audit log created',
            nextStep: 'Triggers Power Automate flow'
          },
          {
            step: 3,
            title: 'Workflow Trigger',
            actor: 'Power Automate',
            actions: [
              'Flow triggered by new Dataverse record',
              'Retrieves client details and manager assignment',
              'Generates note summary using AI',
              'Fetches attached media URLs',
              'Builds adaptive card JSON payload'
            ],
            system: 'Template engine creates personalized card',
            nextStep: 'Posts card to Microsoft Teams'
          },
          {
            step: 4,
            title: 'Teams Notification',
            actor: 'Microsoft Teams',
            actions: [
              'Adaptive card posted to manager\'s Teams chat',
              'Card displays: Client name, service type, date/time',
              'Shows activity summary and prompt levels used',
              'Includes thumbnail preview of photos',
              'Presents action buttons: Approve, Request Changes, Reject'
            ],
            system: 'Push notification sent to manager\'s devices',
            nextStep: 'Waits for manager action'
          },
          {
            step: 5,
            title: 'Manager Review',
            actor: 'Manager',
            actions: [
              'Opens Teams on mobile or desktop',
              'Reviews adaptive card details',
              'Clicks photos to view full size',
              'Reads objective observations',
              'Decides: Approve / Request Changes / Reject'
            ],
            system: 'Click tracked, timestamp recorded',
            nextStep: 'Action submitted to Power Automate'
          },
          {
            step: 6,
            title: 'Approval Action Processing',
            actor: 'Power Automate + Backend API',
            actions: [
              'Power Automate receives button click webhook',
              'If APPROVED: Calls Backend API with approval status',
              'Backend updates PostgreSQL (status: Approved, approved_by, approved_at)',
              'Backend generates PDF version of note',
              'PDF uploaded to SharePoint document library',
              'Notification sent to DSP mobile app'
            ],
            system: 'Card updated in Teams showing "✓ Approved"',
            nextStep: 'Note finalized and archived'
          },
          {
            step: 7,
            title: 'Document Archival',
            actor: 'SharePoint + Backend',
            actions: [
              'Note PDF stored in client\'s SharePoint folder',
              'Metadata tagged: Client, Date, Service Type, Staff, Status',
              'Version history initialized',
              'Retention policy applied (7 years)',
              'Search index updated'
            ],
            system: 'Document accessible via SharePoint and Power Apps',
            nextStep: 'Available for reporting and audits'
          }
        ].map((flow, idx) => (
          <div key={idx} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '2px solid #3b82f6',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '24px',
              left: '-16px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#3b82f6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '700',
              border: '4px solid #eff6ff'
            }}>
              {flow.step}
            </div>
            
            <div style={{ paddingLeft: '40px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '8px'
              }}>
                {flow.title}
              </h3>
              
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: '#dbeafe',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '16px'
              }}>
                {flow.actor}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                {flow.actions.map((action, aIdx) => (
                  <div key={aIdx} style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '8px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      marginTop: '7px',
                      flexShrink: 0
                    }} />
                    <div style={{ fontSize: '14px', color: '#374151' }}>
                      {action}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                padding: '12px',
                background: '#f0f9ff',
                borderRadius: '8px',
                borderLeft: '3px solid #3b82f6',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                  SYSTEM BEHAVIOR
                </div>
                <div style={{ fontSize: '13px', color: '#1e40af' }}>
                  {flow.system}
                </div>
              </div>
              
              {idx < 6 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#059669'
                }}>
                  <div style={{
                    width: '30px',
                    height: '2px',
                    background: '#059669'
                  }} />
                  {flow.nextStep}
                  <div style={{
                    width: '0',
                    height: '0',
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderLeft: '8px solid #059669'
                  }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Alternative Paths */}
    <div style={{
      padding: '24px',
      background: '#fef3c7',
      borderRadius: '16px',
      border: '2px solid #f59e0b'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#92400e',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <AlertCircle size={20} />
        Alternative Workflow Paths
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AlternativePath
          trigger="Manager clicks 'Request Changes'"
          flow={[
            'Manager adds comment in Teams card',
            'Backend updates note (status: Revisions Requested)',
            'Push notification sent to DSP',
            'DSP edits note in mobile app',
            'Note resubmitted → workflow restarts at Step 2'
          ]}
          color="#f59e0b"
        />
        
        <AlternativePath
          trigger="Manager clicks 'Reject'"
          flow={[
            'Manager provides rejection reason in Teams',
            'Backend updates note (status: Rejected)',
            'Notification sent to DSP and supervisor',
            'Note archived as rejected',
            'Incident flag created for supervisor review'
          ]}
          color="#ef4444"
        />
        
        <AlternativePath
          trigger="No response within 24 hours"
          flow={[
            'Power Automate scheduled check runs',
            'Escalation card sent to supervisor',
            'Email reminder sent to manager',
            'Note remains in Pending status',
            'Compliance alert generated'
          ]}
          color="#8b5cf6"
        />
      </div>
    </div>
  </div>
);

const AlternativePath = ({ trigger, flow, color }) => (
  <div style={{
    padding: '16px',
    background: 'white',
    borderRadius: '12px',
    border: `2px solid ${color}`
  }}>
    <div style={{
      fontSize: '14px',
      fontWeight: '600',
      color: color,
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color
      }} />
      {trigger}
    </div>
    
    <div style={{ paddingLeft: '20px' }}>
      {flow.map((step, idx) => (
        <div key={idx} style={{
          fontSize: '13px',
          color: '#374151',
          marginBottom: '6px',
          display: 'flex',
          gap: '8px'
        }}>
          <span style={{ color: color, fontWeight: '600' }}>→</span>
          {step}
        </div>
      ))}
    </div>
  </div>
);

export default FlowDiagram;
