'use client'
import type { NavItem } from '@/lib/types'
export function DashboardView({onNavigate}:{onNavigate:(n:NavItem)=>void}){
 return <div className="grid grid2">
  <div className="panel"><div className="panelhead"><h2>Recruitment overview</h2></div><div className="grid grid3">
    <div className="stat"><strong>Live</strong><span className="muted">Supabase-ready player data</span></div>
    <div className="stat"><strong>1–4</strong><span className="muted">Frequency of completion scoring</span></div>
    <div className="stat"><strong>Blue</strong><span className="muted">Talent pathway</span></div>
  </div></div>
  <div className="panel"><div className="panelhead"><h2>Quick actions</h2></div><div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
    <button className="btn primary" onClick={()=>onNavigate('Scouting Portal')}>Add report</button>
    <button className="btn secondary" onClick={()=>onNavigate('Fixtures')}>Manage fixtures</button>
    <button className="btn secondary" onClick={()=>onNavigate('Player Portal')}>Find player</button>
  </div></div>
 </div>
}
