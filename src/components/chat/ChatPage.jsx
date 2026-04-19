import { useState, useRef, useEffect } from 'react'
import { Send, Zap, Brain, FileText, AlertTriangle } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import ReactMarkdown from 'react-markdown'

const DEPT_COLORS = { hr:'#22d3ee', finance:'#34d399', marketing:'#fbbf24', legal:'#818cf8', engineering:'#f87171', general:'#94a3b8' }
const ROLE_COLORS = { admin:'#818cf8', hr:'#22d3ee', finance:'#34d399', marketing:'#fbbf24', engineering:'#f87171', employee:'#94a3b8' }
const SUGGESTIONS = ['What is the leave policy?','Summarize Q3 financial report','What are the engineering tech standards?','What are employee benefits?','Explain the recruitment process','What is the EBITDA margin?']

function TypingIndicator() {
  return (
    <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'flex-start' }}>
      <div style={{ width:28, height:28, borderRadius:8, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Brain size={13} color="#818cf8" />
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'4px 10px 10px 10px', padding:'12px 14px', display:'flex', gap:5, alignItems:'center' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:'pulse-soft 1.2s infinite', animationDelay:`${i*0.15}s`, opacity:0.7 }} />
        ))}
      </div>
    </div>
  )
}

function Message({ msg, userInitials, roleColor }) {
  const isUser = msg.role === 'user'
  return (
    <div className="anim-fadeUp" style={{ display:'flex', gap:10, marginBottom:20, flexDirection: isUser ? 'row-reverse' : 'row', alignItems:'flex-start' }}>
      {/* Avatar */}
      <div style={{ width:28, height:28, borderRadius:8, background: isUser ? `${roleColor}18` : 'rgba(99,102,241,0.1)', border:`1px solid ${isUser ? roleColor+'33' : 'rgba(99,102,241,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:600, color: isUser ? roleColor : '#818cf8' }}>
        {isUser ? (userInitials || 'U') : <Brain size={13} />}
      </div>

      <div style={{ maxWidth:'78%', minWidth:0 }}>
        {/* Bubble */}
        <div style={{ background: isUser ? 'var(--accent)' : 'var(--card)', border: isUser ? 'none' : '1px solid var(--border)', borderRadius: isUser ? '10px 4px 10px 10px' : '4px 10px 10px 10px', padding:'11px 14px', fontSize:14, lineHeight:1.65, color: isUser ? '#fff' : 'var(--t1)', wordBreak:'break-word' }}>
          {msg.blocked ? (
            <div style={{ display:'flex', alignItems:'center', gap:8, color:'#fbbf24' }}>
              <AlertTriangle size={14} />
              <span>{msg.content}</span>
            </div>
          ) : (
            <div style={{ '& p': { marginBottom:'0.5rem' }, '& strong': { fontWeight:600 } }}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {msg.sources?.length > 0 && (
          <div style={{ marginTop:8, background:'rgba(6,182,212,0.04)', border:'1px solid rgba(6,182,212,0.15)', borderRadius:8, padding:'8px 12px' }}>
            <div style={{ fontSize:9, fontFamily:'var(--mono)', color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Sources</div>
            {msg.sources.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'3px 0', borderBottom: i < msg.sources.length-1 ? '1px solid var(--border)' : 'none' }}>
                <FileText size={11} color="var(--teal)" style={{ flexShrink:0 }} />
                <span style={{ fontSize:11, color:'var(--t2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.filename}</span>
                <span style={{ fontSize:9, fontFamily:'var(--mono)', padding:'1px 6px', borderRadius:4, background:`${DEPT_COLORS[s.department] || '#94a3b8'}18`, color: DEPT_COLORS[s.department] || '#94a3b8', border:`1px solid ${DEPT_COLORS[s.department] || '#94a3b8'}30`, textTransform:'uppercase', letterSpacing:'0.04em', flexShrink:0 }}>{s.department}</span>
              </div>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:5 }}>
          <span style={{ fontSize:10, color:'var(--t3)', fontFamily:'var(--mono)' }}>{msg.time}</span>
          {!isUser && msg.tokens > 0 && <>
            <span style={{ fontSize:10, color:'var(--t3)' }}>·</span>
            <span style={{ fontSize:10, color:'var(--t3)', fontFamily:'var(--mono)' }}>{msg.latency}s</span>
            <span style={{ fontSize:10, color:'var(--t3)' }}>·</span>
            <span style={{ fontSize:10, color:'var(--t3)', fontFamily:'var(--mono)' }}>{msg.tokens} tok</span>
            {msg.modelUsed && <>
              <span style={{ fontSize:10, color:'var(--t3)' }}>·</span>
              <div style={{ display:'flex', alignItems:'center', gap:4, background: msg.isComplex ? 'rgba(99,102,241,0.08)' : 'rgba(6,182,212,0.08)', border:`1px solid ${msg.isComplex ? 'rgba(99,102,241,0.2)' : 'rgba(6,182,212,0.2)'}`, borderRadius:4, padding:'1px 6px' }}>
                <Zap size={8} color={msg.isComplex ? '#818cf8' : '#06b6d4'} />
                <span style={{ fontSize:9, fontFamily:'var(--mono)', color: msg.isComplex ? '#818cf8' : '#06b6d4' }}>{msg.isComplex ? '70B' : '8B'}</span>
              </div>
            </>}
          </>}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { messages, loading, sendMessage, clearMessages } = useChatStore()
  const { user } = useAuthStore()
  const [query, setQuery] = useState('')
  const bottomRef = useRef(null)
  const roleColor = ROLE_COLORS[user?.role] || '#818cf8'

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, loading])

  const handleSend = () => {
    if (!query.trim() || loading) return
    sendMessage(query.trim())
    setQuery('')
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'1.25rem' }}>
      {/* Empty state */}
      {messages.length === 0 && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
          <div style={{ width:56, height:56, borderRadius:14, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem' }}>
            <Brain size={24} color="#818cf8" />
          </div>
          <h2 style={{ fontFamily:'var(--display)', fontSize:'1.3rem', fontWeight:600, marginBottom:6 }}>Ask your knowledge base</h2>
          <p style={{ fontSize:13, color:'var(--t2)', marginBottom:'2rem', maxWidth:380 }}>
            Query company documents securely. RBAC ensures you only access authorized content.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', maxWidth:500 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setQuery(s) }}
                style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 13px', fontSize:12, color:'var(--t2)', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--t1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--t2)' }}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div style={{ flex:1, overflowY:'auto', paddingRight:4, marginBottom:'1rem' }}>
          {messages.map(msg => <Message key={msg.id} msg={msg} userInitials={user?.initials} roleColor={roleColor} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:14, padding:'12px 14px', flexShrink:0 }}>
        <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
          <textarea value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }}}
            placeholder="Ask anything about company data, policies, reports..."
            rows={1}
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--t1)', fontSize:14, fontFamily:'var(--body)', resize:'none', lineHeight:1.5, maxHeight:120, overflowY:'auto' }}
          />
          <button onClick={handleSend} disabled={!query.trim() || loading}
            style={{ width:36, height:36, borderRadius:9, background: query.trim() && !loading ? 'var(--accent)' : 'var(--border)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor: query.trim() && !loading ? 'pointer' : 'not-allowed', transition:'all 0.15s', flexShrink:0 }}>
            <Send size={15} color={query.trim() && !loading ? '#fff' : 'var(--t3)'} />
          </button>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, alignItems:'center' }}>
          <span style={{ fontSize:10, color:'var(--t3)', fontFamily:'var(--mono)' }}>Enter to send · Shift+Enter for newline</span>
          {messages.length > 0 && (
            <button onClick={clearMessages} style={{ fontSize:10, color:'var(--t3)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--mono)' }}>Clear chat</button>
          )}
        </div>
      </div>
    </div>
  )
}
