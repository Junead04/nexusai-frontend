import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Shield, MessageSquare, Upload, BarChart2, Search, LogOut, ChevronRight, Cpu, TrendingUp, Users, User, BarChart } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'

const ROLE_COLORS = {
  admin: '#818cf8', hr: '#22d3ee', finance: '#34d399',
  marketing: '#fbbf24', engineering: '#f87171', employee: '#94a3b8',
}
const ROLE_ICONS = {
  admin: Shield, hr: Users, finance: TrendingUp,
  marketing: BarChart, engineering: Cpu, employee: User,
}
const DEPT_COLORS = {
  hr: '#22d3ee', finance: '#34d399', marketing: '#fbbf24',
  legal: '#818cf8', engineering: '#f87171', general: '#94a3b8',
}

const NAV = [
  { id: 'chat',      label: 'Chat',        Icon: MessageSquare, feature: null },
  { id: 'documents', label: 'Documents',   Icon: Upload,        feature: 'upload' },
  { id: 'analytics', label: 'Analytics',   Icon: BarChart2,     feature: 'analytics' },
  { id: 'audit',     label: 'Audit Trail', Icon: Search,        feature: 'audit' },
]

export default function Sidebar({ activePage, setActivePage }) {
  const { user, logout, hasFeature } = useAuthStore()
  const { totalTokens, totalCost, queryCount } = useChatStore()
  const navigate = useNavigate()
  const RoleIcon = ROLE_ICONS[user?.role] || User
  const roleColor = ROLE_COLORS[user?.role] || '#818cf8'

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
      {/* Top accent */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg, ${roleColor}44, transparent)` }} />

      <div style={{ padding: '1.25rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:'1.5rem', paddingBottom:'1rem', borderBottom:'1px solid var(--border)' }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Shield size={15} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontFamily:'var(--display)', fontSize:'1rem', fontWeight:700, letterSpacing:'-0.02em' }}>
              Nexus<span style={{ color:'var(--accent)' }}>AI</span>
            </div>
            <div style={{ fontSize:9, fontFamily:'var(--mono)', color:'var(--t3)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Enterprise</div>
          </div>
        </div>

        {/* User card */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 12px', marginBottom:'1.25rem', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2, background: roleColor, borderRadius:'2px 0 0 2px' }} />
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:7 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`${roleColor}18`, border:`1px solid ${roleColor}33`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:12, fontWeight:600, color: roleColor }}>
              {user?.initials || user?.name?.[0] || 'U'}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--t1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize:10, color:'var(--t3)', fontFamily:'var(--mono)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:`${roleColor}12`, border:`1px solid ${roleColor}25`, borderRadius:5, padding:'3px 8px' }}>
            <RoleIcon size={10} color={roleColor} />
            <span style={{ fontSize:10, fontFamily:'var(--mono)', color: roleColor, textTransform:'uppercase', letterSpacing:'0.05em' }}>{user?.role_label || user?.role}</span>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ fontSize:9, fontFamily:'var(--mono)', color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Navigation</div>
        <nav style={{ display:'flex', flexDirection:'column', gap:2, marginBottom:'1.25rem' }}>
          {NAV.map(({ id, label, Icon, feature }) => {
            if (feature && !hasFeature(feature)) return null
            const isActive = activePage === id
            return (
              <button key={id} onClick={() => setActivePage(id)}
                style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:9, border: isActive ? `1px solid ${roleColor}22` : '1px solid transparent', background: isActive ? `${roleColor}10` : 'transparent', color: isActive ? roleColor : 'var(--t2)', fontSize:13, fontWeight: isActive ? 500 : 400, cursor:'pointer', textAlign:'left', transition:'all 0.15s', width:'100%' }}
                onMouseEnter={e => { if(!isActive) { e.currentTarget.style.background='var(--card)'; e.currentTarget.style.color='var(--t1)' }}}
                onMouseLeave={e => { if(!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--t2)' }}}
              >
                <Icon size={15} />
                {label}
                {isActive && <ChevronRight size={12} style={{ marginLeft:'auto' }} />}
              </button>
            )
          })}
        </nav>

        {/* Departments */}
        <div style={{ fontSize:9, fontFamily:'var(--mono)', color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>
          Access ({user?.departments?.length || 0} depts)
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:'1.25rem' }}>
          {(user?.departments || []).map(d => (
            <div key={d} style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background: DEPT_COLORS[d] || '#94a3b8', flexShrink:0 }} />
              <span style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--t2)' }}>{d}</span>
            </div>
          ))}
        </div>

        {/* Session stats */}
        <div style={{ marginTop:'auto', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
          <div style={{ fontSize:9, fontFamily:'var(--mono)', color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Session</div>
          {[
            { label:'Queries', value: queryCount, color:'var(--accent)' },
            { label:'Tokens',  value: totalTokens.toLocaleString(), color:'var(--teal)' },
            { label:'Cost',    value: `$${totalCost.toFixed(4)}`, color:'var(--green)' },
          ].map(s => (
            <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0' }}>
              <span style={{ fontSize:11, color:'var(--t3)', fontFamily:'var(--mono)' }}>{s.label}</span>
              <span style={{ fontSize:12, fontFamily:'var(--mono)', color: s.color, fontWeight:500 }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          style={{ display:'flex', alignItems:'center', gap:8, marginTop:12, padding:'8px 10px', borderRadius:9, border:'1px solid var(--border)', background:'transparent', color:'var(--t3)', fontSize:12, cursor:'pointer', width:'100%', transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(239,68,68,0.4)'; e.currentTarget.style.color='#fca5a5' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--t3)' }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  )
}
