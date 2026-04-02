import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/config/firebase';
import { APP_VERSION } from '@/config/constants';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { LogOut, User, Database, Wind, Info, Moon, Sun } from 'lucide-react';

export function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const { addToast, darkMode, toggleDarkMode } = useUiStore();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [company, setCompany] = useState(user?.company ?? '');
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber ?? '');

  const handleSaveProfile = () => {
    if (!user) return;
    updateProfile({
      company: company.trim(),
      licenseNumber: licenseNumber.trim(),
    });
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

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Configure your account and preferences.</p>
      </div>

      {/* Account section */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 space-y-4">
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Account</h3>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              {user?.displayName || 'PermitPro User'}
            </p>
            <p className="mt-0.5 text-xs text-green-700 dark:text-green-400">
              {user?.email}
            </p>
            <p className="mt-1 text-xs text-green-600/70 dark:text-green-400/70">
              Cloud sync is active — permits sync across devices.
            </p>
          </div>

          {user && (
            <div className="space-y-3 pt-1">
              <Input
                id="settings-company"
                label="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company"
                autoComplete="organization"
              />
              <Input
                id="settings-license"
                label="License number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="Professional license #"
                autoComplete="off"
              />
              <Button type="button" variant="primary" onClick={handleSaveProfile}>
                Save profile
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 space-y-4">
        <div className="flex items-center gap-2">
          {darkMode ? (
            <Moon size={16} className="text-gray-500" />
          ) : (
            <Sun size={16} className="text-gray-500" />
          )}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dark Mode</h3>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {darkMode ? 'Dark' : 'Light'} theme
          </p>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <span className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-5 dark:bg-gray-600 dark:peer-checked:bg-blue-500" />
          </label>
        </div>
      </section>

      {/* Sync status */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 space-y-3">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Data Sync</h3>
        </div>
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${user ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-gray-700 dark:text-gray-300">Cloud sync: {user ? 'active' : 'offline (sign in to enable)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-gray-700 dark:text-gray-300">Local cache: always active (works offline)</span>
          </div>
        </div>
      </section>

      {/* Wind zone reference */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 space-y-3">
        <div className="flex items-center gap-2">
          <Wind size={16} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Florida Wind Zone Reference</h3>
        </div>
        <div className="space-y-2 text-sm">
          {[
            { zone: 'Zone I', desc: 'Interior — lowest wind requirement', color: 'bg-green-500' },
            { zone: 'Zone II', desc: 'Moderate — most inland counties', color: 'bg-yellow-500' },
            { zone: 'Zone III', desc: 'Coastal / HVHZ — highest requirement', color: 'bg-red-500' },
          ].map(({ zone, desc, color }) => (
            <div key={zone} className="flex items-center gap-3">
              <span className={`h-3 w-3 shrink-0 rounded-full ${color}`} />
              <span className="font-medium text-gray-900 dark:text-gray-100 w-16">{zone}</span>
              <span className="text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 space-y-3">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">About</h3>
        </div>
        <p className="text-sm text-gray-500">
          Version {APP_VERSION}
        </p>
        <p className="text-xs text-gray-400">React 19 · Vite 8 · Tailwind v4</p>
        <p className="text-xs text-gray-400">Florida Manufactured Housing Permit Suite · HUD Code &amp; FBC Compliance</p>

        <div className="border-t border-gray-100 pt-3 dark:border-gray-700">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Keyboard shortcuts
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
            <li>
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-gray-900">
                Ctrl/Cmd + N
              </kbd>
              <span className="ml-2">New Permit (navigate to /permits/new)</span>
            </li>
            <li>
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-gray-900">
                Ctrl/Cmd + K
              </kbd>
              <span className="ml-2">Search (focus the dashboard search)</span>
            </li>
            <li>
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-gray-900">
                Ctrl/Cmd + D
              </kbd>
              <span className="ml-2">Toggle Dark Mode</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Sign Out */}
      <section className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-900/10 space-y-3">
        <div className="flex items-center gap-2">
          <LogOut size={16} className="text-red-500" />
          <h3 className="font-semibold text-red-700 dark:text-red-400">Sign Out</h3>
        </div>
        <p className="text-sm text-red-600/80 dark:text-red-400/80">
          This will end your session. Local cached data remains on this device.
        </p>
        <Button variant="danger" onClick={handleSignOut} loading={signingOut}>
          <LogOut size={15} className="mr-2" />
          Sign Out
        </Button>
      </section>
    </div>
  );
}
