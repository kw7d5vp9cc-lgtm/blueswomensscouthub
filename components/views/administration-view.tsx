export function AdministrationView() {
  return (
    <div className="grid grid2">
      <div className="panel">
        <div className="panelhead">
          <h2>Administration</h2>
        </div>

        <p className="muted">
          Manage users and access through Supabase Auth and the
          profiles table.
        </p>

        <p className="muted">
          Player and scouting information should only be available
          to authorised users with the appropriate access level.
        </p>
      </div>

      <div className="panel">
        <div className="panelhead">
          <h2>Data protection</h2>
        </div>

        <p className="muted">
          Row Level Security remains enabled to protect academy and
          scouting data.
        </p>

        <p className="muted">
          Parent and guardian information is not displayed within
          general scouting views.
        </p>

        <p className="muted">
          Only the Supabase publishable browser key should be used
          by this application. Secret or service-role keys must
          never be exposed in the browser.
        </p>
      </div>
    </div>
  )
}
