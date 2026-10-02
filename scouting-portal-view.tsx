'use client'
import { useEffect,useState } from 'react'
import { getFixtures,getPlayers,getProfiles } from '@/lib/data'
import { supabase } from '@/lib/supabase/client'
import type { Fixture,Player,Profile,Score } from '@/lib/types'

const scores:Score[]=['1','2','3','4']
export function ScoutingPortalView(){
 const [open,setOpen]=useState(false),[message,setMessage]=useState('')
 const [players,setPlayers]=useState<Player[]>([]),[fixtures,setFixtures]=useState<Fixture[]>([]),[profiles,setProfiles]=useState<Profile[]>([])
 const [form,setForm]=useState({fixture_id:'',player_id:'',scout_id:'',score:'3' as Score,technical:'3' as Score,tactical:'3' as Score,physical:'3' as Score,mentality:'3' as Score,special:'',strengths:'',development:''})
 useEffect(()=>{Promise.all([getPlayers(),getFixtures(),getProfiles()]).then(([p,f,s])=>{setPlayers(p as unknown as Player[]);setFixtures(f as unknown as Fixture[]);setProfiles(s as Profile[])}).catch(e=>setMessage(e.message))},[])
 async function submit(){
  if(!supabase) return setMessage('Supabase is not configured.')
  if(!form.player_id||!form.scout_id) return setMessage('Player and scout are required.')
  const {data:report,error}=await supabase.from('reports').insert({fixture_id:form.fixture_id||null,player_id:form.player_id,scout_id:form.scout_id,score:form.score}).select('id').single()
  if(error||!report) return setMessage(error?.message||'Report could not be created.')
  const {error:aerr}=await supabase.from('report_assessments').insert({report_id:report.id,technical_score:form.technical,tactical_score:form.tactical,physical_score:form.physical,mentality_score:form.mentality,showed_something_special:form.special===''?null:form.special==='yes',strengths:form.strengths||null,development_areas:form.development||null})
  if(aerr) return setMessage(`Report created but assessment failed: ${aerr.message}`)
  setMessage('Report submitted successfully.');setOpen(false)
 }
 const ScoreField=({label,keyName}:{label:string,keyName:'score'|'technical'|'tactical'|'physical'|'mentality'})=><div className="field"><label>{label}</label><select value={form[keyName]} onChange={e=>setForm({...form,[keyName]:e.target.value as Score})}>{scores.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
 return <><div className="grid grid2">
  <div className="panel"><div className="panelhead"><h2>Scout home</h2></div><div className="grid grid3"><div className="stat"><strong>{fixtures.length}</strong><span className="muted">Fixtures</span></div><div className="stat"><strong>{players.length}</strong><span className="muted">Players</span></div><div className="stat"><strong>1–4</strong><span className="muted">Scoring</span></div></div><button className="btn primary" style={{width:'100%',marginTop:18}} onClick={()=>setOpen(true)}>+ Add report</button></div>
  <div className="panel"><div className="panelhead"><h2>Report workflow</h2><span className="badge">Structured</span></div><p className="muted">Fixture → Player → 1–4 observations → Something special? → Evidence → Submit. Scores represent frequency of completion rather than a simple good/bad judgement.</p></div>
 </div>{message&&<div style={{marginTop:18}} className={message.includes('success')?'notice':'notice error'}>{message}</div>}
 {open&&<div className="overlay"><div className="modal"><h2>Add scouting report</h2><div className="formgrid">
 <div className="field"><label>Fixture</label><select value={form.fixture_id} onChange={e=>setForm({...form,fixture_id:e.target.value})}><option value="">No fixture selected</option>{fixtures.map(f=><option key={f.id} value={f.id}>{f.fixture_reference||f.fixture_date} · {f.home_team} v {f.away_team}</option>)}</select></div>
 <div className="field"><label>Player</label><select value={form.player_id} onChange={e=>setForm({...form,player_id:e.target.value})}><option value="">Select player</option>{players.map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
 <div className="field full"><label>Scout</label><select value={form.scout_id} onChange={e=>setForm({...form,scout_id:e.target.value})}><option value="">Select scout</option>{profiles.map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
 <ScoreField label="Overall score" keyName="score"/><ScoreField label="Technical" keyName="technical"/><ScoreField label="Tactical" keyName="tactical"/><ScoreField label="Physical" keyName="physical"/><ScoreField label="Mentality" keyName="mentality"/>
 <div className="field"><label>Did the player show something special?</label><select value={form.special} onChange={e=>setForm({...form,special:e.target.value})}><option value="">Select...</option><option value="yes">Yes</option><option value="no">No</option></select></div>
 <div className="field full"><label>Strengths / evidence</label><textarea value={form.strengths} onChange={e=>setForm({...form,strengths:e.target.value})}/></div>
 <div className="field full"><label>Development areas</label><textarea value={form.development} onChange={e=>setForm({...form,development:e.target.value})}/></div>
 </div><div className="actions"><button className="btn secondary" onClick={()=>setOpen(false)}>Cancel</button><button className="btn primary" onClick={submit}>Submit report</button></div></div></div>}
 </>
}
