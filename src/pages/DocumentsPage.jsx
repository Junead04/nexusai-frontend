import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, FileText, CheckCircle, AlertCircle, Plus, Users } from 'lucide-react'
import { docsAPI } from '../utils/api'
import { useAuthStore, useAuditStore } from '../store/useStore'

const DEPT_COLORS = { hr:'#0891b2', finance:'#059669', marketing:'#d97706', legal:'#7c3aed', engineering:'#dc2626', general:'#6b7280' }
const DEPT_LIGHT  = { hr:'#cffafe', finance:'#d1fae5', marketing:'#fef3c7', legal:'#ede9fe', engineering:'#fee2e2', general:'#f3f4f6' }

export default function DocumentsPage() {
  const [docs,setDocs]=useState([]); const [uploading,setUploading]=useState(false)
  const [status,setStatus]=useState(null); const [dept,setDept]=useState('')
  const [desc,setDesc]=useState(''); const [file,setFile]=useState(null)
  const fileRef=useRef(null); const {user}=useAuthStore(); const {addLog}=useAuditStore()
  const allowed=user?.departments||[]; const canUpload=user?.features?.includes('upload'); const isAdmin=user?.role==='admin'

  useEffect(()=>{fetchDocs()},[])
  useEffect(()=>{if(allowed.length)setDept(allowed[0])},[allowed.join()])
  async function fetchDocs(){try{const{data}=await docsAPI.list();setDocs(data)}catch{}}
  async function handleUpload(e){
    e.preventDefault(); if(!file||!dept)return
    const fd=new FormData(); fd.append('file',file); fd.append('department',dept); fd.append('description',desc)
    setUploading(true); setStatus(null)
    try{
      const{data}=await docsAPI.upload(fd)
      setStatus({ok:true,msg:`Ingested "${data.filename}" — ${data.chunks} chunks created`})
      setFile(null); setDesc(''); if(fileRef.current)fileRef.current.value=''
      addLog({action:'UPLOAD',user:user?.email,role:user?.role,detail:`${data.filename} → ${dept}`,timestamp:new Date().toISOString()})
      await fetchDocs()
    }catch(err){setStatus({ok:false,msg:err.response?.data?.detail||'Upload failed'})}
    finally{setUploading(false)}
  }
  async function handleDelete(docId,filename){
    if(!window.confirm(`Delete "${filename}"?`))return
    try{await docsAPI.delete(docId);addLog({action:'DELETE',user:user?.email,role:user?.role,detail:`Deleted: ${filename}`,timestamp:new Date().toISOString()});await fetchDocs()}catch{}
  }

  return (
    <div style={{padding:24,minHeight:'100%',background:'linear-gradient(135deg,#f5f3ff 0%,#eff6ff 50%,#f0fdf4 100%)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'1.3rem',fontWeight:700,color:'#312e81'}}>Document Management</h2>
          <p style={{fontSize:12,color:'#6b7280',marginTop:3}}>{docs.length} documents in your knowledge base</p>
        </div>
        <span style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',padding:'4px 12px',borderRadius:20,background:'#ede9fe',color:'#4f46e5',fontWeight:600,border:'1px solid #c4b5fd'}}>RBAC Filtered View</span>
      </div>

      {canUpload && (
        <div className="glass-card" style={{borderRadius:16,padding:20,marginBottom:20,boxShadow:'0 4px 20px rgba(99,102,241,0.08)'}}>
          <h3 style={{fontSize:13,fontWeight:700,color:'#312e81',marginBottom:14,display:'flex',alignItems:'center',gap:7}}>
            <span style={{width:24,height:24,borderRadius:7,background:'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center'}}><Plus size={13} style={{color:'#6366f1'}}/></span>
            Upload New Document
          </h3>
          <form onSubmit={handleUpload}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <label style={{display:'block',fontSize:10,fontFamily:'JetBrains Mono,monospace',fontWeight:600,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:5}}>Department</label>
                <select value={dept} onChange={e=>setDept(e.target.value)} style={{width:'100%',padding:'9px 12px',background:'rgba(255,255,255,0.9)',border:'1.5px solid rgba(99,102,241,0.18)',borderRadius:9,fontSize:12,color:'#374151',outline:'none'}}>
                  {allowed.map(d=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:10,fontFamily:'JetBrains Mono,monospace',fontWeight:600,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:5}}>Description</label>
                <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Q3 Financial Report..." style={{width:'100%',padding:'9px 12px',background:'rgba(255,255,255,0.9)',border:'1.5px solid rgba(99,102,241,0.18)',borderRadius:9,fontSize:12,color:'#374151',outline:'none'}}/>
              </div>
            </div>
            <div onClick={()=>fileRef.current?.click()} style={{padding:28,borderRadius:12,border:`2px dashed ${file?'#6366f1':'rgba(99,102,241,0.25)'}`,background:file?'#ede9fe':'rgba(255,255,255,0.5)',textAlign:'center',cursor:'pointer',transition:'all 0.2s',marginBottom:12}}
              onMouseEnter={e=>!file&&(e.currentTarget.style.borderColor='rgba(99,102,241,0.45)')}
              onMouseLeave={e=>!file&&(e.currentTarget.style.borderColor='rgba(99,102,241,0.25)')}>
              <Upload size={22} style={{color:file?'#6366f1':'#9ca3af',margin:'0 auto 8px',display:'block'}}/>
              {file?(<><p style={{fontSize:13,color:'#4f46e5',fontWeight:600}}>{file.name}</p><p style={{fontSize:11,color:'#9ca3af',marginTop:3}}>{(file.size/1024).toFixed(1)} KB</p></>)
                   :(<><p style={{fontSize:12,color:'#6b7280'}}>Drop file here or click to browse</p><p style={{fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'#9ca3af',marginTop:4}}>PDF · DOCX · TXT · MD · CSV (max 50MB)</p></>)}
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,.csv" style={{display:'none'}} onChange={e=>setFile(e.target.files[0]||null)}/>
            </div>
            {status&&<div style={{display:'flex',alignItems:'center',gap:7,padding:'9px 13px',borderRadius:9,background:status.ok?'#d1fae5':'#fee2e2',border:`1px solid ${status.ok?'#6ee7b7':'#fca5a5'}`,color:status.ok?'#065f46':'#dc2626',fontSize:12,marginBottom:12}}>
              {status.ok?<CheckCircle size={13}/>:<AlertCircle size={13}/>} {status.msg}
            </div>}
            <button type="submit" disabled={!file||uploading} style={{display:'flex',alignItems:'center',gap:7,padding:'10px 20px',borderRadius:10,background:(!file||uploading)?'#e0e7ff':'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',color:(!file||uploading)?'#a5b4fc':'#fff',fontSize:13,fontWeight:600,cursor:(!file||uploading)?'not-allowed':'pointer',boxShadow:(!file||uploading)?'none':'0 3px 12px rgba(99,102,241,0.3)',transition:'all 0.2s'}}>
              {uploading?<><span style={{width:13,height:13,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/>Processing...</>:<><Upload size={13}/>Ingest Document</>}
            </button>
          </form>
        </div>
      )}

      <div className="glass-card" style={{borderRadius:16,overflow:'hidden',boxShadow:'0 4px 20px rgba(99,102,241,0.08)'}}>
        <div style={{padding:'12px 18px',borderBottom:'1px solid rgba(99,102,241,0.1)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,0.5)'}}>
          <h3 style={{fontFamily:'Georgia,serif',fontSize:14,fontWeight:700,color:'#312e81'}}>Knowledge Base Documents</h3>
          <span style={{fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'#9ca3af'}}>{docs.length} files</span>
        </div>
        {docs.length===0?(
          <div style={{padding:'40px 20px',textAlign:'center'}}><FileText size={28} style={{color:'#9ca3af',margin:'0 auto 10px',display:'block',opacity:0.5}}/><p style={{fontSize:12,color:'#9ca3af'}}>No documents ingested yet.</p></div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,tableLayout:'fixed'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(99,102,241,0.1)',background:'rgba(238,235,254,0.3)'}}>
                {[{l:'Document',w:'34%'},{l:'Department',w:'14%'},{l:'Description',w:'22%'},{l:'Uploaded by',w:'16%'},{l:'Date',w:'11%'},{l:'',w:'3%'}].map(h=>(
                  <th key={h.l} style={{width:h.w,padding:'9px 13px',textAlign:'left',fontSize:10,fontFamily:'JetBrains Mono,monospace',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.06em'}}>{h.l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc,i)=>{
                const col=DEPT_COLORS[doc.department]||'#6b7280'; const lt=DEPT_LIGHT[doc.department]||'#f3f4f6'
                return(
                  <tr key={i} style={{borderBottom:'1px solid rgba(99,102,241,0.07)',transition:'background 0.1s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(238,235,254,0.3)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'10px 13px',display:'flex',alignItems:'center',gap:7}}><FileText size={12} style={{color:'#9ca3af',flexShrink:0}}/><span style={{color:'#1f2937',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.filename}</span></td>
                    <td style={{padding:'10px 13px'}}><span style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',padding:'2px 8px',borderRadius:20,background:lt,color:col,fontWeight:600,border:`1px solid ${col}33`}}>{doc.department}</span></td>
                    <td style={{padding:'10px 13px',color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.description||'—'}</td>
                    <td style={{padding:'10px 13px',fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'#9ca3af',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.uploaded_by}</td>
                    <td style={{padding:'10px 13px',fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'#9ca3af'}}>{doc.ingested_at?.slice(0,10)}</td>
                    <td style={{padding:'10px 9px'}}>{isAdmin&&<button onClick={()=>handleDelete(doc.doc_id,doc.filename)} style={{background:'none',border:'none',cursor:'pointer',color:'#d1d5db',display:'flex',padding:3,borderRadius:5,transition:'all 0.15s'}} onMouseEnter={e=>{e.currentTarget.style.background='#fee2e2';e.currentTarget.style.color='#dc2626'}} onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#d1d5db'}}><Trash2 size={12}/></button>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
