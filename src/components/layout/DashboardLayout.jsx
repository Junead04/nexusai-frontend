import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { MessageSquare, FolderOpen, BarChart2, Shield, LogOut, ChevronRight, ChevronDown, Bell, HelpCircle } from 'lucide-react'
import { useAuthStore, useChatStore, useLangStore } from '../../store/useStore'
import { LANGUAGES, useTranslation } from '../../utils/i18n'

const ROLE_META = {
  admin:       { color:'#6366f1', bg:'rgba(99,102,241,0.12)',  border:'rgba(99,102,241,0.28)',  label:'Account Admin' },
  hr:          { color:'#0891b2', bg:'rgba(8,145,178,0.1)',    border:'rgba(8,145,178,0.25)',   label:'HR Manager' },
  finance:     { color:'#059669', bg:'rgba(5,150,105,0.1)',    border:'rgba(5,150,105,0.25)',   label:'Finance Analyst' },
  marketing:   { color:'#d97706', bg:'rgba(217,119,6,0.1)',    border:'rgba(217,119,6,0.25)',   label:'Marketing Manager' },
  engineering: { color:'#dc2626', bg:'rgba(220,38,38,0.1)',    border:'rgba(220,38,38,0.25)',   label:'Engineer' },
  employee:    { color:'#6b7280', bg:'rgba(107,114,128,0.08)', border:'rgba(107,114,128,0.2)',  label:'Employee' },
}
const DEPT_COLORS = { hr:'#0891b2', finance:'#059669', marketing:'#d97706', engineering:'#dc2626', legal:'#7c3aed', general:'#6b7280' }

export default function DashboardLayout() {
  const { user, logout }  = useAuthStore()
  const { messages }      = useChatStore()
  const { lang, setLang } = useLangStore()
  const t   = useTranslation(lang)
  const nav = useNavigate()
  const m   = ROLE_META[user?.role] || ROLE_META.employee
  const initials = user?.initials || user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || 'NA'

  const userChats   = messages.filter(x=>x.role==='user').length
  const aiResponses = messages.filter(x=>x.role==='assistant').length
  const deptCounts  = {}
  messages.filter(x=>x.role==='assistant').forEach(msg => msg.sources?.forEach(s => { deptCounts[s.department]=(deptCounts[s.department]||0)+1 }))
  const maxDept = Math.max(...Object.values(deptCounts), 1)

  const NAV_ITEMS = [
    { to:'/chat',      icon:MessageSquare, label:t.chatAssistant, feature:'chat'      },
    { to:'/documents', icon:FolderOpen,    label:t.documents,     feature:'upload'    },
    { to:'/analytics', icon:BarChart2,     label:t.analytics,     feature:'analytics' },
    { to:'/audit',     icon:Shield,        label:t.auditTrail,    feature:'audit'     },
  ].filter(n => user?.features?.includes(n.feature))

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh',
      background:'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 40%, #eff6ff 70%, #f0fdf4 100%)',
      fontFamily:"'Inter','Segoe UI',sans-serif", overflow:'hidden' }}>

      {/* ── TOP NAVBAR ── */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 18px', height:54,
        background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(99,102,241,0.15)', flexShrink:0, zIndex:20,
        boxShadow:'0 1px 10px rgba(99,102,241,0.07)' }}>
        {/* Logo + subtitle */}
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(99,102,241,0.35)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span style={{ fontWeight:800, fontSize:16, color:'#1e1b4b', letterSpacing:'-0.01em' }}>
              Nexus<span style={{ color:'#6366f1' }}>AI</span>
            </span>
          </div>
          <span style={{ fontSize:12, color:'#9ca3af', borderBottom:'1px solid rgba(99,102,241,0.2)', paddingBottom:1 }}>
            Enterprise Knowledge System
          </span>
        </div>
        {/* Center nav */}
        <div style={{ display:'flex', gap:0 }}>
          {NAV_ITEMS.slice(0,3).map(({ to, label }) => (
            <NavLink key={to} to={to} style={({isActive}) => ({
              padding:'6px 13px', fontSize:13, fontWeight: isActive?600:400, textDecoration:'none', transition:'all .15s',
              color: isActive ? '#6366f1' : '#6b7280',
              borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
              background:'transparent',
            })}>{label}</NavLink>
          ))}
        </div>
        {/* Right */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', gap:3 }}>
            {Object.entries(LANGUAGES).map(([code, meta]) => (
              <button key={code} onClick={()=>setLang(code)} style={{
                padding:'3px 6px', borderRadius:5, fontSize:10, fontWeight:600, cursor:'pointer', border:'1px solid',
                background: lang===code ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: lang===code ? '#6366f1' : '#9ca3af',
                borderColor: lang===code ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.12)',
                transition:'all .15s',
              }}>{meta.flag}</button>
            ))}
          </div>
          <button style={{ display:'flex', alignItems:'center', gap:5, color:'#6b7280', background:'none', border:'none', cursor:'pointer', fontSize:12 }}>
            <HelpCircle size={15}/> Help
          </button>
          <div style={{ position:'relative' }}>
            <Bell size={16} style={{ color:'#6b7280', cursor:'pointer' }}/>
            <span style={{ position:'absolute', top:-6, right:-6, width:15, height:15, borderRadius:'50%', background:'#ef4444', color:'#fff', fontSize:8, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>3</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 10px', borderRadius:7,
            background:'rgba(255,255,255,0.8)', border:'1px solid rgba(99,102,241,0.15)', cursor:'pointer', boxShadow:'0 1px 6px rgba(99,102,241,0.07)' }}>
            <div style={{ width:26, height:26, borderRadius:7, background:m.bg, border:`1px solid ${m.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:m.color, flexShrink:0 }}>{initials}</div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'#1e1b4b', lineHeight:1.2 }}>{user?.name}</div>
              <div style={{ fontSize:10, color:'#9ca3af' }}>{m.label}</div>
            </div>
            <ChevronDown size={11} style={{ color:'#9ca3af' }}/>
          </div>
        </div>
      </nav>

      {/* Accent line */}
      <div style={{ height:2, background:'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)', flexShrink:0, opacity:0.5 }}/>

      {/* ── BODY ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width:210, flexShrink:0, display:'flex', flexDirection:'column',
          background:'rgba(255,255,255,0.75)', backdropFilter:'blur(12px)',
          borderRight:'1px solid rgba(99,102,241,0.12)', overflow:'hidden' }}>

          {/* User card */}
          <div style={{ padding:'12px 12px 8px', flexShrink:0 }}>
            <div style={{ padding:'10px 11px', borderRadius:11, background:m.bg, border:`1px solid ${m.border}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${m.color}22`, border:`1.5px solid ${m.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:m.color, flexShrink:0 }}>{initials}</div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#1e1b4b', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
                  <p style={{ fontSize:10, color:'#6b7280', margin:0 }}>{user?.role}</p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 9px', borderRadius:6,
                background:'rgba(255,255,255,0.7)', border:'1px solid rgba(99,102,241,0.15)', cursor:'pointer' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                <span style={{ fontSize:11, color:'#374151', flex:1 }}>{m.label}</span>
                <ChevronDown size={10} style={{ color:'#9ca3af' }}/>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ padding:'2px 10px 6px', flexShrink:0 }}>
            <p style={{ fontSize:10, fontWeight:600, color:'#9ca3af', letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 4px 5px' }}>{t.navigation}</p>
            {NAV_ITEMS.map(({ to, icon:Icon, label }) => (
              <NavLink key={to} to={to} style={({isActive}) => ({
                display:'flex', alignItems:'center', gap:8, padding:'8px 9px', borderRadius:8,
                marginBottom:2, fontSize:12, fontWeight: isActive?600:400, textDecoration:'none', transition:'all .15s',
                color: isActive ? m.color : '#6b7280',
                background: isActive ? m.bg : 'transparent',
                border: isActive ? `1px solid ${m.border}` : '1px solid transparent',
              })}>
                {({isActive}) => <>
                  <Icon size={13} style={{ color: isActive ? m.color : '#9ca3af', flexShrink:0 }}/>
                  <span style={{ flex:1 }}>{label}</span>
                  {isActive && <ChevronRight size={11} style={{ color:m.color }}/>}
                </>}
              </NavLink>
            ))}
          </div>

          <div style={{ flex:1 }}/>

          {/* Usage Analytics */}
          <div style={{ padding:'10px 12px', borderTop:'1px solid rgba(99,102,241,0.1)', flexShrink:0 }}>
            <p style={{ fontSize:10, fontWeight:600, color:'#9ca3af', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>
              ▾ {t.usageAnalytics}
            </p>
            {[
              { icon:'🔵', label:t.totalChats,     val:userChats,   color:m.color },
              { icon:'🟢', label:t.totalResponses, val:aiResponses, color:'#059669' },
            ].map(({ icon, label, val, color }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 9px', borderRadius:8,
                background:'rgba(255,255,255,0.6)', border:'1px solid rgba(99,102,241,0.1)', marginBottom:5 }}>
                <div style={{ width:20, height:20, borderRadius:5, background:m.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, flexShrink:0 }}>{icon}</div>
                <span style={{ fontSize:11, color:'#6b7280', flex:1 }}>{label}</span>
                <span style={{ fontSize:15, fontWeight:700, color, fontFamily:'monospace' }}>
                  {val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                </span>
              </div>
            ))}
            {Object.entries(deptCounts).slice(0,3).map(([dept, count]) => (
              <div key={dept} style={{ display:'flex', alignItems:'center', gap:5, marginTop:4 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:DEPT_COLORS[dept]||'#6b7280', flexShrink:0 }}/>
                <span style={{ fontSize:10, color:'#9ca3af', width:64, flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dept}</span>
                <div style={{ flex:1, height:4, borderRadius:2, background:'rgba(99,102,241,0.08)' }}>
                  <div style={{ width:`${(count/maxDept)*100}%`, height:'100%', borderRadius:2, background:DEPT_COLORS[dept]||m.color, transition:'width .3s' }}/>
                </div>
                <span style={{ fontSize:9, fontFamily:'monospace', color:'#9ca3af', width:30, textAlign:'right', flexShrink:0 }}>
                  {(count/maxDept*0.8).toFixed(2)}k
                </span>
              </div>
            ))}
          </div>

          {/* Sign out */}
          <div style={{ padding:'6px 12px 14px', flexShrink:0 }}>
            <button onClick={() => { logout(); nav('/login') }}
              style={{ display:'flex', alignItems:'center', gap:7, width:'100%', padding:'8px 10px', borderRadius:8,
                background:'transparent', border:'1px solid transparent', cursor:'pointer', color:'#9ca3af', fontSize:12,
                transition:'all .15s', fontFamily:"'Inter','Segoe UI',sans-serif" }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.07)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.18)'; e.currentTarget.style.color='#dc2626'}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#9ca3af'}}>
              <LogOut size={12}/> ← {t.sigOut}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column', minHeight:0, minWidth:0 }}>
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
