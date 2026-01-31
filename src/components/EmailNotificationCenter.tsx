import React, { useState, useEffect } from 'react';
import { emailService } from '../services/emailService';
import { EmailLog } from '../types/notifications';
import { useNotifications } from '../hooks/useNotifications';

export const EmailNotificationCenter = () => {
    const [activeTab, setActiveTab] = useState<'log' | 'preferences'>('log');
    const [history, setHistory] = useState<EmailLog[]>([]);
    const [testEmailLoading, setTestEmailLoading] = useState(false);
    const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const { notifications } = useNotifications(); // Access standard notifications too

    useEffect(() => {
        // Poll for updates in hackathon demo
        const interval = setInterval(() => {
            setHistory(emailService.getHistory());
        }, 2000);
        setHistory(emailService.getHistory());
        return () => clearInterval(interval);
    }, [testEmailLoading]);

    const handleSendTest = async () => {
        setTestEmailLoading(true);
        setTestEmailStatus('idle');
        try {
            const res = await fetch('/api/notifications/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: 'test@user.com',
                    type: 'opportunity',
                    data: {
                        title: 'Test Opportunity',
                        savings: 5000,
                        message: 'Verification check for email system.',
                        effort: 'Low',
                        priority: 3,
                        actionURL: 'http://localhost:3000/dashboard/opportunities',
                        deadline: '2026-03-31'
                    }
                })
            });

            const data = await res.json();
            if (data.success) {
                setTestEmailStatus('success');
            } else {
                setTestEmailStatus('error');
            }
        } catch (e) {
            setTestEmailStatus('error');
        } finally {
            setTestEmailLoading(false);
        }
    };

    const handleResend = async (log: EmailLog) => {
        // Logic to resend
        await handleSendTest(); // Mocking resend by sending test again for demo
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('log')}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === 'log' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Activity Log
                </button>
                <button
                    onClick={() => setActiveTab('preferences')}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === 'preferences' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Configuration
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'log' ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-semibold text-gray-800">Communication History</h3>
                                <p className="text-xs text-gray-400">Track all emails and alerts sent to you</p>
                            </div>
                            <button
                                onClick={handleSendTest}
                                disabled={testEmailLoading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-70 transition flex items-center gap-2"
                            >
                                {testEmailLoading ? 'Sending...' : 'Test Email System'}
                            </button>
                        </div>

                        {testEmailStatus === 'success' && (
                            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 flex items-center gap-2">
                                <span>✓</span> Verification email sent to test@user.com
                            </div>
                        )}
                        {testEmailStatus === 'error' && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span>⚠️</span> Failed to send verification.
                                </div>
                                <a href="/support/tickets" className="underline font-medium">Report Issue</a>
                            </div>
                        )}

                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">No activity recorded yet.</p>
                            ) : (
                                history.slice(0, 5).map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 group">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full ${log.status === 'sent' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <div className="font-medium text-sm text-gray-900">{log.subject}</div>
                                                <div className="text-xs text-gray-500">To: {log.recipient} • {log.type}</div>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <div>
                                                <div className="text-xs text-gray-400">{new Date(log.sentAt).toLocaleTimeString()}</div>
                                                <div className={`text-xs font-semibold uppercase tracking-wider ${log.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>{log.status}</div>
                                            </div>
                                            {log.status === 'failed' && (
                                                <button
                                                    onClick={() => handleResend(log)}
                                                    className="text-xs text-indigo-600 font-medium hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    Resend
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-800">Email Preferences</h3>
                        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-700">Opportunity Alerts</span>
                                <input type="checkbox" defaultChecked className="toggleAccent" />
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-700">Deadline Reminders</span>
                                <input type="checkbox" defaultChecked className="toggleAccent" />
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm font-medium text-gray-700">Weekly Digest</span>
                                <input type="checkbox" className="toggleAccent" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            Note: Security alerts and error notifications cannot be disabled.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
