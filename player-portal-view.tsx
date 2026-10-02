'use client'
import { useEffect,useMemo,useState } from 'react'
import { getPlayers } from '@/lib/data'
import type { Player } from '@/lib/types'
import { configured } from '@/lib/supabase/client'

export function PlayerPortalView({query}:{query:string}){
 const [players,setPlayers]=useState<Player[]>([]); const [error,setError]=useState('')
 useEffect(()=>{getPlayers().then(d=>setPlayers(d as unknown as Player[])).catch(e=>setError(e.message))},[])
 const term=query.toLowerCase().trim()
 const rows=useMemo(()=>players.filter(p=>!term||p.full_name.toLowerCase().includes(term)||(p.position||'').toLowerCase().includes(term)||(p.clubs?.name||'').toLowerCase().includes(term)),[players,term])
 return <div className="panel"><div className="panelhead"><h2>Player search</h2><span className="badge">{rows.length} players</span></div>
 {!configured&&<div className="notice error">Add the Supabase environment variables before using live data.</div>}{error&&<div className="notice error">{error}</div>}
 <div style={{overflowX:'auto'}}><table><thead><tr><th>Player</th><th>DOB</th><th>Position</th><th>Foot</th><th>Club</th><th>Average</th><th>Status</th></tr></thead>
 <tbody>{rows.map(p=><tr key={p.id}><td><strong>{p.full_name}</strong></td><td>{p.date_of_birth||'—'}</td><td>{p.position||'—'}</td><td>{p.preferred_foot||'—'}</td><td>{p.clubs?.name||'—'}</td><td>{p.average_score??'—'}</td><td><span className="badge">{p.recruitment_status}</span></td></tr>)}</tbody></table></div></div>
}
