import React, { useEffect, useState } from 'react';
import { SupportTicket, ErrorLog } from '../../types/errors';

export default function SupportTickets() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

    useEffect(() => {
        // In real app, fetch from /api/errors/log-error?type=tickets or similar
        // For demo, we might need an endpoint or mock data
        // Calling the API endpoint's GET ability if implemented or mock
        // Mocking here for visual demonstration as backend file uses memory

        // We can fetch from API if we update the API to handle GET
        // But for hackathon speed, let's assume we fetch or mock:
        const mockTickets: SupportTicket[] = [
            {
                id: 'ticket-101',
                userId: 'user-1',
                subject: 'CRITICAL: Calculation Engine Failed',
                description: 'Error occurred in CalculationModule: Division by zero',
                status: 'open',
                priority: 'critical',
                createdAt: Date.now() - 3600000,
                updatedAt: Date.now()
            },
            {
                id: 'ticket-102',
                userId: 'user-1',
                subject: 'HIGH: Email Delivery Failed',
                description: 'Failed to send opportunity email',
                status: 'resolved',
                priority: 'high',
                createdAt: Date.now() - 86400000,
                updatedAt: Date.now() - 43200000,
                resolution: 'SMTP server was down, retried successfully.'
            }
        ];
        setTickets(mockTickets);
    }, []);

    const filteredTickets = tickets.filter(t => filter === 'all' || t.status === filter);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                        <p className="text-sm text-gray-500">Track and manage your issue reports</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                        + New Request
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        {['all', 'open', 'resolved'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-6 py-3 text-sm font-medium capitalize ${filter === f ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="divide-y divide-gray-200">
                        {filteredTickets.map(ticket => (
                            <div key={ticket.id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-lg ${ticket.priority === 'critical' ? 'bg-red-100 text-red-700' : ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            <span className="text-xl">
                                                {ticket.priority === 'critical' ? '🚨' : '⚠️'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                                            {ticket.resolution && (
                                                <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-100">
                                                    <p className="text-sm text-green-800"><strong>Resolution:</strong> {ticket.resolution}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400">ID: {ticket.id}</div>
                                        <div className="text-sm text-gray-500 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredTickets.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            No tickets found in this category.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
