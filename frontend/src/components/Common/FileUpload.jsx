import React, { useRef, useState } from 'react';
import { Upload, X, File } from 'lucide-react';

const FileUpload = ({ accept = '.xlsx,.xls,.csv', onFile, label = 'Drop file here or click to browse', maxSize = 10 }) => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > maxSize * 1024 * 1024) {
      alert(`File too large. Max size is ${maxSize}MB`);
      return;
    }
    setFile(f);
    onFile(f);
  };

  return (
    <div>
      <div
        style={{
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          textAlign: 'center',
          background: dragging ? '#eff6ff' : 'var(--bg)',
          cursor: 'pointer',
          transition: 'var(--transition)',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
        <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Supported: {accept} • Max {maxSize}MB</p>
        <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      </div>
      {file && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#eff6ff', borderRadius: 'var(--radius)', marginTop: '8px' }}>
          <File size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ flex: 1, fontSize: '13px', color: 'var(--primary)' }}>{file.name}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(0)} KB</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={(e) => { e.stopPropagation(); setFile(null); onFile(null); }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
