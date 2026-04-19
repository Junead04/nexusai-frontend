import { useAuditStore, useAuthStore } from '../store/useStore'
import { Shield, Search, AlertOctagon } from 'lucide-react'
import { useState } from 'react'

const ROLE_META = {
  admin:{color:'#4f46e5',light:'#ede9fe'}, hr:{color:'#0891b2',light:'#cffafe'},
  finance:{color:'#059669',light:'#d1fae5'}, marketing:{color:'#d97706',light:'#fef3c7'},
  engineering:{color:'#dc2626',light:'#fee2e2'}, employee:{color:'#6b7280',light:'#f3f4f6'},
}
const ACT = {
  LOGIN:  { bg:'#d1fae5', color:'#065f46', border:'#6ee7b7' },
  LOGOUT: { bg:'#f3f4f6', color:'#4b5563', border:'#d1d5db' },
  QUERY:  { bg:'#cffafe', color:'#0e7490', border:'#67e8f9' },
  UPLOAD: { bg:'#ede9fe', color:'#4338ca', border:'#c4b5fd' },
  DELETE: { bg:'#fee2e2', color:'#991b1b', border:'#fca5a5' },
}

export default function AuditPage() {
  const { logs } = useAuditStore()
  const { user } = useAuthStore()
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  if (!user?.features?.includes('audit')) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
      <div style={{ textAlign:'center' }}>
        <AlertOctagon size={40} style={{ color:'#dc2626', margin:'0 auto 12px', display:'block', opacity:0.4 }}/>
        <p style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem', fontWeight:700, color:'#312e81' }}>Access Restricted</p>
        <p style={{ fontSize:12, color:'#9ca3af', marginTop:6 }}>Audit log is restricted to administrators only.</p>
      </div>
    </div>
  )

  const counts = logs.reduce((a,l)=>({...a,[l.action]:(a[l.action]||0)+1}),{})
  const filtered = logs.filter(l =>
    (filter==='ALL'||l.action===filter) &&
    (!search||l.user?.includes(search)||l.detail?.includes(search))
  )

  return (
    <div style={{ padding:24, minHeight:'100%', background:'linear-gradient(135deg,#f5f3ff 0%,#eff6ff 50%,#f0fdf4 100%)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.3rem', fontWeight:700, color:'#312e81' }}>Audit Trail</h2>
          <p style={{ fontSize:12, color:'#6b7280', marginTop:3 }}>{logs.length} events recorded this session</p>
        </div>
        <span style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', padding:'4px 12px', borderRadius:20, background:'#fee2e2', color:'#991b1b', fontWeight:600, border:'1px solid #fca5a5', display:'flex', alignItems:'center', gap:5 }}>
          <Shield size={10}/> Admin Only
        </span>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:18 }}>
        {Object.entries(ACT).map(([action,s])=>(
          <div key={action} className="glass-card" style={{ borderRadius:12, padding:'12px 14px', position:'relative', overflow:'hidden', boxShadow:'0 3px 12px rgba(99,102,241,0.07)' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.border }}/>
            <p style={{ fontFamily:'Georgia,serif', fontSize:'1.4rem', fontWeight:700, color:s.color }}>{counts[action]||0}</p>
            <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginTop:3 }}>{action}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {['ALL',...Object.keys(ACT)].map(a => {
          const s=ACT[a]; const active=filter===a
          return (
            <button key={a} onClick={()=>setFilter(a)}
              style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', padding:'5px 12px', borderRadius:20, cursor:'pointer', transition:'all 0.15s', fontWeight:active?600:400,
                background: active?(s?.bg||'#ede9fe'):'rgba(255,255,255,0.7)',
                color: active?(s?.color||'#4338ca'):'#6b7280',
                border: `1px solid ${active?(s?.border||'#c4b5fd'):'rgba(99,102,241,0.15)'}`,
              }}>
              {a}
            </button>
          )
        })}
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:7, padding:'6px 12px', borderRadius:20, background:'rgba(255,255,255,0.75)', border:'1px solid rgba(99,102,241,0.15)', marginLeft:4 }}>
          <Search size={12} style={{ color:'#9ca3af' }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search user or detail..."
            style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:12, color:'#374151' }}/>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ borderRadius:14, overflow:'hidden', boxShadow:'0 4px 16px rgba(99,102,241,0.08)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, tableLayout:'fixed' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.1)', background:'rgba(238,235,254,0.4)' }}>
              {[{l:'Timestamp',w:'13%'},{l:'Action',w:'10%'},{l:'User',w:'22%'},{l:'Role',w:'14%'},{l:'Detail',w:'41%'}].map(h=>(
                <th key={h.l} style={{ width:h.w, padding:'9px 13px', textAlign:'left', fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h.l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0?(
              <tr><td colSpan={5} style={{ padding:'36px 13px', textAlign:'center', fontSize:12, color:'#9ca3af' }}>No audit events yet. Start using the system to generate logs.</td></tr>
            ):filtered.map((log,i)=>{
              const s=ACT[log.action]||ACT.QUERY; const rm=ROLE_META[log.role]||ROLE_META.employee
              return(
                <tr key={i} style={{ borderBottom:'1px solid rgba(99,102,241,0.07)', transition:'background 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(238,235,254,0.25)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'9px 13px', fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#9ca3af' }}>{log.timestamp?new Date(log.timestamp).toLocaleTimeString():'—'}</td>
                  <td style={{ padding:'9px 13px' }}><span style={{ fontSize:9, fontFamily:'JetBrains Mono,monospace', padding:'2px 7px', borderRadius:20, background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontWeight:600, textTransform:'uppercase' }}>{log.action}</span></td>
                  <td style={{ padding:'9px 13px', fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#374151', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.user||'—'}</td>
                  <td style={{ padding:'9px 13px' }}><span style={{ fontSize:9, fontFamily:'JetBrains Mono,monospace', padding:'2px 7px', borderRadius:20, background:rm.light, color:rm.color, fontWeight:600, border:`1px solid ${rm.color}33`, textTransform:'uppercase' }}>{log.role}</span></td>
                  <td style={{ padding:'9px 13px', fontSize:11, color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.detail}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
