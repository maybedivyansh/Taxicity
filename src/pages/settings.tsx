import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { SoundAlert } from '../components/SoundAlert';
import { DemoMode } from '../components/DemoMode';
import { EmailNotificationCenter } from '../components/EmailNotificationCenter';
import { EmailNotificationCenter } from '../components/EmailNotificationCenter';

export default function Settings() {
    const { preferences, setPreferences, requestPermission } = useNotifications();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your notification preferences, demo settings, and data.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Notification Preferences */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>

                        <SoundAlert />

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Channels</h3>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div>
                                    <div className="font-medium text-gray-700">Browser Push</div>
                                    <div className="text-xs text-gray-500">Receive alerts when tab is closed</div>
                                </div>
                                <button
                                    onClick={requestPermission}
                                    className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
                                >
                                    {typeof window !== 'undefined' && Notification.permission === 'granted' ? 'Enabled' : 'Enable'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <div className="font-medium text-gray-700">Haptic Feedback</div>
                                    <div className="text-xs text-gray-500">Vibrate on mobile devices</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.vibrationEnabled}
                                        onChange={(e) => setPreferences({ ...preferences, vibrationEnabled: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Demo & Data */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800">Developer & Data</h2>

                        <DemoMode />

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy & Data</h3>

                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                    Click to download CSV
                                </button>
                                <button className="w-full flex items-center justify-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50">
                                    Clear All Application Data
                                </button>
                            </div>
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Email & Communication</h2>
                <EmailNotificationCenter />
            </div>
        </div>
        </div >
    );
}
