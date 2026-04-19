import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, CloudUpload } from 'lucide-react'
import { docsAPI } from '../../utils/api'
import { useAuthStore } from '../../store/authStore'

const DEPT_COLORS = { hr:'#22d3ee', finance:'#34d399', marketing:'#fbbf24', legal:'#818cf8', engineering:'#f87171', general:'#94a3b8' }

export default function DocumentsPage() {
  const { user } = useAuthStore()
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [dept, setDept] = useState(user?.departments?.[0] || 'general')
  const [desc, setDesc] = useState('')
  const [toast, setToast] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const depts = user?.departments || ['general']

  useEffect(() => { loadDocs() }, [])

  const loadDocs = async () => {
    try { const { data } = await docsAPI.list(); setDocs(data) } catch {}
  }

  const showToast = (msg, type='ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const { data } = await docsAPI.upload(file, dept, desc)
      showToast(`✅ Ingested "${file.name}" — ${data.chunks} chunks created`)
      setFile(null); setDesc('')
      loadDocs()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Upload failed', 'err')
    } finally { setUploading(false) }
  }

  const handleDelete = async (docId, filename) => {
    if (!confirm(`Delete "${filename}"?`)) return
    try {
      await docsAPI.delete(docId)
      showToast(`Deleted ${filename}`)
      loadDocs()
    } catch { showToast('Delete failed', 'err') }
  }

  return (
    <div style={{ padding:'1.25rem', height:'100%', overflowY:'auto' }}>
      {/* Toast */}
      {toast && (
        <div className="anim-fadeUp" style={{ position:'fixed', top:16, right:16, zIndex:999, background: toast.type==='ok' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${toast.type==='ok' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius:10, padding:'12px 16px', fontSize:13, color: toast.type==='ok' ? '#34d399' : '#f87171', maxWidth:360 }}>
          {toast.msg}
        </div>
      )}

      {/* Upload panel */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:'1.25rem', marginBottom:'1.5rem' }}>
        <div style={{ fontSize:14, fontWeight:500, marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
          <Upload size={15} color="var(--accent)" />
          Upload document
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.75rem' }}>
          <div>
            <label style={{ display:'block', fontSize:11, fontFamily:'var(--mono)', color:'var(--t2)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Department</label>
            <select value={dept} onChange={e => setDept(e.target.value)}
              style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:9, padding:'9px 12px', color:'var(--t1)', fontSize:13, outline:'none', fontFamily:'var(--body)' }}>
              {depts.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, fontFamily:'var(--mono)', color:'var(--t2)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Description</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Q3 financial report"
              style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:9, padding:'9px 12px', color:'var(--t1)', fontSize:13, outline:'none', fontFamily:'var(--body)' }} />
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if(f) setFile(f) }}
          onClick={() => fileRef.current.click()}
          style={{ border:`1.5px dashed ${dragging ? 'var(--accent)' : 'var(--border2)'}`, borderRadius:12, padding:'1.75rem', textAlign:'center', cursor:'pointer', background: dragging ? 'rgba(99,102,241,0.04)' : 'var(--surface)', transition:'all 0.15s', marginBottom:'0.75rem' }}
        >
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,.csv" style={{ display:'none' }} onChange={e => setFile(e.target.files[0])} />
          <CloudUpload size={28} color={dragging ? 'var(--accent)' : 'var(--t3)'} style={{ margin:'0 auto 8px' }} />
          {file ? (
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--t1)', marginBottom:3 }}>{file.name}</div>
              <div style={{ fontSize:11, color:'var(--t3)', fontFamily:'var(--mono)' }}>{(file.size/1024).toFixed(1)} KB</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:13, color:'var(--t2)', marginBottom:4 }}>Drop file here or click to browse</div>
              <div style={{ fontSize:11, color:'var(--t3)', fontFamily:'var(--mono)' }}>PDF · DOCX · TXT · MD · CSV · max 50MB</div>
            </div>
          )}
        </div>

        <button onClick={handleUpload} disabled={!file || uploading}
          style={{ background: file && !uploading ? 'var(--accent)' : 'var(--border)', color: file && !uploading ? '#fff' : 'var(--t3)', border:'none', borderRadius:9, padding:'10px 20px', fontSize:13, fontWeight:500, cursor: file && !uploading ? 'pointer' : 'not-allowed', fontFamily:'var(--display)', transition:'all 0.15s' }}>
          {uploading ? 'Processing...' : '🚀 Ingest Document'}
        </button>
      </div>

      {/* Document list */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
          <FileText size={14} color="var(--t2)" />
          <span style={{ fontSize:13, fontWeight:500 }}>Knowledge base</span>
          <span style={{ marginLeft:'auto', fontSize:11, fontFamily:'var(--mono)', color:'var(--t3)' }}>{docs.length} documents</span>
        </div>

        {docs.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'var(--t3)', fontSize:13 }}>
            No documents yet. Upload your first document above.
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Document','Department','Description','Uploaded by','Date',''].map(h => (
                  <th key={h} style={{ padding:'9px 14px', fontSize:9, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--t3)', textAlign:'left', fontWeight:400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => (
                <tr key={doc.doc_id || i} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--card2)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'11px 14px', fontSize:13, fontWeight:500, color:'var(--t1)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <FileText size={13} color="var(--t3)" />
                      <span style={{ maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.filename}</span>
                    </div>
                  </td>
                  <td style={{ padding:'11px 14px' }}>
                    <span style={{ fontSize:10, fontFamily:'var(--mono)', padding:'2px 8px', borderRadius:5, background:`${DEPT_COLORS[doc.department]||'#94a3b8'}15`, color:DEPT_COLORS[doc.department]||'#94a3b8', border:`1px solid ${DEPT_COLORS[doc.department]||'#94a3b8'}30`, textTransform:'uppercase', letterSpacing:'0.04em' }}>{doc.department}</span>
                  </td>
                  <td style={{ padding:'11px 14px', fontSize:12, color:'var(--t2)', maxWidth:200 }}>
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{doc.description || '—'}</span>
                  </td>
                  <td style={{ padding:'11px 14px', fontSize:11, fontFamily:'var(--mono)', color:'var(--t3)' }}>{doc.uploaded_by}</td>
                  <td style={{ padding:'11px 14px', fontSize:11, fontFamily:'var(--mono)', color:'var(--t3)' }}>{doc.ingested_at?.split(' ')[0]}</td>
                  <td style={{ padding:'11px 14px' }}>
                    {user?.role === 'admin' && (
                      <button onClick={() => handleDelete(doc.doc_id, doc.filename)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t3)', display:'flex', padding:4, borderRadius:5 }}
                        onMouseEnter={e => e.currentTarget.style.color='#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color='var(--t3)'}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
