import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, CheckCircle, XCircle } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { uploadLeads } from '../../api/leads';
import Button from '../../components/Common/Button';
import Card from '../../components/Common/Card';
import FileUpload from '../../components/Common/FileUpload';
import { toast } from 'react-toastify';

const REQUIRED_COLUMNS = ['customer_name', 'phone', 'email', 'status', 'source'];

const LeadUpload = () => {
  const navigate = useNavigate();
  const [parsedData, setParsedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFile = (file) => {
    if (!file) { setParsedData(null); setErrors([]); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(e.target.result);
        const worksheet = workbook.worksheets[0];
        if (!worksheet || worksheet.rowCount < 2) {
          setErrors(['File is empty or has no data rows']);
          return;
        }
        let headers = null;
        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
          const values = row.values.slice(1);
          if (rowNumber === 1) {
            headers = values.map(v => String(v || '').toLowerCase().trim());
            return;
          }
          if (!headers) return;
          const obj = {};
          headers.forEach((h, i) => { obj[h] = values[i] !== undefined && values[i] !== null ? String(values[i]) : ''; });
          if (Object.values(obj).some(v => v !== '')) rows.push(obj);
        });
        const rowErrors = [];
        REQUIRED_COLUMNS.forEach(col => {
          if (!headers || !headers.includes(col)) rowErrors.push(`Missing required column: ${col}`);
        });
        if (rowErrors.length) { setErrors(rowErrors); setParsedData(null); return; }
        setParsedData({ headers, rows, file });
        setErrors([]);
      } catch (err) {
        setErrors(['Failed to parse file: ' + err.message]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!parsedData) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', parsedData.file, parsedData.file.name);
      await uploadLeads(formData);
      setUploaded(true);
      toast.success(`Successfully uploaded ${parsedData.rows.length} leads`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads Template');
    worksheet.addRow(['customer_name', 'phone', 'email', 'status', 'source', 'product_type', 'notes']);
    worksheet.addRow(['John Smith', '+1-555-0100', 'john@example.com', 'new', 'referral', 'Life Insurance', 'Interested in term life']);
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'leads_template.xlsx');
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/leads')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back to Leads
        </button>
      </div>
      <h1 style={{ fontSize: '22px', marginBottom: '24px' }}>Upload Leads</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Card title="Template & Instructions">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Download the Excel template and fill in your lead data.</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Required columns: {REQUIRED_COLUMNS.join(', ')}</p>
            </div>
            <Button variant="secondary" icon={Download} onClick={downloadTemplate}>Download Template</Button>
          </div>
        </Card>

        <Card title="Upload File">
          <FileUpload accept=".xlsx,.xls,.csv" onFile={handleFile} label="Drop your Excel or CSV file here" />
          {errors.length > 0 && (
            <div style={{ marginTop: '12px', padding: '12px', background: '#fee2e2', borderRadius: 'var(--radius)', border: '1px solid #fca5a5' }}>
              {errors.map((err, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#991b1b', marginBottom: i < errors.length - 1 ? '4px' : 0 }}>
                  <XCircle size={14} /> {err}
                </div>
              ))}
            </div>
          )}
        </Card>

        {parsedData && !errors.length && (
          <Card title={`Preview (${parsedData.rows.length} leads)`}>
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    {parsedData.headers.map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.rows.slice(0, 5).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      {parsedData.headers.map(h => (
                        <td key={h} style={{ padding: '8px 10px' }}>{row[h] || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.rows.length > 5 && (
                <p style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  ... and {parsedData.rows.length - 5} more rows
                </p>
              )}
            </div>
            {!uploaded ? (
              <Button icon={Upload} onClick={handleUpload} loading={uploading}>
                Upload {parsedData.rows.length} Leads
              </Button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 500 }}>
                <CheckCircle size={16} /> Upload complete!
                <Button variant="secondary" size="sm" onClick={() => navigate('/leads')} style={{ marginLeft: '8px' }}>View Leads</Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeadUpload;
