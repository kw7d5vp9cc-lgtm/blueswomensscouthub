'use client'
import { useEffect,useMemo,useState } from 'react'
import { getPlayers } from '@/lib/data'
import type { Player } from '@/lib/types'
export function RecruitmentView({query}:{query:string}){
 const [players,setPlayers]=useState<Player[]>([]); const [sort,setSort]=useState<'average_score'|'full_name'|'position'|'recruitment_status'>('average_score')
 useEffect(()=>{getPlayers().then(d=>setPlayers(d as unknown as Player[])).catch(()=>{})},[])
 const term=query.toLowerCase().trim()
 const rows=useMemo(()=>players.filter(p=>!term||p.full_name.toLowerCase().includes(term)||(p.position||'').toLowerCase().includes(term)||(p.clubs?.name||'').toLowerCase().includes(term)).sort((a,b)=>String(b[sort]??'').localeCompare(String(a[sort]??''),undefined,{numeric:true})),[players,term,sort])
 return <div className="panel"><div className="panelhead"><h2>Reports overview · Longlist</h2><div>{(['average_score','position','recruitment_status','full_name'] as const).map(s=><button key={s} className={'btn '+(sort===s?'primary':'secondary')} style={{marginLeft:6}} onClick={()=>setSort(s)}>{s.replaceAll('_',' ')}</button>)}</div></div>
 <div style={{overflowX:'auto'}}><table><thead><tr><th>Player</th><th>Position</th><th>Club</th><th>Average</th><th>Reports</th><th>Highest</th><th>Status</th></tr></thead><tbody>{rows.map(p=><tr key={p.id}><td><strong>{p.full_name}</strong></td><td>{p.position||'—'}</td><td>{p.clubs?.name||'—'}</td><td>{p.average_score??'—'}</td><td>{p.report_count}</td><td>{p.highest_score??'—'}</td><td><span className="badge">{p.recruitment_status}</span></td></tr>)}</tbody></table></div></div>
}
