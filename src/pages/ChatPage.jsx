import { useState, useRef, useEffect } from 'react'
import { Send, Bot, AlertTriangle, Cpu, Clock, FileText, Sparkles, Trash2, Mic, MicOff } from 'lucide-react'
import { chatAPI, wakeUpBackend } from '../utils/api'
import { useAuthStore, useChatStore, useAuditStore, useLangStore } from '../store/useStore'
import { useTranslation } from '../utils/i18n'
import ReactMarkdown from 'react-markdown'

const DEPT_COLORS = { hr:'#4dd9c3', finance:'#4ade80', marketing:'#fbbf24', legal:'#a78bfa', engineering:'#f87171', general:'#94a3b8' }
const ROLE_META = {
  admin:       { color:'#a78bfa', bg:'rgba(167,139,250,0.18)' },
  hr:          { color:'#4dd9c3', bg:'rgba(77,217,195,0.15)' },
  finance:     { color:'#4ade80', bg:'rgba(74,222,128,0.15)' },
  marketing:   { color:'#fbbf24', bg:'rgba(251,191,36,0.15)' },
  engineering: { color:'#dc2626', bg:'rgba(248,113,113,0.15)' },
  employee:    { color:'#94a3b8', bg:'rgba(148,163,184,0.1)' },
}

const SUGGESTIONS = [
  'Show me the latest quarterly financial report',
  "What's our current employee leave policy?",
  'What are the engineering code standards?',
  'List all employee benefits.',
  'Summarize the company recruitment process.',
  "What's our current vendor cost breakdown?",
]

function getSentiment(text) {
  const pos = (text.match(/\b(good|great|excellent|strong|growth|profit|success|positive|increase|improvement|benefit|achieve|best)\b/gi)||[]).length
  const neg = (text.match(/\b(bad|poor|decline|loss|risk|weak|negative|decrease|fail|problem|issue|concern|down)\b/gi)||[]).length
  if (pos > neg + 1) return { label:'positive', color:'#4ade80', icon:'😊' }
  if (neg > pos + 1) return { label:'negative', color:'#dc2626', icon:'😟' }
  return { label:'neutral', color:'#94a3b8', icon:'😐' }
}

function TypingDots() {
  return (
    <div style={{ display:'flex', gap:5, padding:'10px 14px', alignItems:'center' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:'rgba(99,102,241,0.4)', display:'inline-block', animation:'pulseDot 1.2s ease-in-out infinite', animationDelay:`${i*0.2}s` }}/>
      ))}
    </div>
  )
}

function UserMessage({ msg, m, initials }) {
  return (
    <div style={{ display:'flex', justifyContent:'flex-end', gap:8, padding:'0 0 4px' }}>
      <div style={{ maxWidth:'70%' }}>
        <div style={{ padding:'10px 14px', borderRadius:'14px 3px 14px 14px', background:`linear-gradient(135deg,${m?.color||'#6366f1'}22,${m?.color||'#6366f1'}14)`, border:`1px solid ${m?.color||'#6366f1'}40`, color:'rgba(255,255,255,0.92)', fontSize:13, lineHeight:1.6 }}>
          {msg.content}
        </div>
        <p style={{ fontSize:10, color:'#9ca3af', marginTop:3, textAlign:'right', fontFamily:'monospace' }}>{msg.time}</p>
      </div>
      <div style={{ width:28, height:28, borderRadius:7, background:m?.bg||'rgba(99,102,241,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:m?.color||'#6366f1', flexShrink:0, marginTop:2 }}>{initials}</div>
    </div>
  )
}

function AIMessage({ msg, t }) {
  const sentiment = !msg.blocked ? getSentiment(msg.content) : null
  return (
    <div style={{ display:'flex', gap:8, padding:'0 0 4px' }}>
      <div style={{ width:28, height:28, borderRadius:7, background:'#ede9fe', border:'1px solid #c4b5fd', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
        <Bot size={13} color="#818cf8"/>
      </div>
      <div style={{ flex:1, maxWidth:'80%' }}>
        {msg.blocked ? (
          <div style={{ display:'flex', gap:8, padding:'10px 14px', borderRadius:'3px 14px 14px 14px', background:'#fef2f2', border:'1px solid #fecaca' }}>
            <AlertTriangle size={13} style={{ color:'#dc2626', marginTop:1, flexShrink:0 }}/>
            <p style={{ fontSize:13, color:'#dc2626', lineHeight:1.5, margin:0 }}>{msg.content}</p>
          </div>
        ) : (
          <div style={{ padding:'11px 14px', borderRadius:'3px 14px 14px 14px', background:'rgba(255,255,255,0.92)', border:'1px solid rgba(99,102,241,0.15)', fontSize:13, color:'#1f2937', lineHeight:1.65 }}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}

        {msg.sources?.length > 0 && (
          <div style={{ marginTop:5, padding:'6px 11px', background:'rgba(238,235,254,0.5)', border:'1px solid rgba(99,102,241,0.12)', borderRadius:8 }}>
            <p style={{ fontSize:9, fontFamily:'monospace', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Sources</p>
            {msg.sources.map((s,i) => {
              const col = DEPT_COLORS[s.department]||'#94a3b8'
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'2px 0' }}>
                  <FileText size={9} style={{ color:col, flexShrink:0 }}/>
                  <span style={{ fontSize:11, color:'#374151', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{s.filename}</span>
                  <span style={{ fontSize:9, fontFamily:'monospace', padding:'1px 6px', borderRadius:4, background:`${col}18`, color:col, border:`1px solid ${col}28`, flexShrink:0 }}>{s.department}</span>
                </div>
              )
            })}
          </div>
        )}

        {!msg.blocked && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4, flexWrap:'wrap' }}>
            {msg.latency > 0 && <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, fontFamily:'monospace', color:'#9ca3af' }}><Clock size={9}/>{msg.latency}s</span>}
            {msg.tokens > 0 && <><span style={{ fontSize:10, color:'#d1d5db' }}>·</span><span style={{ fontSize:10, fontFamily:'monospace', color:'#9ca3af' }}>{msg.tokens}t</span></>}
            {msg.model_used && <>
              <span style={{ fontSize:10, color:'#d1d5db' }}>·</span>
              <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, fontFamily:'monospace', color: msg.is_complex?'#fbbf24':'#4ade80' }}>
                <Cpu size={9}/>{msg.is_complex?'70B complex':'8B simple'}
              </span>
            </>}
            {sentiment && <>
              <span style={{ fontSize:10, color:'#d1d5db' }}>·</span>
              <span style={{ fontSize:10, padding:'1px 7px', borderRadius:10, background:`${sentiment.color}14`, color:sentiment.color, border:`1px solid ${sentiment.color}25` }}>
                {sentiment.icon} {sentiment.label}
              </span>
            </>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [query, setQuery]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isWakingUp, setIsWakingUp] = useState(false)
  const [voiceError, setVoiceError]   = useState('')
  const endRef     = useRef(null)
  const inputRef   = useRef(null)
  const recognitionRef = useRef(null)

  const { messages, addMessage, updateStats, clearAll } = useChatStore()
  const { addLog }  = useAuditStore()
  const { user }    = useAuthStore()
  const { lang }    = useLangStore()
  const t           = useTranslation(lang)
  const m           = ROLE_META[user?.role] || ROLE_META.employee
  const initials    = user?.initials || user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || 'U'

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, loading])

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setVoiceError('Voice not supported. Please use Chrome browser.')
      setTimeout(()=>setVoiceError(''),5000)
      return
    }
    // Stop if already listening
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const rec = new SR()
    recognitionRef.current = rec
    // Settings optimised for Indian English accent
    rec.continuous       = true   // keep listening until user stops
    rec.interimResults   = true   // show words as they are spoken
    rec.lang             = 'en-IN' // Indian English — better accent match
    rec.maxAlternatives  = 1

    let finalTranscript = ''

    rec.onstart = () => {
      setIsListening(true)
      setVoiceError('')
      finalTranscript = ''
    }

    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalTranscript += t + ' '
        else interim += t
      }
      // Show interim results in the input box
      setQuery((finalTranscript + interim).trim())
    }

    rec.onerror = (e) => {
      setIsListening(false)
      if (e.error === 'not-allowed') {
        setVoiceError('❌ Mic blocked. Click the camera icon in address bar → Allow Microphone → refresh page.')
      } else if (e.error === 'no-speech') {
        setVoiceError('🎤 No speech heard. Speak louder or closer to the mic.')
      } else if (e.error === 'network') {
        setVoiceError('🌐 Voice needs internet connection. Check your network.')
      } else {
        setVoiceError(`Voice error: ${e.error}. Try refreshing the page.`)
      }
      setTimeout(()=>setVoiceError(''), 6000)
    }

    rec.onend = () => {
      setIsListening(false)
      // Auto-send if we captured something
      const captured = finalTranscript.trim()
      if (captured && captured.length > 1) {
        setQuery(captured)
        setTimeout(() => sendMsg(captured), 300)
      }
    }

    try {
      rec.start()
    } catch(err) {
      setVoiceError('Could not start microphone. Refresh the page and try again.')
      setTimeout(()=>setVoiceError(''), 5000)
    }
  }

  async function sendMsg(override) {
    const text = (override || query).trim()
    if (!text || loading) return
    setQuery('')
    // Wake up Render if this is the first message (server may be sleeping)
    if (messages.length === 0) {
      setIsWakingUp(true)
      await wakeUpBackend()
      setIsWakingUp(false)
    }
    inputRef.current?.focus()
    const ts = new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
    addMessage({ role:'user', content:text, time:ts })
    setLoading(true)
    try {
      const { data } = await chatAPI.ask(text)
      addMessage({
        role:'assistant', content:data.answer||'No response received.',
        sources: data.sources||[], tokens: data.tokens||0,
        latency: data.latency||0, blocked: data.blocked||false,
        model_used: data.model_used||'', is_complex: data.is_complex||false, time:ts,
      })
      if (!data.blocked) {
        updateStats(data.tokens||0, data.cost||0)
        addLog({ action:'QUERY', user:user?.email, role:user?.role, detail:`${text.slice(0,60)}... | ${data.tokens}t`, timestamp:new Date().toISOString() })
      }
    } catch (err) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const isLocal = apiUrl.includes('localhost')
      const errMsg = isLocal
        ? '⚠ Connection error. Make sure the backend is running: cd backend && uvicorn app.main:app --reload'
        : '⚠ Server timed out (Render free tier 30s limit). Please try again — the server wakes up in ~30 seconds.'
      addMessage({ role:'assistant', content:errMsg, sources:[], tokens:0, latency:0, blocked:true, time:ts })
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 40%, #f0fdf4 100%)', overflow:'hidden', fontFamily:"'Inter','Segoe UI',sans-serif" }}>

      {/* ── CHAT HEADER ── */}
      <div style={{ flexShrink:0, padding:'12px 18px', borderBottom:'1px solid rgba(99,102,241,0.12)', background:'rgba(255,255,255,0.82)', backdropFilter:'blur(12px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:7 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 12px rgba(99,102,241,0.3)', flexShrink:0 }}>
            <Sparkles size={18} color="#fff"/>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:14, fontWeight:700, color:'#fff', margin:0, lineHeight:1.2 }}>{t.chatTitle}</p>
            <p style={{ fontSize:11, color:'#6b7280', margin:0 }}>{t.chatSub}</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <span style={{ fontSize:11, fontFamily:'monospace', color:'#9ca3af', padding:'3px 9px', borderRadius:5, background:'rgba(238,235,254,0.5)', border:'1px solid rgba(99,102,241,0.12)' }}>
              {new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
            </span>
            {messages.length > 0 && (
              <button onClick={clearAll} title="Clear chat" style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex', padding:4, borderRadius:6, transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.background='rgba(248,113,113,0.1)'}}
                onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.28)';e.currentTarget.style.background='none'}}>
                <Trash2 size={14}/>
              </button>
            )}
          </div>
        </div>
        {/* User info strip */}
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 11px', borderRadius:7, background:'rgba(238,235,254,0.6)', border:'1px solid rgba(99,102,241,0.18)', flexWrap:'wrap' }}>
          <span style={{ fontSize:11, color:'#374151', fontWeight:500 }}>👤 {user?.name}</span>
          <span style={{ color:'rgba(99,102,241,0.3)', fontSize:10 }}>|</span>
          <span style={{ fontSize:11, color:'#6b7280' }}>Role: <strong style={{ color:m?.color||'#6366f1', fontWeight:600 }}>{user?.role_label||user?.role}</strong></span>
          <span style={{ color:'rgba(99,102,241,0.3)', fontSize:10 }}>|</span>
          <span style={{ fontSize:11, color:'#6b7280' }}>Dept: <strong style={{ color:m?.color||'#6366f1', fontWeight:600 }}>{user?.departments?.join(', ')}</strong></span>
          <span style={{ color:'rgba(99,102,241,0.3)', fontSize:10 }}>|</span>
          <span style={{ fontSize:11, color:'#9ca3af' }}>Email: {user?.email}</span>
        </div>
      </div>

      {/* ── MESSAGES AREA ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 18px', display:'flex', flexDirection:'column', gap:10, minHeight:0 }}>
        {messages.length === 0 ? (
          /* Empty state — suggestions centered, no huge gap */
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center', padding:'20px' }}>
            <div style={{ width:60, height:60, borderRadius:16, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, boxShadow:'0 8px 24px rgba(99,102,241,0.3)' }}>
              <Sparkles size={26} color="#fff"/>
            </div>
            <h3 style={{ fontSize:'1.15rem', fontWeight:700, color:'#1e1b4b', marginBottom:6 }}>{t.chatTitle}</h3>
            <p style={{ fontSize:13, color:'#6b7280', marginBottom:22, maxWidth:340, lineHeight:1.6 }}>{t.chatSub}</p>
            <p style={{ fontSize:11, fontFamily:'monospace', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>💡 {t.suggestions}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', maxWidth:520 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMsg(s)}
                  style={{ padding:'8px 15px', borderRadius:20, background:'rgba(255,255,255,0.8)', border:'1px solid rgba(99,102,241,0.2)', color:'#374151', fontSize:12, cursor:'pointer', transition:'all .15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(99,102,241,0.18)';e.currentTarget.style.borderColor='rgba(99,102,241,0.45)';e.currentTarget.style.color='#fff'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(20,25,55,0.8)';e.currentTarget.style.borderColor='rgba(99,102,241,0.22)';e.currentTarget.style.color='rgba(255,255,255,0.72)'}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) =>
              msg.role === 'user'
                ? <UserMessage key={i} msg={msg} m={m} initials={initials}/>
                : <AIMessage key={i} msg={msg} t={t}/>
            )}
            {loading && (
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:7, background:'#ede9fe', border:'1px solid #c4b5fd', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                  <Bot size={13} color="#818cf8"/>
                </div>
                <div style={{ background:'rgba(255,255,255,0.92)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'3px 14px 14px 14px', minWidth:64 }}>
                  <TypingDots/>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </>
        )}
      </div>

      {/* ── INPUT AREA with Voice ── */}
      <div style={{ flexShrink:0, padding:'10px 18px 14px', background:'rgba(255,255,255,0.88)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(99,102,241,0.12)' }}>
        {voiceError && (
          <div style={{ marginBottom:7, padding:'6px 11px', borderRadius:7, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:11 }}>
            🎤 {voiceError}
          </div>
        )}
        {isListening && (
          <div style={{ marginBottom:7, padding:'6px 11px', borderRadius:7, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:11, display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#f87171', display:'inline-block', animation:'pulseDot 0.7s ease-in-out infinite' }}/>
            🎤 Listening... speak now. Click mic again to stop and send.
          </div>
        )}
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }}
            placeholder={isListening ? '🎤 Listening...' : t.typeQuestion}
            style={{ flex:1, padding:'11px 15px', background: isListening ? 'rgba(238,235,254,0.8)' : 'rgba(255,255,255,0.95)', border:`1px solid ${isListening ? 'rgba(248,113,113,0.45)' : 'rgba(99,102,241,0.2)'}`, borderRadius:10, color:'#1f2937', fontSize:13, outline:'none', transition:'all .2s', fontFamily:"'Inter','Segoe UI',sans-serif" }}
            onFocus={e => { if (!isListening) e.target.style.borderColor='rgba(99,102,241,0.5)' }}
            onBlur={e => { if (!isListening) e.target.style.borderColor='rgba(99,102,241,0.2)' }}
          />
          {/* Voice button */}
          <button onClick={startVoice} title={isListening ? 'Stop listening' : 'Voice input'}
            style={{ width:44, height:44, borderRadius:10, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s',
              background: isListening ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'rgba(99,102,241,0.15)',
              boxShadow: isListening ? '0 0 16px rgba(239,68,68,0.4)' : 'none',
            }}>
            {isListening ? <MicOff size={16} color="#fff"/> : <Mic size={16} style={{ color:'#374151' }}/>}
          </button>
          {/* Send button */}
          <button onClick={() => sendMsg()} disabled={loading || !query.trim()}
            style={{ width:44, height:44, borderRadius:10, background: (loading||!query.trim()) ? 'rgba(99,102,241,0.15)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', cursor: (loading||!query.trim()) ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow: (loading||!query.trim()) ? 'none' : '0 3px 12px rgba(99,102,241,0.35)', transition:'all .2s' }}>
            <Send size={16} style={{ color: (loading||!query.trim()) ? 'rgba(255,255,255,0.25)' : '#fff' }}/>
          </button>
        </div>
        <p style={{ fontSize:10, fontFamily:'monospace', color:'#9ca3af', marginTop:7, display:'flex', alignItems:'center', gap:8 }}>
          💡 Simple QA · LLaMa 3.1 8B · Complex/Financial · LLaMa 3.3 70B · Auto-routed
          <span style={{ color:'rgba(255,255,255,0.12)' }}>|</span>
          <span style={{ color:'rgba(220,38,38,0.6)' }}>🎤 Click mic → speak → click again to send</span>
        </p>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.25} }
      `}</style>
    </div>
  )
}
