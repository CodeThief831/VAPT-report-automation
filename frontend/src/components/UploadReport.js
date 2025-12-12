import React, { useState } from 'react';
import { importRun, getFindings } from '../services/api';

export default function UploadReport({ runId = 'import-run', initialFindings = [], onImported }) {
  const [metadata, setMetadata] = useState(JSON.stringify(initialFindings, null, 2));
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleUseCurrent = () => {
    setMetadata(JSON.stringify(initialFindings, null, 2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Validate JSON
      JSON.parse(metadata);
    } catch (err) {
      setError('Metadata is not valid JSON');
      setLoading(false);
      return;
    }

    try {
      const res = await importRun(runId, metadata, files);
      setResult(res);
      // Optionally refresh findings list in parent
      if (typeof onImported === 'function') {
        onImported();
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white">
      <h3 className="text-lg font-semibold mb-2">Import Run / Upload Report</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="block text-sm font-medium">Run ID</label>
          <input className="mt-1 block w-full border rounded p-2" value={runId} readOnly />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Metadata (JSON array of findings)</label>
          <textarea rows={8} className="mt-1 block w-full border rounded p-2 font-mono text-sm" value={metadata} onChange={(e) => setMetadata(e.target.value)} />
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={handleUseCurrent} className="px-3 py-1 bg-gray-200 rounded">Use current findings</button>
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Files (screenshots, evidence)</label>
          <input type="file" multiple onChange={handleFiles} />
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Uploading...' : 'Import Run'}
          </button>
          {error && <div className="text-red-600">{error}</div>}
        </div>
      </form>

      {result && (
        <div className="mt-3 p-2 border rounded bg-gray-50">
          <div className="text-sm">Created: {JSON.stringify(result.created)}</div>
          <div className="text-sm">Uploaded files: {JSON.stringify(result.uploaded_files)}</div>
        </div>
      )}
    </div>
  );
}
