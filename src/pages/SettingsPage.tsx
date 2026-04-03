import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/config/firebase';
import { APP_VERSION } from '@/config/constants';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import {
  User, Wind, Info, LogOut, Bell, Users,
  FileText, Settings, Sliders, ChevronRight, Check,
  Lock, Eye, Palette, HelpCircle,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────── */
type TabId = 'profile' | 'appearance' | 'workflow' | 'documents' | 'notifications' | 'team' | 'about';

interface Tab { id: TabId; label: string; icon: typeof User; badge?: string }

const TABS: Tab[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'appearance',    label: 'Appearance',     icon: Palette },
  { id: 'workflow',      label: 'Workflow',       icon: Sliders },
  { id: 'documents',     label: 'Documents',      icon: FileText },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'team',          label: 'Team',           icon: Users },
  { id: 'about',         label: 'About',          icon: Info },
];

/* ─── Shared primitives ─────────────────────────────────────────────── */

function SectionHeader({ icon: Icon, title, description }: { icon: typeof User; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="rounded-xl p-2.5" style={{ background: 'rgb(244 166 35 / 0.10)', border: '1px solid rgb(244 166 35 / 0.18)' }}>
        <Icon size={16} style={{ color: '#F4A623' }} />
      </div>
      <div>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: '#EBF0FA' }}>
          {title}
        </h3>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: '#6B7E98' }}>{description}</p>
        )}
      </div>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{ background: '#111928', border: '1px solid rgb(255 255 255 / 0.06)' }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block mb-1.5 text-xs font-medium"
      style={{ fontFamily: "'Figtree', sans-serif", color: '#8A95AA' }}
    >
      {children}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, type = 'text', id,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; id?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
      style={{
        fontFamily: "'Figtree', sans-serif",
        background: 'rgb(255 255 255 / 0.04)',
        border: focused ? '1px solid rgb(244 166 35 / 0.40)' : '1px solid rgb(255 255 255 / 0.08)',
        boxShadow: focused ? '0 0 0 3px rgb(244 166 35 / 0.06)' : 'none',
        color: '#EBF0FA',
      }}
    />
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: '1px solid rgb(255 255 255 / 0.05)' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: '#EBF0FA' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: '#6B7E98' }}>{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 h-6 rounded-full transition-all duration-200"
        style={{
          width: '44px',
          background: checked ? 'linear-gradient(135deg, #F4A623, #E08B10)' : 'rgb(255 255 255 / 0.08)',
          boxShadow: checked ? '0 0 12px rgb(244 166 35 / 0.25)' : 'none',
        }}
      >
        <span
          className="absolute top-0.5 rounded-full bg-white transition-all duration-200"
          style={{
            width: '20px',
            height: '20px',
            left: checked ? 'calc(100% - 22px)' : '2px',
            boxShadow: '0 1px 4px rgb(0 0 0 / 0.3)',
          }}
        />
      </button>
    </div>
  );
}

function PrimaryButton({ onClick, children, disabled = false }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
      style={{
        fontFamily: "'Figtree', sans-serif",
        background: disabled ? 'rgb(255 255 255 / 0.05)' : 'linear-gradient(135deg, #F4A623 0%, #E08B10 100%)',
        color: disabled ? '#4A5568' : '#fff',
        boxShadow: disabled ? 'none' : '0 2px 12px rgb(244 166 35 / 0.25)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgb(244 166 35 / 0.35)'; }}
      onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgb(244 166 35 / 0.25)'; }}
    >
      {children}
    </button>
  );
}

function DangerButton({ onClick, children, loading = false }: { onClick?: () => void; children: React.ReactNode; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
      style={{
        fontFamily: "'Figtree', sans-serif",
        background: 'rgb(255 75 91 / 0.12)',
        color: '#FF4B5B',
        border: '1px solid rgb(255 75 91 / 0.25)',
        cursor: loading ? 'wait' : 'pointer',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgb(255 75 91 / 0.20)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgb(255 75 91 / 0.12)'; }}
    >
      {children}
    </button>
  );
}

/* ─── Tab content panels ─────────────────────────────────────────────── */

function ProfileTab({ user, onSave }: { user: ReturnType<typeof useAuthStore>['user']; onSave: (data: { company: string; licenseNumber: string; displayName: string }) => void }) {
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [company, setCompany] = useState(user?.company ?? '');
  const [license, setLicense] = useState(user?.licenseNumber ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ company, licenseNumber: license, displayName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <SectionHeader icon={User} title="Profile" description="Your personal and professional information" />

      {/* Account info card */}
      {user && (
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0"
              style={{ background: 'linear-gradient(135deg, #F4A623 0%, #E08B10 100%)', boxShadow: '0 0 20px rgb(244 166 35 / 0.25)' }}
            >
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                {(user.displayName?.trim()[0] ?? user.email?.[0] ?? '?').toUpperCase()}
              </span>
            </div>
            <div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, color: '#EBF0FA', fontSize: '15px' }}>
                {user.displayName || 'No display name'}
              </p>
              <p className="text-sm" style={{ color: '#6B7E98' }}>{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#0ECC89' }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#0ECC89', letterSpacing: '0.06em' }}>
                  CLOUD SYNC ACTIVE
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Display Name</FieldLabel>
              <TextInput value={displayName} onChange={setDisplayName} placeholder="Your full name" />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <TextInput value={user.email ?? ''} onChange={() => {}} placeholder="Email" type="email" />
            </div>
            <div>
              <FieldLabel>Company / Organization</FieldLabel>
              <TextInput value={company} onChange={setCompany} placeholder="ABC Permit Services" />
            </div>
            <div>
              <FieldLabel>Professional License Number</FieldLabel>
              <TextInput value={license} onChange={setLicense} placeholder="FL-XXXXXX" />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgb(255 255 255 / 0.05)' }}>
            <PrimaryButton onClick={handleSave}>
              {saved ? <><Check size={14} /> Saved!</> : 'Save Profile'}
            </PrimaryButton>
            {saved && (
              <span className="text-sm animate-pp-fade-in" style={{ color: '#0ECC89' }}>
                Changes saved successfully
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Security card */}
      <Card>
        <SectionHeader icon={Lock} title="Security" description="Password and authentication settings" />
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgb(255 255 255 / 0.05)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#EBF0FA' }}>Password</p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7E98' }}>Last changed: unknown</p>
            </div>
            <button className="text-xs rounded-lg px-3 py-1.5 transition-all"
              style={{ color: '#F4A623', background: 'rgb(244 166 35 / 0.08)', border: '1px solid rgb(244 166 35 / 0.18)' }}
            >
              Change Password
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium" style={{ color: '#EBF0FA' }}>Two-Factor Authentication</p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7E98' }}>Add an extra layer of security</p>
            </div>
            <span
              className="text-xs rounded-full px-2 py-1"
              style={{ background: 'rgb(107 126 152 / 0.12)', color: '#6B7E98', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}
            >
              NOT SET UP
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AppearanceTab({ darkMode, onToggleDarkMode }: { darkMode: boolean; onToggleDarkMode: () => void }) {
  const [compactMode, setCompactMode] = useState(false);
  const [showGridlines, setShowGridlines] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  return (
    <div className="space-y-5">
      <SectionHeader icon={Palette} title="Appearance" description="Customize the look and feel of your workspace" />

      <Card>
        <Toggle
          checked={darkMode}
          onChange={onToggleDarkMode}
          label="Dark Mode"
          description="Use the dark color scheme (recommended for extended use)"
        />
        <Toggle
          checked={compactMode}
          onChange={setCompactMode}
          label="Compact Mode"
          description="Reduce spacing to show more content on screen"
        />
        <Toggle
          checked={animationsEnabled}
          onChange={setAnimationsEnabled}
          label="Interface Animations"
          description="Enable transitions and micro-interactions"
        />
        <Toggle
          checked={highContrast}
          onChange={setHighContrast}
          label="High Contrast Mode"
          description="Increase contrast for better accessibility"
        />
        <div className="pt-2">
          <Toggle
            checked={showGridlines}
            onChange={setShowGridlines}
            label="Show Table Gridlines"
            description="Display gridlines in data tables"
          />
        </div>
      </Card>

      {/* Theme preview */}
      <Card>
        <p className="text-sm font-medium mb-4" style={{ color: '#8A95AA' }}>Color Theme</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Amber Command', primary: '#F4A623', bg: '#080C14', active: true },
            { name: 'Ocean Blue', primary: '#3B82F6', bg: '#030711', active: false },
            { name: 'Emerald', primary: '#10B981', bg: '#030E0B', active: false },
          ].map((theme) => (
            <button
              key={theme.name}
              type="button"
              className="rounded-xl p-3 text-left transition-all"
              style={{
                background: theme.bg,
                border: theme.active ? `2px solid ${theme.primary}` : '2px solid rgb(255 255 255 / 0.08)',
                boxShadow: theme.active ? `0 0 16px ${theme.primary}25` : 'none',
              }}
            >
              <div className="h-4 w-full rounded mb-2" style={{ background: theme.primary, opacity: 0.7 }} />
              <p className="text-xs font-medium" style={{ color: theme.active ? '#EBF0FA' : '#6B7E98', fontFamily: "'Figtree', sans-serif" }}>
                {theme.name}
              </p>
              {theme.active && (
                <div className="flex items-center gap-1 mt-1">
                  <Check size={9} style={{ color: theme.primary }} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: theme.primary }}>ACTIVE</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WorkflowTab() {
  const [autoScan, setAutoScan] = useState(true);
  const [requireAllDocs, setRequireAllDocs] = useState(false);
  const [autoStatus, setAutoStatus] = useState(true);
  const [waiverApproval, setWaiverApproval] = useState(true);

  const statuses = [
    { from: 'draft', to: 'in-progress', label: 'Draft → In Progress', trigger: 'First document uploaded' },
    { from: 'in-progress', to: 'review', label: 'In Progress → Review', trigger: 'All checklist items complete' },
    { from: 'review', to: 'submitted', label: 'Review → Submitted', trigger: 'All documents approved' },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader icon={Sliders} title="Workflow" description="Configure automatic status transitions and workflow rules" />

      <Card>
        <p className="text-sm font-medium mb-4" style={{ fontFamily: "'Syne', sans-serif", color: '#EBF0FA' }}>
          Automation Rules
        </p>
        <Toggle
          checked={autoScan}
          onChange={setAutoScan}
          label="Auto Pre-Flight Scan"
          description="Run compliance scan automatically when documents are uploaded"
        />
        <Toggle
          checked={autoStatus}
          onChange={setAutoStatus}
          label="Auto Status Transitions"
          description="Automatically advance permit status based on checklist completion"
        />
        <Toggle
          checked={requireAllDocs}
          onChange={setRequireAllDocs}
          label="Require All Documents Before Submission"
          description="Block submission until all required documents are uploaded and approved"
        />
        <div className="pt-2">
          <Toggle
            checked={waiverApproval}
            onChange={setWaiverApproval}
            label="Require Reason for Waivers"
            description="Mandate a written reason when overriding checklist requirements"
          />
        </div>
      </Card>

      {/* Status transitions */}
      <Card>
        <p className="text-sm font-medium mb-4" style={{ fontFamily: "'Syne', sans-serif", color: '#EBF0FA' }}>
          Status Transition Triggers
        </p>
        <div className="space-y-2">
          {statuses.map((s) => (
            <div
              key={s.from}
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{ background: 'rgb(255 255 255 / 0.03)', border: '1px solid rgb(255 255 255 / 0.05)' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 rounded" style={{ background: 'rgb(107 126 152 / 0.15)', color: '#8A95AA' }}>
                    {s.from}
                  </span>
                  <ChevronRight size={12} style={{ color: '#4A5568' }} />
                  <span className="text-xs font-medium px-2 py-1 rounded" style={{ background: 'rgb(244 166 35 / 0.10)', color: '#F4A623' }}>
                    {s.to}
                  </span>
                </div>
              </div>
              <span className="text-xs" style={{ color: '#4A5568' }}>{s.trigger}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DocumentsTab() {
  const requiredDocTypes = [
    { id: 'site-plan', label: 'Site Plan', required: true, forMobile: true, forModular: true },
    { id: 'deed', label: 'Property Deed', required: true, forMobile: true, forModular: true },
    { id: 'noc', label: 'Notice of Commencement', required: true, forMobile: true, forModular: true },
    { id: 'data-plate', label: 'Data Plate / HUD Label', required: true, forMobile: true, forModular: false },
    { id: 'blocking-chart', label: 'Blocking Chart', required: true, forMobile: true, forModular: false },
    { id: 'elevation-cert', label: 'Elevation Certificate', required: false, forMobile: true, forModular: true },
    { id: 'floor-plan', label: 'Floor Plan', required: false, forMobile: false, forModular: true },
  ];

  const [docs, setDocs] = useState(requiredDocTypes);

  const toggleRequired = (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, required: !d.required } : d));
  };

  return (
    <div className="space-y-5">
      <SectionHeader icon={FileText} title="Document Configuration" description="Manage required document types and their applicability" />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium" style={{ fontFamily: "'Syne', sans-serif", color: '#EBF0FA' }}>
            Required Document Types
          </p>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#4A5568', letterSpacing: '0.06em' }}>
            {docs.filter(d => d.required).length} REQUIRED
          </span>
        </div>

        <div className="space-y-1.5">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg px-3 py-3"
              style={{
                background: doc.required ? 'rgb(244 166 35 / 0.04)' : 'rgb(255 255 255 / 0.02)',
                border: doc.required ? '1px solid rgb(244 166 35 / 0.12)' : '1px solid rgb(255 255 255 / 0.04)',
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleRequired(doc.id)}
                  className="h-4 w-4 rounded flex items-center justify-center transition-all shrink-0"
                  style={{
                    background: doc.required ? 'linear-gradient(135deg, #F4A623, #E08B10)' : 'rgb(255 255 255 / 0.06)',
                    border: doc.required ? 'none' : '1px solid rgb(255 255 255 / 0.12)',
                  }}
                >
                  {doc.required && <Check size={10} className="text-white" />}
                </button>
                <span className="text-sm font-medium" style={{ color: doc.required ? '#EBF0FA' : '#6B7E98' }}>
                  {doc.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {doc.forMobile && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ fontFamily: "'DM Mono', monospace", background: 'rgb(91 155 255 / 0.10)', color: '#5B9BFF', border: '1px solid rgb(91 155 255 / 0.18)' }}>
                    MOBILE
                  </span>
                )}
                {doc.forModular && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ fontFamily: "'DM Mono', monospace", background: 'rgb(167 139 250 / 0.10)', color: '#A78BFA', border: '1px solid rgb(167 139 250 / 0.18)' }}>
                    MODULAR
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 flex" style={{ borderTop: '1px solid rgb(255 255 255 / 0.05)' }}>
          <PrimaryButton>
            Save Document Config
          </PrimaryButton>
        </div>
      </Card>

      {/* OCR settings */}
      <Card>
        <SectionHeader icon={Eye} title="OCR / Auto-Extraction" description="Configure AI document scanning behavior" />
        <Toggle checked={true} onChange={() => {}} label="Enable OCR on Upload" description="Automatically extract data from uploaded documents" />
        <Toggle checked={true} onChange={() => {}} label="Auto-flag Low Confidence" description="Highlight documents where OCR confidence is below 70%" />
        <div className="pt-2">
          <Toggle checked={false} onChange={() => {}} label="OCR on All Document Types" description="Run OCR on all files, not just deed/data-plate/NOC" />
        </div>
      </Card>
    </div>
  );
}

function NotificationsTab() {
  const [emailDigest, setEmailDigest] = useState(true);
  const [statusChanges, setStatusChanges] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [scanFailures, setScanFailures] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);

  return (
    <div className="space-y-5">
      <SectionHeader icon={Bell} title="Notifications" description="Control when and how you receive alerts" />

      <Card>
        <p className="text-sm font-medium mb-4" style={{ fontFamily: "'Syne', sans-serif", color: '#EBF0FA' }}>
          In-App Notifications
        </p>
        <Toggle checked={statusChanges} onChange={setStatusChanges} label="Status Changes" description="Alert when a permit status is updated" />
        <Toggle checked={approvalAlerts} onChange={setApprovalAlerts} label="Document Approvals" description="Alert when documents are approved or rejected" />
        <Toggle checked={scanFailures} onChange={setScanFailures} label="Pre-Flight Failures" description="Alert when compliance scan finds critical issues" />
        <div className="pt-2">
          <Toggle checked={deadlineReminders} onChange={setDeadlineReminders} label="Deadline Reminders" description="Remind you of upcoming permit deadlines" />
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium mb-4" style={{ fontFamily: "'Syne', sans-serif", color: '#EBF0FA' }}>
          Email Notifications
        </p>
        <Toggle checked={emailDigest} onChange={setEmailDigest} label="Daily Digest Email" description="Receive a summary of all activity each morning" />
        <div className="pt-2">
          <Toggle checked={weeklyReport} onChange={setWeeklyReport} label="Weekly Status Report" description="Get a weekly overview of all active permits" />
        </div>
      </Card>
    </div>
  );
}

function TeamTab() {
  const members = [
    { name: 'Sean Swonger', email: 'sean@permitpro.fl', role: 'Admin', status: 'active' as const },
    { name: 'Maria Garcia', email: 'maria@permitpro.fl', role: 'Coordinator', status: 'active' as const },
    { name: 'James Parker', email: 'james@permitpro.fl', role: 'Reviewer', status: 'inactive' as const },
  ];

  const roleColors: Record<string, { color: string; bg: string }> = {
    Admin: { color: '#F4A623', bg: 'rgb(244 166 35 / 0.10)' },
    Coordinator: { color: '#5B9BFF', bg: 'rgb(91 155 255 / 0.10)' },
    Reviewer: { color: '#0ECC89', bg: 'rgb(14 204 137 / 0.10)' },
  };

  const [inviteEmail, setInviteEmail] = useState('');

  return (
    <div className="space-y-5">
      <SectionHeader icon={Users} title="Team Management" description="Manage who has access to your PermitPro workspace" />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium" style={{ fontFamily: "'Syne', sans-serif", color: '#EBF0FA' }}>
            Team Members
          </p>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#4A5568', letterSpacing: '0.06em' }}>
            {members.filter(m => m.status === 'active').length} ACTIVE
          </span>
        </div>

        <div className="space-y-2">
          {members.map((member) => {
            const rc = roleColors[member.role] ?? { color: '#6B7E98', bg: 'rgb(107 126 152 / 0.10)' };
            return (
              <div
                key={member.email}
                className="flex items-center gap-3 rounded-lg px-4 py-3"
                style={{ background: 'rgb(255 255 255 / 0.03)', border: '1px solid rgb(255 255 255 / 0.05)' }}
              >
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: rc.bg, border: `1px solid ${rc.color}30` }}
                >
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: 700, color: rc.color }}>
                    {member.name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: member.status === 'active' ? '#EBF0FA' : '#6B7E98' }}>
                    {member.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#4A5568' }}>{member.email}</p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{ color: rc.color, background: rc.bg, border: `1px solid ${rc.color}25`, fontFamily: "'Figtree', sans-serif", fontWeight: 600, fontSize: '11px' }}
                >
                  {member.role}
                </span>
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: member.status === 'active' ? '#0ECC89' : '#4A5568' }}
                  title={member.status}
                />
              </div>
            );
          })}
        </div>

        {/* Invite form */}
        <div className="mt-5 pt-5 flex gap-3" style={{ borderTop: '1px solid rgb(255 255 255 / 0.05)' }}>
          <div className="flex-1">
            <FieldLabel>Invite by Email</FieldLabel>
            <TextInput value={inviteEmail} onChange={setInviteEmail} placeholder="colleague@company.com" type="email" />
          </div>
          <div className="flex items-end">
            <PrimaryButton disabled={!inviteEmail.trim()}>
              Send Invite
            </PrimaryButton>
          </div>
        </div>
      </Card>

      {/* Roles reference */}
      <Card>
        <p className="text-sm font-medium mb-4" style={{ fontFamily: "'Syne', sans-serif", color: '#EBF0FA' }}>Role Permissions</p>
        <div className="space-y-2">
          {[
            { role: 'Admin', perms: ['Full access', 'Manage team', 'Delete permits', 'Configure settings'] },
            { role: 'Coordinator', perms: ['Create & edit permits', 'Upload documents', 'View all permits'] },
            { role: 'Reviewer', perms: ['View permits', 'Approve/reject documents', 'Add notes'] },
          ].map(({ role, perms }) => {
            const rc = roleColors[role] ?? { color: '#6B7E98', bg: 'rgb(107 126 152 / 0.10)' };
            return (
              <div
                key={role}
                className="flex items-start gap-3 rounded-lg px-3 py-3"
                style={{ background: rc.bg, border: `1px solid ${rc.color}20` }}
              >
                <span className="text-xs font-semibold w-20 shrink-0 pt-0.5" style={{ color: rc.color }}>
                  {role}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {perms.map(p => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded"
                      style={{ background: 'rgb(255 255 255 / 0.05)', color: '#8A95AA' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function AboutTab({ onSignOut, signingOut }: { onSignOut: () => void; signingOut: boolean }) {
  const shortcuts = [
    { keys: ['Ctrl', 'N'], desc: 'New permit' },
    { keys: ['Ctrl', 'K'], desc: 'Focus search' },
    { keys: ['Ctrl', 'D'], desc: 'Toggle dark mode' },
    { keys: ['Esc'], desc: 'Close modal / cancel' },
  ];

  const windZones = [
    { zone: 'Zone I', desc: 'Interior counties — standard wind loads', color: '#0ECC89' },
    { zone: 'Zone II', desc: 'Moderate exposure — most inland counties', color: '#F4D03F' },
    { zone: 'Zone III', desc: 'Coastal / HVHZ — highest wind requirement', color: '#FF4B5B' },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader icon={Info} title="About PermitPro FL" description="Version info, keyboard shortcuts, and legal" />

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F4A623 0%, #E08B10 100%)', boxShadow: '0 0 20px rgb(244 166 35 / 0.25)' }}
          >
            <Settings size={22} className="text-white" />
          </div>
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: '#EBF0FA' }}>
              PermitPro FL
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7E98' }}>Florida Manufactured Housing Permit Suite</p>
          </div>
          <div className="ml-auto">
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ fontFamily: "'DM Mono', monospace", background: 'rgb(244 166 35 / 0.10)', color: '#F4A623', border: '1px solid rgb(244 166 35 / 0.25)' }}
            >
              v{APP_VERSION}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs" style={{ color: '#4A5568' }}>
          {[
            ['Framework', 'React 19 + Vite 8'],
            ['Styling', 'Tailwind CSS v4'],
            ['Database', 'Firebase Firestore'],
            ['Auth', 'Firebase Auth'],
            ['Storage', 'Firebase Storage'],
            ['AI', 'Gemini Vision API'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg px-3 py-2.5" style={{ background: 'rgb(255 255 255 / 0.03)', border: '1px solid rgb(255 255 255 / 0.05)' }}>
              <p style={{ color: '#4A5568', fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.08em' }}>{k}</p>
              <p className="mt-1 font-medium" style={{ color: '#8A95AA' }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Wind zone reference */}
      <Card>
        <SectionHeader icon={Wind} title="Florida Wind Zone Reference" />
        <div className="space-y-2">
          {windZones.map(({ zone, desc, color }) => (
            <div
              key={zone}
              className="flex items-center gap-4 rounded-lg px-4 py-3"
              style={{ background: 'rgb(255 255 255 / 0.03)', border: `1px solid ${color}18` }}
            >
              <div className="h-3 w-3 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}60` }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color, fontWeight: 500 }}>{zone}</span>
              <span className="text-xs" style={{ color: '#6B7E98' }}>{desc}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Keyboard shortcuts */}
      <Card>
        <SectionHeader icon={HelpCircle} title="Keyboard Shortcuts" />
        <div className="grid gap-2 sm:grid-cols-2">
          {shortcuts.map(({ keys, desc }) => (
            <div key={desc} className="flex items-center justify-between rounded-lg px-3 py-2.5"
              style={{ background: 'rgb(255 255 255 / 0.03)' }}>
              <span className="text-xs" style={{ color: '#8A95AA' }}>{desc}</span>
              <div className="flex items-center gap-1">
                {keys.map((k, i) => (
                  <kbd
                    key={i}
                    className="rounded px-1.5 py-0.5"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '10px',
                      color: '#EBF0FA',
                      background: 'rgb(255 255 255 / 0.08)',
                      border: '1px solid rgb(255 255 255 / 0.12)',
                    }}
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sign out */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'rgb(255 75 91 / 0.05)', border: '1px solid rgb(255 75 91 / 0.15)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <LogOut size={16} style={{ color: '#FF4B5B' }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, color: '#FF4B5B', fontSize: '14px' }}>
            Sign Out
          </span>
        </div>
        <p className="text-xs mb-4" style={{ color: 'rgb(255 75 91 / 0.70)' }}>
          This ends your session. Local cached data remains on this device.
        </p>
        <DangerButton onClick={onSignOut} loading={signingOut}>
          <LogOut size={14} />
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </DangerButton>
      </div>
    </div>
  );
}

/* ─── Main SettingsPage ─────────────────────────────────────────────── */

export function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const { addToast, darkMode, toggleDarkMode } = useUiStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [signingOut, setSigningOut] = useState(false);

  const handleSaveProfile = (data: { company: string; licenseNumber: string; displayName: string }) => {
    if (!user) return;
    updateProfile({ company: data.company.trim(), licenseNumber: data.licenseNumber.trim() });
    addToast({ type: 'success', title: 'Profile saved' });
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(auth);
      addToast({ type: 'info', title: 'Signed out' });
      navigate('/login');
    } catch {
      addToast({ type: 'error', title: 'Failed to sign out. Please try again.' });
      setSigningOut(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':       return <ProfileTab user={user} onSave={handleSaveProfile} />;
      case 'appearance':    return <AppearanceTab darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />;
      case 'workflow':      return <WorkflowTab />;
      case 'documents':     return <DocumentsTab />;
      case 'notifications': return <NotificationsTab />;
      case 'team':          return <TeamTab />;
      case 'about':         return <AboutTab onSignOut={handleSignOut} signingOut={signingOut} />;
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-pp-fade-in">
      {/* Page header */}
      <div className="mb-6">
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: "'Syne', sans-serif", color: '#EBF0FA' }}
        >
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7E98' }}>
          Manage your account, appearance, and workflow preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <div
          className="shrink-0 rounded-xl py-3"
          style={{ width: '196px', background: '#111928', border: '1px solid rgb(255 255 255 / 0.06)', alignSelf: 'flex-start' }}
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all"
                style={{
                  color: isActive ? '#F4A623' : '#6B7E98',
                  background: isActive ? 'rgb(244 166 35 / 0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid #F4A623' : '2px solid transparent',
                  paddingLeft: isActive ? '14px' : '16px',
                }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.color = '#A0AABB'; (e.currentTarget as HTMLButtonElement).style.background = 'rgb(255 255 255 / 0.03)'; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.color = '#6B7E98'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; } }}
              >
                <Icon size={15} style={{ color: isActive ? '#F4A623' : 'currentColor' }} />
                <span style={{ fontFamily: "'Figtree', sans-serif", fontWeight: isActive ? 600 : 400, fontSize: '13.5px' }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          <div className="animate-pp-fade-in" key={activeTab}>
            {renderTab()}
          </div>
        </div>
      </div>
    </div>
  );
}
