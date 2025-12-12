import React, { useState, useEffect } from 'react';
import FindingEditor from './FindingEditor';
import { getFindings } from '../services/api';
import Spinner from './Spinner';

function Findings({ findings: initialFindings, onFindingsChange }) {
    const [findings, setFindings] = useState(initialFindings || []);
    const [selectedFindingId, setSelectedFindingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('All');

    useEffect(() => {
        loadFindings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setFindings(initialFindings || []);
    }, [initialFindings]);

    const loadFindings = async () => {
        try {
            setIsLoading(true);
            const respData = await getFindings();
            setFindings(respData || []);
            if (onFindingsChange) onFindingsChange(respData || []);
        } catch (err) {
            console.error('Error loading findings', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFindings = findings.filter((f) => {
        const q = searchTerm.trim().toLowerCase();
        const matchesSearch = !q || (f.title || '').toLowerCase().includes(q) || (f.id || '').toLowerCase().includes(q);
        const matchesSeverity = filterSeverity === 'All' || f.severity === filterSeverity;
        return matchesSearch && matchesSeverity;
    });

    const severityCounts = {
        Critical: findings.filter((f) => f.severity === 'Critical').length,
        High: findings.filter((f) => f.severity === 'High').length,
        Medium: findings.filter((f) => f.severity === 'Medium').length,
        Low: findings.filter((f) => f.severity === 'Low').length,
    };

    const getSeverityColor = (severity) => {
        const map = {
            Critical: 'bg-red-50 text-red-800',
            High: 'bg-orange-50 text-orange-800',
            Medium: 'bg-yellow-50 text-yellow-800',
            Low: 'bg-green-50 text-green-800',
        };
        return map[severity] || 'bg-gray-50';
    };

    if (isLoading) return <Spinner />;

    const selectedFinding = findings.find((f) => f.id === selectedFindingId) || findings[0] || null;

    return (
        <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="col-span-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                    <h2 className="text-lg font-bold">Findings ({findings.length})</h2>
                    <p className="text-sm text-blue-100 mt-1">Select to edit</p>
                </div>

                <div className="p-4 bg-gray-50 border-b">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-red-50 p-2 rounded text-center">
                            <p className="font-bold text-red-700">{severityCounts.Critical}</p>
                            <p className="text-red-600 text-xs">Critical</p>
                        </div>
                        <div className="bg-orange-50 p-2 rounded text-center">
                            <p className="font-bold text-orange-700">{severityCounts.High}</p>
                            <p className="text-orange-600 text-xs">High</p>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded text-center">
                            <p className="font-bold text-yellow-700">{severityCounts.Medium}</p>
                            <p className="text-yellow-600 text-xs">Medium</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-center">
                            <p className="font-bold text-green-700">{severityCounts.Low}</p>
                            <p className="text-green-600 text-xs">Low</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-b space-y-3">
                    <input
                        type="text"
                        placeholder="Search findings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="All">All</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>

                <div className="overflow-y-auto flex-1">
                    {filteredFindings.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No findings found</div>
                    ) : (
                        filteredFindings.map((finding) => (
                            <div
                                key={finding.id}
                                onClick={() => setSelectedFindingId(finding.id)}
                                className={`p-4 border-b cursor-pointer transition-all ${
                                    selectedFindingId === finding.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
                                } ${getSeverityColor(finding.severity)}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{finding.id}</p>
                                        <p className="text-xs text-gray-600 truncate mt-1">{finding.title}</p>
                                    </div>
                                    <span className="flex-shrink-0 text-xs font-bold">{(finding.severity || ' ')[0]}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="col-span-3">
                {selectedFinding ? (
                    <FindingEditor
                        finding={selectedFinding}
                        onUpdate={(updated) => {
                            const next = findings.map((f) => (f.id === updated.id ? updated : f));
                            setFindings(next);
                            if (onFindingsChange) onFindingsChange(next);
                        }}
                    />
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <p className="text-gray-500 text-xl">No findings to display</p>
                        <p className="text-gray-400 mt-2">Create or load findings to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Findings;
