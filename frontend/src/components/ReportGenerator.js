import React, { useState } from 'react';
import { generateReport } from '../services/api';
import Spinner from './Spinner';

function ReportGenerator({ runId, findings }) {
    const [template, setTemplate] = useState('corporate');
    const [status, setStatus] = useState(null);
    const [reportUrl, setReportUrl] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setStatus({ message: 'Starting report generation...', type: 'info' });
        setReportUrl(null);
        try {
            const result = await generateReport(runId || "test-run", template, findings);
            setStatus({ message: `Success: ${result.message} (Job ID: ${result.job_id})`, type: 'success' });
            if (result.pdf_generated && result.report_url) {
                setReportUrl(result.report_url);
            } else if (result.html_content) {
                // Open fallback HTML in a new window and write content so user sees report inline
                const w = window.open('', '_blank');
                if (w) {
                    w.document.open();
                    w.document.write(result.html_content);
                    w.document.close();
                } else {
                    // if popup blocked, offer link to the generated HTML (if provided)
                    if (result.report_url) setReportUrl(result.report_url);
                }
            } else if (result.report_url) {
                setReportUrl(result.report_url);
            }
        } catch (error) {
            setStatus({ message: `Error: ${error.message}`, type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Generate Report</h2>
            <div className="flex items-center space-x-4">
                <select 
                    className="p-2 border rounded" 
                    value={template} 
                    onChange={(e) => setTemplate(e.target.value)}
                    disabled={isGenerating}
                >
                    <option value="corporate">Corporate</option>
                    <option value="minimal">Minimal</option>
                    <option value="technical">Technical</option>
                </select>
                <button 
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center space-x-2 ${isGenerating ? 'opacity-80 cursor-not-allowed transform scale-95' : ''}`}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? <><Spinner size={4} /><span>Generating...</span></> : 'Generate Report'}
                </button>
            </div>
            {status && (
                <div 
                    className={`mt-4 p-2 rounded ${
                        status.type === 'success' ? 'bg-green-100 text-green-800' : 
                        status.type === 'error' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                    }`}
                >
                    {status.message}
                </div>
            )}
            {reportUrl && (
                <div className="mt-4">
                    <a 
                        href={`http://localhost:8000${reportUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        View Report
                    </a>
                </div>
            )}
        </div>
    );
}

export default ReportGenerator;
