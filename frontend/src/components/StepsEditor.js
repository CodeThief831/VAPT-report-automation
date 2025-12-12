import React from 'react';

function StepsEditor({ steps, onChange }) {
  const handleTextChange = (index, value) => {
    const newSteps = steps.map((s, i) => i === index ? { ...s, text: value } : s);
    onChange(newSteps);
  };

  const addStep = () => {
    const newSteps = [...steps, { step_number: steps.length + 1, text: '' }];
    onChange(newSteps);
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_number: i + 1 }));
    onChange(newSteps);
  };

  return (
    <div>
      {steps.map((step, idx) => (
        <div key={idx} className="mb-2 flex space-x-2 items-start">
          <div className="w-8 text-right pt-2 text-sm">{step.step_number}.</div>
          <textarea
            className="flex-1 p-2 border rounded"
            rows={2}
            value={step.text}
            onChange={(e) => handleTextChange(idx, e.target.value)}
          />
          <button className="text-red-600" onClick={() => removeStep(idx)}>Remove</button>
        </div>
      ))}
      <button className="mt-2 bg-gray-200 py-1 px-3 rounded" onClick={addStep}>Add Step</button>
    </div>
  );
}

export default StepsEditor;
