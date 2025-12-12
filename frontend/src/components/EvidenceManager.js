import React, { useState } from 'react';
import { uploadEvidence } from '../services/api';
import Spinner from './Spinner';

function EvidenceManager({ findingId }) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList);
    setFiles(arr);
    setPreviews(arr.map(f => ({ name: f.name, url: URL.createObjectURL(f) })));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setIsUploading(true);
    try {
      const result = await uploadEvidence('test-run-1', files);
      // Simple feedback: log result and clear
      console.log('Uploaded evidence:', result);
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold">Evidence for {findingId}</h3>
      <div className="border-dashed border-2 border-gray-300 p-4 my-2">
        <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} />
        <p className="text-center mt-2">Select files to upload. Max size 10MB (client-side not enforced).</p>
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((p, i) => (
            <div key={i} className="border p-1">
              <img src={p.url} alt={p.name} style={{ maxWidth: '100%' }} />
              <div className="text-sm">{p.name}</div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3">
        <button className="bg-blue-500 text-white py-1 px-3 rounded" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? (<><Spinner size={4} /> Uploading...</>) : 'Upload'}
        </button>
      </div>
    </div>
  );
}

export default EvidenceManager;
