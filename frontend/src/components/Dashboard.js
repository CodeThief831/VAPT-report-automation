import React, { useState } from 'react';
import Findings from './Findings';
import ReportGenerator from './ReportGenerator';
import UploadReport from './UploadReport';

    const mockFindings = [
    {
        id: "F-2025-001",
        title: "Reflected XSS in /search",
        owasp_category: "A7: Cross-Site Scripting (XSS)",
        severity: "High",
        status: "Verified",
        description: "A reflected XSS vulnerability allows attackers to inject arbitrary client-side scripts.",
        steps_to_reproduce: [
            { step_number: 1, text: "Navigate to /search?q=<script>alert(1)</script>" },
            { step_number: 2, text: "Observe the alert dialog." },
        ],
        evidence: [],
    },
    {
        id: "F-2025-002",
        title: "SQL Injection in /login",
        owasp_category: "A1: Injection",
        severity: "Critical",
        status: "Unverified",
        description: "A SQL injection vulnerability allows attackers to execute arbitrary SQL queries.",
        steps_to_reproduce: [
            { step_number: 1, text: "Enter ' OR 1=1 -- in the username field." },
            { step_number: 2, text: "Enter a random password." },
            { step_number: 3, text: "Click login and observe successful authentication." },
        ],
        evidence: [],
    },
];

function Dashboard() {
    const [findings, setFindings] = useState(mockFindings);

    const handleStrChange = (e, id) => {
        // Support both textarea-style events and structured steps arrays
        const value = (e && e.target && typeof e.target.value === 'string') ? e.target.value : e;
        const newFindings = findings.map(f => {
            if (f.id === id) {
                // If value is a string, keep backward compatibility
                if (typeof value === 'string') {
                    return { ...f, steps_to_reproduce: value };
                }
                // Otherwise assume it's an array of steps
                return { ...f, steps_to_reproduce: value };
            }
            return f;
        });
        setFindings(newFindings);
    };

    const refreshFindings = async () => {
        try {
            const mod = await import('../services/api');
            if (mod && mod.getFindings) {
                const fresh = await mod.getFindings();
                setFindings(fresh);
            }
        } catch (err) {
            // ignore refresh errors for now
            console.error('Failed to refresh findings', err);
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <ReportGenerator runId="test-run-1" findings={findings} />
                </div>
                <div className="md:col-span-1">
                    <UploadReport runId="test-run-1" initialFindings={findings} onImported={refreshFindings} />
                </div>
            </div>
            <Findings findings={findings} handleStrChange={handleStrChange} />
        </div>
    );
}

export default Dashboard;
