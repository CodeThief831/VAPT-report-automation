import React from 'react';

function Spinner({ size = 6 }) {
  return (
    <div className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-blue-500`} />
  );
}

export default Spinner;
