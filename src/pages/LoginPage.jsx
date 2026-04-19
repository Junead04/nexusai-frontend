import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Shield, Lock, Users, Zap } from 'lucide-react'
import { authAPI } from '../utils/api'
import { useAuthStore, useLangStore } from '../store/useStore'
import { LANGUAGES, useTranslation } from '../utils/i18n'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ROLE_COLORS = {
  admin:       { color:'#6366f1', bg:'rgba(99,102,241,0.12)',  border:'rgba(99,102,241,0.3)',  label:'Account Admin' },
  hr:          { color:'#0891b2', bg:'rgba(8,145,178,0.1)',    border:'rgba(8,145,178,0.3)',   label:'HR Manager' },
  finance:     { color:'#059669', bg:'rgba(5,150,105,0.1)',    border:'rgba(5,150,105,0.3)',   label:'Finance Analyst' },
  marketing:   { color:'#d97706', bg:'rgba(217,119,6,0.1)',    border:'rgba(217,119,6,0.3)',   label:'Marketing Manager' },
  engineering: { color:'#dc2626', bg:'rgba(220,38,38,0.1)',    border:'rgba(220,38,38,0.3)',   label:'Engineer' },
  employee:    { color:'#6b7280', bg:'rgba(107,114,128,0.08)', border:'rgba(107,114,128,0.25)',label:'Employee' },
}

const G_ICON = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.6 26.8 36.5 24 36.5c-5.2 0-9.6-3-11.4-7.3L6.3 34c3.4 6.1 10 10 17.7 10z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.5 4.6-4.7 5.9l6.2 5.2C40.6 35.8 44 30.3 44 24c0-1.3-.2-2.7-.4-4z"/>
  </svg>
)

const MS_ICON = () => (
  <svg width="14" height="14" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
)

export default function LoginPage() {
  const [email, setEmail]         = useState('')
  const [pw, setPw]               = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [oauthSpin, setOauthSpin] = useState('')
  const [error, setError]         = useState('')
  const [demos, setDemos]         = useState([])
  const { setAuth, isAuthenticated } = useAuthStore()
  const { lang, setLang } = useLangStore()
  const t = useTranslation(lang)
  const navigate = useNavigate()
  const [sp] = useSearchParams()

  useEffect(() => {
    if (isAuthenticated) { navigate('/chat', { replace: true }); return }
    authAPI.demoUsers().then(r => setDemos(r.data)).catch(() => {})
    const tok  = sp.get('oauth_token')
    const name = sp.get('oauth_name')
    const mail = sp.get('oauth_email')
    const err  = sp.get('error')
    if (tok) {
      const user = {
        name: decodeURIComponent(name||'Google User'), email: decodeURIComponent(mail||''),
        role: 'employee', initials: decodeURIComponent(name||'GU').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
        departments: ['general'], features: ['chat'], oauth: 'google',
      }
      setAuth(user, tok); navigate('/chat', { replace: true }); return
    }
    if (err) {
      const msgs = { oauth_not_configured:'Google OAuth not configured. Add GOOGLE_CLIENT_ID to backend .env', token_exchange_failed:'Google login failed. Try again.', google_cancelled:'Google sign-in cancelled.' }
      setError(msgs[err] || `OAuth error: ${err}`)
    }
  }, [])

  async function login(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { data } = await authAPI.login(email, pw)
      setAuth(data.user, data.access_token)
      navigate('/chat', { replace: true })
    } catch { setError('Invalid credentials. Click a demo account below.') }
    finally { setLoading(false) }
  }

  const pwMap = { admin:'admin123', hr:'hr123', finance:'finance123', marketing:'marketing123', engineering:'dev123', employee:'emp123' }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:"'Inter','Segoe UI',sans-serif",
      background:'linear-gradient(135deg, #e8e6ff 0%, #eef2ff 25%, #e0e7ff 50%, #dde8ff 75%, #e4edff 100%)',
      overflow:'hidden' }}>

      {/* ═══ NAVBAR — light lavender style ═══ */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:52,
        background:'rgba(255,255,255,0.7)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(99,102,241,0.15)', flexShrink:0, zIndex:30 }}>
        <div style={{ display:'flex', alignItems:'center', gap:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 10px rgba(99,102,241,0.35)' }}>
              <Shield size={16} color="#fff"/>
            </div>
            <span style={{ fontWeight:800, fontSize:18, color:'#1e1b4b', letterSpacing:'-0.02em' }}>
              Nexus<span style={{ color:'#6366f1' }}>AI</span>
            </span>
          </div>
          <div style={{ display:'flex', gap:1 }}>
            {['LOGIN','CHAT','DOCUMENTS','ANALYTICS','AUDIT'].map((item, i) => (
              <button key={item} style={{ padding:'5px 12px', fontSize:11, fontWeight: i===0?700:500,
                color: i===0?'#6366f1':'#6b7280', border:'none', cursor:'pointer', background:'transparent',
                textTransform:'uppercase', letterSpacing:'0.06em',
                borderBottom: i===0?'2px solid #6366f1':'2px solid transparent', transition:'color .15s' }}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {Object.entries(LANGUAGES).map(([code, meta]) => (
            <button key={code} onClick={() => setLang(code)} style={{
              padding:'3px 8px', borderRadius:5, fontSize:10, fontWeight:600, cursor:'pointer', border:'1px solid',
              background: lang===code ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: lang===code ? '#6366f1' : '#9ca3af',
              borderColor: lang===code ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.15)',
            }}>{meta.flag} {code.toUpperCase()}</button>
          ))}
        </div>
      </nav>

      {/* ═══ BODY ═══ */}
      <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

        {/* ═══ LEFT: Login Card ═══ */}
        <div style={{ width:420, flexShrink:0, overflowY:'auto', padding:'22px 20px' }}>

          {/* Brand tagline above card */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(99,102,241,0.3)' }}>
                <Shield size={18} color="#fff"/>
              </div>
              <span style={{ fontWeight:800, fontSize:20, color:'#1e1b4b', letterSpacing:'-0.02em' }}>
                Nexus<span style={{ color:'#6366f1' }}>AI</span>
              </span>
            </div>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#312e81', margin:'0 0 2px' }}>
              Assign Specific Modules to Your Team
            </h2>
            <p style={{ fontSize:10, fontWeight:600, color:'#9ca3af', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              WITH ROLE-BASED ACCESS CONTROL
            </p>
          </div>

          {/* White glass card */}
          <div style={{ background:'rgba(255,255,255,0.88)', border:'1px solid rgba(99,102,241,0.15)',
            borderRadius:16, padding:'22px 20px', boxShadow:'0 12px 40px rgba(99,102,241,0.1), 0 4px 12px rgba(0,0,0,0.06)',
            backdropFilter:'blur(16px)' }}>

            {/* Title + Online */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'#1e1b4b', margin:0 }}>Sign in to workspace</h3>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'pulse 2s infinite' }}/>
                <span style={{ fontSize:11, color:'#059669', fontWeight:500 }}>Online</span>
              </div>
            </div>

            {/* SSO buttons */}
            <div style={{ marginBottom:14 }}>
              <p style={{ fontSize:10, fontWeight:600, color:'#9ca3af', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Sign in with SSO</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { key:'google', label:'Continue with Google', icon:<G_ICON/>, fn:()=>{ setOauthSpin('google'); window.location.href=`${API_URL}/api/auth/google` } },
                  { key:'ms',     label:'Microsoft SSO',        icon:<MS_ICON/>, fn:()=>setError('Microsoft SSO: Add AZURE_CLIENT_ID to .env') },
                ].map(b => (
                  <button key={b.key} onClick={b.fn} disabled={oauthSpin===b.key}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'9px 10px', borderRadius:9,
                      background:'rgba(255,255,255,0.9)', border:'1px solid rgba(99,102,241,0.2)',
                      cursor:'pointer', color:'#374151', fontSize:11.5, fontWeight:500,
                      boxShadow:'0 1px 4px rgba(99,102,241,0.08)', transition:'all .15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(238,235,254,0.9)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.35)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.9)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.2)'}}>
                    {oauthSpin===b.key ? <span style={{width:13,height:13,border:'2px solid rgba(99,102,241,0.3)',borderTopColor:'#6366f1',borderRadius:'50%',animation:'spin .8s linear infinite'}}/> : b.icon}
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ flex:1, height:1, background:'rgba(99,102,241,0.12)' }}/>
              <span style={{ fontSize:11, color:'#9ca3af' }}>or sign in with email</span>
              <div style={{ flex:1, height:1, background:'rgba(99,102,241,0.12)' }}/>
            </div>

            {/* Form */}
            <form onSubmit={login}>
              <div style={{ marginBottom:11 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6b7280', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>EMAIL</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="admin@nexus.ai"
                  style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.9)', border:'1.5px solid rgba(99,102,241,0.2)', borderRadius:8, color:'#1f2937', fontSize:13, outline:'none', boxSizing:'border-box', transition:'border-color .2s' }}
                  onFocus={e=>e.target.style.borderColor='#6366f1'}
                  onBlur={e=>e.target.style.borderColor='rgba(99,102,241,0.2)'}/>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6b7280', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>PASSWORD</label>
                <div style={{ position:'relative' }}>
                  <input type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} required placeholder="••••••••"
                    style={{ width:'100%', padding:'10px 36px 10px 12px', background:'rgba(255,255,255,0.9)', border:'1.5px solid rgba(99,102,241,0.2)', borderRadius:8, color:'#1f2937', fontSize:13, outline:'none', boxSizing:'border-box', transition:'border-color .2s' }}
                    onFocus={e=>e.target.style.borderColor='#6366f1'}
                    onBlur={e=>e.target.style.borderColor='rgba(99,102,241,0.2)'}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex' }}>
                    {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>
              {error && <div style={{ padding:'9px 12px', borderRadius:8, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:11.5, marginBottom:12, lineHeight:1.5 }}>⚠ {error}</div>}
              <button type="submit" disabled={loading}
                style={{ width:'100%', padding:'11px', borderRadius:9, background: loading?'#a5b4fc':'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:loading?'not-allowed':'pointer', boxShadow:'0 4px 14px rgba(99,102,241,0.3)', transition:'all .2s' }}>
                {loading ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><span style={{width:13,height:13,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>Authenticating...</span> : '→ Sign in to NexusAI'}
              </button>
            </form>

            {/* Demo accounts */}
            <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid rgba(99,102,241,0.1)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:'0.1em', textTransform:'uppercase' }}>DEMO ACCOUNTS</span>
                <div style={{ display:'flex', gap:18 }}>
                  <span style={{ fontSize:10, color:'#d1d5db' }}>Name</span>
                  <span style={{ fontSize:10, color:'#d1d5db' }}>Permissions</span>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {demos.map(u => {
                  const r = ROLE_COLORS[u.role] || ROLE_COLORS.employee
                  const ini = u.name?.split(' ').map(n=>n[0]).join('').slice(0,2)||'NA'
                  return (
                    <button key={u.email} onClick={() => { setEmail(u.email); setPw(pwMap[u.role]||'emp123'); setError('') }}
                      style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:10, padding:'7px 10px', borderRadius:9, background:'rgba(255,255,255,0.7)', border:'1px solid rgba(99,102,241,0.1)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(238,235,254,0.8)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.25)'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.1)'}}>
                      <div style={{ width:28, height:28, borderRadius:8, background:r.bg, border:`1px solid ${r.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:r.color, flexShrink:0 }}>{ini}</div>
                      <span style={{ fontSize:12.5, fontWeight:500, color:'#374151' }}>{u.name}</span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'3px 10px', borderRadius:20, background:r.bg, color:r.color, border:`1px solid ${r.border}`, whiteSpace:'nowrap' }}>{r.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <p style={{ marginTop:12, textAlign:'center', fontSize:10, color:'#9ca3af' }}>Protected by JWT · RBAC · PII Guardrails</p>
          </div>
        </div>

        {/* ═══ RIGHT: Hero — person silhouette + text + cards all visible ═══ */}
        <div style={{ flex:1, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>

          {/* Soft gradient background — light purple/blue */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(140deg, rgba(224,231,255,0.5) 0%, rgba(199,210,254,0.3) 40%, rgba(196,181,253,0.2) 70%, rgba(165,180,252,0.25) 100%)' }}/>

        {/* Large background hero image */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            height: '100%',
            width: '85%',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            zIndex: 1,
          }}
        >
          <img
            src="/hero-person.png"
            alt="Professional using NexusAI"
            style={{
              height: '100%',
              width: 'auto',
              objectFit: 'cover',
              objectPosition: 'right bottom',
              filter: 'drop-shadow(0 20px 60px rgba(99,102,241,0.25))',
              
              /* Smooth bottom fade */
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)',
            }}
          />
        </div>

          {/* ★ Hero content — positioned to fill space, not pushed to bottom ★ */}
          <div style={{ position:'relative', zIndex:5, display:'flex', flexDirection:'column', height:'100%', padding:'32px 44px 28px 44px' }}>

            {/* Feature badges — top right (like Image 2) */}
            <div style={{ display:'flex', flexDirection:'column', gap:10, alignSelf:'flex-end', marginBottom:'auto' }}>
              {[
                { icon:<Shield size={14} color="#6366f1"/>, text:'Safeguard Private Data',      bg:'rgba(99,102,241,0.12)',  border:'rgba(99,102,241,0.25)', color:'#312e81' },
                { icon:<Users  size={14} color="#0891b2"/>, text:'Role-Based Access Control',   bg:'rgba(8,145,178,0.1)',    border:'rgba(8,145,178,0.25)',  color:'#0e7490' },
                { icon:<Zap    size={14} color="#059669"/>, text:'Intelligent RAG Pipeline',    bg:'rgba(5,150,105,0.1)',    border:'rgba(5,150,105,0.25)',  color:'#065f46' },
              ].map(({ icon, text, bg, border, color }) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px', borderRadius:40, background:'rgba(255,255,255,0.82)', border:`1px solid ${border}`, backdropFilter:'blur(10px)', boxShadow:'0 4px 14px rgba(99,102,241,0.1)', whiteSpace:'nowrap' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:bg, border:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
                  <span style={{ fontSize:12.5, fontWeight:600, color }}>{text}</span>
                </div>
              ))}
            </div>

            {/* ★ Main hero text — placed in middle of right area ★ */}
            <div style={{ marginTop:'auto', marginBottom:28 }}>
              <h1 style={{ fontSize:42, fontWeight:900, color:'#1e1b4b', lineHeight:1.1, marginBottom:14, letterSpacing:'-0.025em', textShadow:'0 1px 0 rgba(255,255,255,0.5)' }}>
                Secure Document<br/>Indexing &<br/>Enterprise Chatbot
              </h1>
              <p style={{ fontSize:15, color:'#4338ca', marginBottom:30, fontWeight:500, opacity:0.85 }}>
                Manage Team Permissions with Role-Based Access Control
              </p>

              {/* ★ Feature cards — visible, not cut off ★ */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, maxWidth:620 }}>
                {[
                  { icon:'🔒', bg:'rgba(99,102,241,0.15)',  border:'rgba(99,102,241,0.25)', title:'Safeguard Sensitive Data',    desc:'Restrict access to confidential documents.' },
                  { icon:'👥', bg:'rgba(8,145,178,0.12)',   border:'rgba(8,145,178,0.22)',  title:'Role-Based Access Control',   desc:'Manage user permissions and access levels.' },
                  { icon:'🤖', bg:'rgba(5,150,105,0.12)',   border:'rgba(5,150,105,0.22)',  title:'Intelligent RAG Pipeline',    desc:'Leverage RAG technology for precise document indexing.' },
                ].map(({ icon, bg, border, title, desc }) => (
                  <div key={title} style={{ padding:'16px 15px', borderRadius:13, background:'rgba(255,255,255,0.6)', border:`1px solid ${border}`, backdropFilter:'blur(10px)', boxShadow:'0 3px 14px rgba(99,102,241,0.08)', transition:'transform .2s' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                    <div style={{ width:42, height:42, borderRadius:12, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:10 }}>{icon}</div>
                    <h3 style={{ fontSize:13, fontWeight:700, color:'#1e1b4b', marginBottom:6, lineHeight:1.3 }}>{title}</h3>
                    <p style={{ fontSize:11.5, color:'#6b7280', lineHeight:1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin  { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
