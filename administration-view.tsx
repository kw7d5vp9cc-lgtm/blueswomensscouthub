export function AdministrationView(){
 return <div className="grid grid2"><div className="panel"><div className="panelhead"><h2>Administration</h2></div><p className="muted">Manage users and access through Supabase Auth and the profiles table. Do not expose parent/guardian details in general scouting views.</p></div><div className="panel"><div className="panelhead"><h2>Data protection</h2></div><p className="muted">RLS remains enabled. Use the publishable browser key only; never put a service-role or secret key in NEXT_PUBLIC variables.</p></div></div>
}
