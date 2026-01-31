import React, { useState, useEffect } from 'react';
import { SupportTicket } from '../../types/errors';

export default function SupportDashboard() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    // Simulate admin data fetch
    useEffect(() => {
        // In real app, fetch from /api/support/tickets?role=admin
        // Mock data for display
        const mockData: SupportTicket[] = [
            {
                id: 'ticket-103',
                userId: 'user-2',
                subject: 'Feature Request: Dark Mode',
                description: 'Please add dark mode support.',
                status: 'open',
                priority: 'low',
                createdAt: Date.now() - 100000,
                updatedAt: Date.now()
            },
            {
                id: 'ticket-101', // Reusing ID for context
                userId: 'user-1',
                subject: 'CRITICAL: Calculation Engine Failed',
                description: 'Error occurred in CalculationModule: Division by zero',
                status: 'open',
                priority: 'critical',
                createdAt: Date.now() - 3600000,
                updatedAt: Date.now()
            }
        ];
        setTickets(mockData);
    }, []);

    const handleResolve = (id: string) => {
        // In real app: call API to resolve
        setTickets(tickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
        setSelectedTicket(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar / Queue */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-screen">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">Support Queue</h2>
                    <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Critical: {tickets.filter(t => t.priority === 'critical').length}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Open: {tickets.filter(t => t.status === 'open').length}</span>
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    {tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedTicket?.id === ticket.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className={`text-xs font-bold uppercase ${ticket.priority === 'critical' ? 'text-red-600' : 'text-gray-500'}`}>{ticket.priority}</span>
                                <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <h3 className="font-medium text-gray-900 text-sm truncate">{ticket.subject}</h3>
                            <p className="text-xs text-gray-500 truncate">{ticket.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content / Details */}
            <div className="flex-1 bg-gray-50 flex flex-col h-screen overflow-hidden">
                {selectedTicket ? (
                    <div className="flex-1 flex flex-col">
                        {/* Header */}
                        <div className="bg-white p-6 border-b border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{selectedTicket.subject}</h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Ticket ID: {selectedTicket.id} • User: {selectedTicket.userId}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium hover:bg-gray-50">Transfer</button>
                                    <button
                                        onClick={() => handleResolve(selectedTicket.id)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                                    >
                                        Resolve Ticket
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto p-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Description</h3>
                                <p className="text-gray-800 leading-relaxed">{selectedTicket.description}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Response</h3>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    rows={6}
                                    placeholder="Write a reply to the user..."
                                ></textarea>
                                <div className="mt-4 flex justify-end">
                                    <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900">Send Response</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <p>Select a ticket to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
