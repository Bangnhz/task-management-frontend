import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/use-auth-store';

type Tab = 'profile' | 'security' | 'notifications';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Topbar */}
      <div className="sticky top-0 z-10 h-[72px] bg-white border-b border-slate-200/60 flex items-center px-6 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          ← Back
        </button>
        <span className="font-bold text-slate-900">Account</span>
      </div>

      {/* Body */}
      <div className="max-w-[760px] mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Hero */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center gap-5">
          <div className="w-[72px] h-[72px] rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-2xl flex items-center justify-center shrink-0 overflow-hidden">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              : initials
            }
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 m-0">{user.fullName}</h1>
            <p className="text-sm text-slate-500 mt-1 m-0">{user.email}</p>
            {user.role && (
              <span className="inline-flex mt-2 items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
                {user.role}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-slate-200/60 rounded-lg p-1 self-start">
          {([
            { key: 'profile',       label: 'Profile' },
            { key: 'security',      label: 'Security' },
            { key: 'notifications', label: 'Notifications' },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === t.key ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile'       && <ProfileTab />}
        {activeTab === 'security'      && <SecurityTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user } = useAuthStore();
  if (!user) return null;
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900 mb-5">Personal Details</h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 max-sm:grid-cols-1">
        <Field label="Full Name"    value={user.fullName} />
        <Field label="Email"        value={user.email} />
        <Field label="Account ID"   value={String(user.id)} />
        {user.role      && <Field label="Role"        value={user.role} />}
        {user.createdAt && <Field label="Joined Date" value={new Date(user.createdAt).toLocaleDateString('en-US')} />}
      </div>
    </div>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col gap-5">
      <h2 className="text-sm font-bold text-slate-900 m-0">Security</h2>
      <div>
        <p className="font-semibold text-sm text-slate-900 m-0 mb-1">Change Password</p>
        <p className="text-xs text-slate-500 m-0 mb-4">Update your password to protect your account.</p>
        <div className="flex flex-col gap-3 max-w-sm">
          {([
            { label: 'Current password', key: 'current' as const },
            { label: 'New password', key: 'next' as const },
            { label: 'Confirm new password', key: 'confirm' as const },
          ]).map(({ label, key }) => (
            <div key={key}>
              <label className="block mb-1.5 text-xs font-semibold text-slate-500">{label}</label>
              <input
                type={show ? 'text' : 'password'}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <button className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Update</button>
            <button type="button" onClick={() => setShow((v) => !v)} className="text-xs text-slate-400 hover:text-slate-600">
              {show ? 'Hide' : 'Show'} password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [settings, setSettings] = useState({
    email: true, taskAssigned: true, taskCompleted: false, mentions: true, deadlineReminder: true,
  });
  type Key = keyof typeof settings;
  const items: { key: Key; label: string; desc: string }[] = [
    { key: 'email',            label: 'Email Notifications',   desc: 'Receive notifications in your inbox' },
    { key: 'taskAssigned',     label: 'Task Assigned',         desc: 'When a new task is assigned to you' },
    { key: 'taskCompleted',    label: 'Task Completed',        desc: 'When a task in a project is completed' },
    { key: 'mentions',         label: 'Mentions (@mention)',   desc: 'When someone mentions you' },
    { key: 'deadlineReminder', label: 'Deadline Reminder',     desc: '1 day before task deadline' },
  ];
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900 mb-5">Notifications</h2>
      {items.map(({ key, label, desc }, i) => (
        <div key={key} className={`flex items-center justify-between gap-4 py-3.5 ${i < items.length - 1 ? 'border-b border-slate-100' : ''}`}>
          <div>
            <p className="m-0 font-semibold text-sm text-slate-900">{label}</p>
            <p className="m-0 text-xs text-slate-400 mt-0.5">{desc}</p>
          </div>
          <Toggle checked={settings[key]} onChange={() => setSettings((s) => ({ ...s, [key]: !s[key] }))} />
        </div>
      ))}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="m-0 mb-1 text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="m-0 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch" aria-checked={checked} onClick={onChange}
      className={`relative w-10 h-[22px] rounded-full border-0 cursor-pointer shrink-0 transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-[20px]' : 'left-[3px]'}`} />
    </button>
  );
}
