import { Shield, Zap, Lock, Activity } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const ROLE_COLORS = {
  admin:'#818cf8', hr:'#22d3ee', finance:'#34d399',
  marketing:'#fbbf24', engineering:'#f87171', employee:'#94a3b8',
}

export default function Header({ activePage }) {
  const { user } = useAuthStore()
  const roleColor = ROLE_COLORS[user?.role] || '#818cf8'
  const pageTitles = { chat:'Knowledge Chat', documents:'Document Management', analytics:'Usage Analytics', audit:'Audit Trail' }

  return (
    <div style={{ height:56, background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem', flexShrink:0 }}>
      {/* Page title */}
      <div>
        <span style={{ fontSize:14, fontWeight:500, color:'var(--t1)' }}>{pageTitles[activePage] || 'Dashboard'}</span>
      </div>

      {/* Right side indicators */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {/* Security indicators */}
        {[
          { icon:<Lock size={11}/>, label:'RBAC', color:'#34d399' },
          { icon:<Shield size={11}/>, label:'Guardrails', color:'#818cf8' },
          { icon:<Activity size={11}/>, label:'LangSmith', color:'#22d3ee' },
        ].map(({ icon, label, color }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 9px', background:`${color}10`, border:`1px solid ${color}22`, borderRadius:6 }}>
            <span style={{ color, display:'flex' }}>{icon}</span>
            <span style={{ fontSize:10, fontFamily:'var(--mono)', color, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
          </div>
        ))}

        {/* Role badge */}
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', background:`${roleColor}10`, border:`1px solid ${roleColor}25`, borderRadius:8 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:roleColor, animation:'pulse-soft 2s infinite' }} />
          <span style={{ fontSize:11, fontFamily:'var(--mono)', color:roleColor, textTransform:'uppercase', letterSpacing:'0.05em' }}>{user?.role_label || user?.role}</span>
        </div>
      </div>
    </div>
  )
}
