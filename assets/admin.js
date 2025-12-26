// Admin UI helpers — requires `window._DB` to be initialized (Supabase or demo fallback)
(function(){
  function $(sel){return document.querySelector(sel);} 

  function renderUsers(users){
    var el = document.getElementById('admin-users'); if(!el) return;
    if(!users || users.length===0){ el.innerHTML = '<p class="muted">No users found.</p>'; return; }
    var rows = users.map(function(u){
      return '<tr data-id="'+u.id+'">'
        +'<td>'+u.id+'</td>'
        +'<td>'+(u.name||'')+'</td>'
        +'<td>'+(u.email||'')+'</td>'
        +'<td>'+(u.role||'')+'</td>'
        +'<td>'+(u.joined_at||'')+'</td>'
        +'<td>'+(u.active?'<span class="tag tag-success">Active</span>':'<span class="tag">Inactive</span>')+'</td>'
        +'<td><button class="btn small deactivate">'+(u.active?'Deactivate':'Activate')+'</button></td>'
      +'</tr>';
    }).join('');
    el.innerHTML = '<table class="striped"><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead><tbody>'+rows+'</tbody></table>';
    el.querySelectorAll('.deactivate').forEach(function(b){ b.addEventListener('click', onToggle); });
  }

  function onToggle(ev){
    var tr = ev.target.closest('tr'); var id = tr && tr.dataset.id; if(!id) return; id = parseInt(id,10);
    var activeCell = tr.children[5]; var currentlyActive = activeCell && activeCell.textContent.indexOf('Active')!==-1;
    var newVal = currentlyActive?0:1;
    ev.target.disabled = true; ev.target.textContent = 'Saving...';
    window._DB.updateUser(id, { active: newVal }).then(function(){
      return window._DB.getUsers();
    }).then(function(users){ renderUsers(users); }).catch(function(err){ console.error(err); alert('Error: '+(err.message||err)); }).finally(function(){ ev.target.disabled = false; });
  }

  function load(){
    if(!window._DB) return; window._DB.ready.then(function(){
      if(typeof window._DB.getUsers !== 'function') { console.warn('DB does not expose getUsers'); return; }
      window._DB.getUsers().then(function(users){ renderUsers(users); }).catch(function(err){ console.error(err); document.getElementById('admin-users').innerHTML = '<p class="muted">Unable to load users.</p>'; });
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
