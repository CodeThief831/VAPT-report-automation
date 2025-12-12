import React, { useState } from 'react';
import Findings from './Findings';
import ReportGenerator from './ReportGenerator';
import UploadReport from './UploadReport';

function Dashboard() {
    const [findings, setFindings] = useState([]);

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
