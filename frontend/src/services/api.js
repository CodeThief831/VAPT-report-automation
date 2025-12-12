// A simple API client for interacting with the VRAS backend.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

export async function getFindings() {
  const response = await fetch(`${API_BASE_URL}/findings/`);
  if (!response.ok) {
    throw new Error('Failed to fetch findings');
  }
  return response.json();
}

export async function uploadEvidence(runId, files) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE_URL}/evidence/runs/${runId}/evidence`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload evidence');
  }
  return response.json();
}

export async function importRun(runId, metadataString, files) {
  const formData = new FormData();
  formData.append('metadata', metadataString);
  (files || []).forEach(file => formData.append('files', file));

  const response = await fetch(`${API_BASE_URL}/runs/${runId}/import`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => null);
    throw new Error(text || 'Failed to import run');
  }
  return response.json();
}

export async function patchFinding(findingId, updateData) {
  const response = await fetch(`${API_BASE_URL}/findings/${findingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => null);
    throw new Error(text || response.statusText || 'Failed to update finding');
  }
  return response.json();
}

export async function generateReport(runId, template, findings) {
    const response = await fetch(`${API_BASE_URL}/runs/${runId}/generate?template=${template}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(findings),
    });

  if (!response.ok) {
    // Try to parse JSON validation errors (FastAPI returns a list of error objects)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const errorData = await response.json().catch(() => null);
      if (Array.isArray(errorData)) {
        // Map validation errors to a readable string
        const messages = errorData.map(err => {
          if (err.loc && err.msg) {
            return `${err.loc.join('.')}: ${err.msg}`;
          }
          try { return JSON.stringify(err); } catch { return String(err); }
        });
        throw new Error(messages.join(' | '));
      } else if (errorData && errorData.detail) {
        // If detail is an object, stringify it
        if (typeof errorData.detail === 'object') {
          throw new Error(JSON.stringify(errorData.detail));
        }
        throw new Error(errorData.detail);
      }
    }

    // Fallback: attempt to read raw text body for clearer errors
    const text = await response.text().catch(() => null);
    if (text) {
      throw new Error(text);
    }

    throw new Error(response.statusText || 'Failed to start report generation');
  }
  return response.json();
}
