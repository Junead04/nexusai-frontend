import { useChatStore } from '../store/useStore'
import { Zap, DollarSign, Clock, MessageSquare, Cpu, TrendingUp } from 'lucide-react'

function SC({ icon:Icon, label, value, sub, color, light }) {
  return (
    <div className="glass-card" style={{ borderRadius:14, padding:'14px 16px', position:'relative', overflow:'hidden', boxShadow:'0 4px 16px rgba(99,102,241,0.08)' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${color},transparent)` }}/>
      <div style={{ width:30, height:30, borderRadius:8, background:light, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
        <Icon size={14} style={{ color }}/>
      </div>
      <p style={{ fontFamily:'Georgia,serif', fontSize:'1.5rem', fontWeight:700, color:'#312e81' }}>{value}</p>
      <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginTop:3 }}>{label}</p>
      {sub && <p style={{ fontSize:10, color:'#9ca3af', marginTop:2 }}>{sub}</p>}
    </div>
  )
}

function Bars({ vals, color, light }) {
  const max = Math.max(...vals, 1)
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:68 }}>
      {vals.map((v,i) => (
        <div key={i} style={{ flex:1, borderRadius:'3px 3px 0 0', background:color, opacity:0.4+(i/vals.length)*0.6, height:`${Math.max(8,(v/max)*100)}%`, transition:'height 0.3s' }}/>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { messages, totalTokens, totalCost, queryCount } = useChatStore()
  const ai = messages.filter(m=>m.role==='assistant'&&!m.blocked)
  const lats = ai.map(m=>m.latency||0); const toks = ai.map(m=>m.tokens||0)
  const avgLat = lats.length?(lats.reduce((a,b)=>a+b,0)/lats.length).toFixed(2):'0.00'
  const complex = ai.filter(m=>m.is_complex).length; const simple = ai.filter(m=>!m.is_complex&&m.model_used).length
  const deptC = {}; ai.forEach(m=>m.sources?.forEach(s=>{deptC[s.department]=(deptC[s.department]||0)+1}))
  const DCOL = { hr:'#0891b2', finance:'#059669', marketing:'#d97706', legal:'#7c3aed', engineering:'#dc2626', general:'#6b7280' }
  const DLGT = { hr:'#cffafe', finance:'#d1fae5', marketing:'#fef3c7', legal:'#ede9fe', engineering:'#fee2e2', general:'#f3f4f6' }
  const stats = [
    { icon:MessageSquare, label:'Total Queries',  value:queryCount,    sub:'this session',    color:'#6366f1', light:'#ede9fe' },
    { icon:Zap,           label:'Tokens Used',    value:`${(totalTokens/1000).toFixed(1)}K`, sub:'LLaMA models', color:'#0891b2', light:'#cffafe' },
    { icon:DollarSign,    label:'Session Cost',   value:`$${totalCost.toFixed(4)}`, sub:'actual',       color:'#059669', light:'#d1fae5' },
    { icon:Clock,         label:'Avg Latency',    value:`${avgLat}s`,  sub:'per query',       color:'#d97706', light:'#fef3c7' },
  ]
  return (
    <div style={{ padding:24, minHeight:'100%', background:'linear-gradient(135deg,#f5f3ff 0%,#eff6ff 50%,#f0fdf4 100%)' }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.3rem', fontWeight:700, color:'#312e81' }}>Usage Analytics</h2>
        <p style={{ fontSize:12, color:'#6b7280', marginTop:3 }}>Real-time session metrics and model routing</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {stats.map(s=><SC key={s.label} {...s}/>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        {lats.length>0?(
          <>
            {[{title:'Response latency (s)',vals:lats.slice(-12),color:'#6366f1',light:'#ede9fe'},
              {title:'Tokens per query',   vals:toks.slice(-12),color:'#0891b2',light:'#cffafe'}].map(({title,vals,color,light})=>(
              <div key={title} className="glass-card" style={{ borderRadius:14, padding:'14px 16px', boxShadow:'0 4px 16px rgba(99,102,241,0.08)' }}>
                <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>{title}</p>
                <Bars vals={vals} color={color} light={light}/>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                  <span style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#9ca3af' }}>Q1</span>
                  <span style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#9ca3af' }}>Latest</span>
                </div>
              </div>
            ))}
          </>
        ):(
          <div style={{ gridColumn:'1/-1', padding:'40px 20px', textAlign:'center' }} className="glass-card">
            <TrendingUp size={26} style={{ color:'#c4b5fd', margin:'0 auto 10px', display:'block' }}/>
            <p style={{ fontSize:12, color:'#9ca3af' }}>Start chatting to see analytics populate here.</p>
          </div>
        )}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
        {/* Model routing */}
        <div className="glass-card" style={{ borderRadius:14, padding:'14px 16px', boxShadow:'0 4px 16px rgba(99,102,241,0.08)' }}>
          <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Model Routing</p>
          {[{label:'8B Simple',count:simple,color:'#059669',light:'#d1fae5',pct:ai.length?(simple/ai.length)*100:0},
            {label:'70B Complex',count:complex,color:'#d97706',light:'#fef3c7',pct:ai.length?(complex/ai.length)*100:0}].map(({label,count,color,light,pct})=>(
            <div key={label} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#374151' }}><Cpu size={10} style={{ color }}/>{label}</span>
                <span style={{ fontSize:11, fontFamily:'JetBrains Mono,monospace', color, fontWeight:600 }}>{count}</span>
              </div>
              <div style={{ height:5, borderRadius:3, background:'rgba(99,102,241,0.1)', overflow:'hidden' }}>
                <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:3, transition:'width 0.5s' }}/>
              </div>
            </div>
          ))}
        </div>
        {/* Dept hits */}
        <div className="glass-card" style={{ borderRadius:14, padding:'14px 16px', boxShadow:'0 4px 16px rgba(99,102,241,0.08)' }}>
          <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Department Hits</p>
          {Object.keys(deptC).length===0?<p style={{ fontSize:11, color:'#9ca3af' }}>No data yet</p>:
            Object.entries(deptC).sort((a,b)=>b[1]-a[1]).map(([d,c])=>{
              const col=DCOL[d]||'#6b7280'; const max=Math.max(...Object.values(deptC))
              return(<div key={d} style={{display:'flex',alignItems:'center',gap:7,marginBottom:7}}>
                <span style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',color:'#374151',width:70,flexShrink:0}}>{d}</span>
                <div style={{flex:1,height:5,borderRadius:3,background:'rgba(99,102,241,0.08)',overflow:'hidden'}}><div style={{width:`${(c/max)*100}%`,height:'100%',background:col,borderRadius:3}}/></div>
                <span style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',color:'#9ca3af',width:14,textAlign:'right'}}>{c}</span>
              </div>)
            })}
        </div>
        {/* Cost projection */}
        <div className="glass-card" style={{ borderRadius:14, padding:'14px 16px', boxShadow:'0 4px 16px rgba(99,102,241,0.08)' }}>
          <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Cost Projection</p>
          {[{label:'per 100 queries',val:`$${queryCount?((totalCost/queryCount)*100).toFixed(3):'0.000'}`,color:'#312e81'},
            {label:'est. monthly (3K)',val:`$${queryCount?((totalCost/queryCount)*3000).toFixed(2):'0.00'}`,color:'#059669'}].map(({label,val,color})=>(
            <div key={label} style={{marginBottom:14}}>
              <p style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',color:'#9ca3af'}}>{label}</p>
              <p style={{fontFamily:'Georgia,serif',fontSize:'1.4rem',fontWeight:700,color,marginTop:3}}>{val}</p>
            </div>
          ))}
          <div style={{paddingTop:10,borderTop:'1px solid rgba(99,102,241,0.1)'}}>
            <p style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',color:'#9ca3af'}}>models</p>
            <p style={{fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'#4f46e5',marginTop:2,fontWeight:600}}>8B + 70B · Groq free tier</p>
          </div>
        </div>
      </div>
    </div>
  )
}
