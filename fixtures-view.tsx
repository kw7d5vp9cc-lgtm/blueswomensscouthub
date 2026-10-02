'use client'
import { useEffect,useMemo,useState } from 'react'
import { getFixtures,getProfiles } from '@/lib/data'
import { supabase } from '@/lib/supabase/client'
import type { Fixture,Profile } from '@/lib/types'

const empty={home_team:'',away_team:'',fixture_date:'',kick_off:'',venue:'',age_group:'',competition:'',fixture_reference:'',allocated_scout:''}

export function FixturesView({query}:{query:string}){
 const [fixtures,setFixtures]=useState<Fixture[]>([]); const [profiles,setProfiles]=useState<Profile[]>([]); const [open,setOpen]=useState(false); const [form,setForm]=useState(empty); const [message,setMessage]=useState('')
 const load=()=>Promise.all([getFixtures(),getProfiles()]).then(([f,p])=>{setFixtures(f as unknown as Fixture[]);setProfiles(p as Profile[])})
 useEffect(()=>{load().catch(e=>setMessage(e.message))},[])
 const term=query.toLowerCase().trim(); const rows=useMemo(()=>fixtures.filter(f=>!term||f.home_team.toLowerCase().includes(term)||f.away_team.toLowerCase().includes(term)||(f.venue||'').toLowerCase().includes(term)),[fixtures,term])
 async function save(){
  if(!supabase) return setMessage('Supabase is not configured.')
  if(!form.home_team||!form.away_team||!form.fixture_date) return setMessage('Home team, away team and date are required.')
  const payload={...form,kick_off:form.kick_off||null,venue:form.venue||null,age_group:form.age_group||null,competition:form.competition||null,fixture_reference:form.fixture_reference||null,allocated_scout:form.allocated_scout||null,status:form.allocated_scout?'allocated':'available'}
  const {error}=await supabase.from('fixtures').insert(payload); if(error) return setMessage(error.message)
  setOpen(false);setForm(empty);setMessage('Fixture created.');await load()
 }
 return <><div className="panel"><div className="panelhead"><h2>Upcoming fixtures</h2><button className="btn primary" onClick={()=>setOpen(true)}>+ Add fixture</button></div>
 {message&&<div className={message.includes('created')?'notice':'notice error'}>{message}</div>}
 <div style={{overflowX:'auto'}}><table><thead><tr><th>Date</th><th>Reference</th><th>Fixture</th><th>Time</th><th>Venue</th><th>Competition</th><th>Scout</th></tr></thead><tbody>
 {rows.map(f=><tr key={f.id}><td>{f.fixture_date}</td><td>{f.fixture_reference||'—'}</td><td><strong>{f.home_team}</strong> v <strong>{f.away_team}</strong></td><td>{f.kick_off?.slice(0,5)||'—'}</td><td>{f.venue||'—'}</td><td>{f.competition||'—'}</td><td>{f.profiles?.full_name||<span className="badge">{f.status}</span>}</td></tr>)}
 </tbody></table></div></div>
 {open&&<div className="overlay"><div className="modal"><h2>Add fixture</h2><div className="formgrid">
 {(['home_team','away_team','fixture_date','kick_off','venue','age_group','competition','fixture_reference'] as const).map(k=><div className="field" key={k}><label>{k.replaceAll('_',' ')}</label><input type={k==='fixture_date'?'date':k==='kick_off'?'time':'text'} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}
 <div className="field full"><label>Assign scout</label><select value={form.allocated_scout} onChange={e=>setForm({...form,allocated_scout:e.target.value})}><option value="">Available / unassigned</option>{profiles.map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
 </div><div className="actions"><button className="btn secondary" onClick={()=>setOpen(false)}>Cancel</button><button className="btn primary" onClick={save}>Create fixture</button></div></div></div>}
 </>
}
