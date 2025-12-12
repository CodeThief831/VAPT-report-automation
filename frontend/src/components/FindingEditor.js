import React, { useState } from 'react';
import { patchFinding } from '../services/api';

function FindingEditor({ finding, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(finding || {});
  const [steps, setSteps] = useState(finding?.steps_to_reproduce || []);
  const [newStep, setNewStep] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  if (!finding) {
    return (
      <div className="p-6 bg-white rounded-lg shadow border-l-4 border-blue-500">
        <p className="text-gray-600 text-center">Select a finding to edit.</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStep = () => {
    if (newStep.trim()) {
      const newStepObj = {
        step_number: steps.length + 1,
        text: newStep.trim(),
        attached_evidence_ids: []
      };
      setSteps([...steps, newStepObj]);
      setNewStep('');
    }
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleUpdateStep = (index, text) => {
    const updatedSteps = [...steps];
    updatedSteps[index].text = text;
    setSteps(updatedSteps);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('');
    
    try {
      const updatedFinding = {
        ...formData,
        steps_to_reproduce: steps
      };
      
      const response = await patchFinding(finding.id, updatedFinding);

      setSaveStatus('success');
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(response);
      }
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving finding:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-800 border-red-500',
      'High': 'bg-orange-100 text-orange-800 border-orange-500',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-500',
      'Low': 'bg-green-100 text-green-800 border-green-500'
    };
    return colors[severity] || colors['Medium'];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <p className="text-green-800">✓ Finding saved successfully!</p>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-800">✗ Error saving finding. Please try again.</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2">{formData.title || finding.title}</h2>
          <p className="text-blue-100">{formData.id || finding.id}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            isEditing
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="p-6">
        {/* Severity Badge */}
        <div className={`inline-block px-4 py-2 rounded-full font-bold mb-6 border-2 ${getSeverityColor(formData.severity || finding.severity)}`}>
          {formData.severity || finding.severity}
        </div>

        {/* Meta Information */}
        {!isEditing ? (
          <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">OWASP Category</p>
              <p className="text-lg text-gray-800">{formData.owasp_category || finding.owasp_category || 'Not Specified'}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">CVSS Score</p>
              <p className="text-lg text-gray-800">{formData.cvss_v3 || finding.cvss_v3 || 'N/A'}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 mb-8 p-6 rounded-lg border-2 border-blue-300 bg-blue-50">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Severity</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">CVSS v3.0 Score</label>
              <input
                type="text"
                name="cvss_v3"
                value={formData.cvss_v3 || ''}
                onChange={handleInputChange}
                placeholder="e.g., 7.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">OWASP Category</label>
              <input
                type="text"
                name="owasp_category"
                value={formData.owasp_category || ''}
                onChange={handleInputChange}
                placeholder="e.g., A03:2021 - Injection"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Title */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Title</h3>
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          ) : (
            <p className="text-gray-700 text-lg">{formData.title || finding.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Description</h3>
          {isEditing ? (
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows="5"
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          ) : (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{formData.description || finding.description}</p>
          )}
        </div>

        {/* Steps to Reproduce */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Steps to Reproduce</h3>
          <div className="space-y-3 mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step_number}
                </div>
                {isEditing ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={step.text}
                      onChange={(e) => handleUpdateStep(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleRemoveStep(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-700 flex-1 pt-1">{step.text}</p>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                placeholder="Enter new step and press Enter or click Add"
                className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddStep}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold"
              >
                Add Step
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : '✓ Save Changes'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(finding || {});
                setSteps(finding?.steps_to_reproduce || []);
              }}
              className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-bold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindingEditor;
