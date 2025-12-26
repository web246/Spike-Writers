// DB client with Supabase support and a local demo fallback.
// Behavior:
// - If `window.APP_CONFIG` contains `SUPABASE_URL` and `SUPABASE_ANON_KEY`, the client
//   will load the Supabase JS client via CDN and connect to your Supabase project.
// - Otherwise it falls back to a small in-memory demo DB with minimal query() support.

(function(){
  var DB = { ready: null, mode: 'demo' };

  function loadScript(src){
    return new Promise(function(resolve, reject){
      var s = document.createElement('script'); s.src = src; s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
    });
  }

  function initDemo(){
    DB.mode = 'demo';
    DB._data = {
      users: [
        {id:1,email:'admin@example.com',name:'Site Admin',role:'admin',joined_at:'2025-01-01',active:1},
        {id:2,email:'client@example.com',name:'Client One',role:'client',joined_at:'2025-06-01',active:1},
        {id:3,email:'writer@example.com',name:'Writer One',role:'writer',joined_at:'2025-07-15',active:1}
      ],
      testimonials: [ {id:1,writer_id:3,name:'Jane Doe',message:'Great service!',rating:5,is_approved:1,created_at:'2025-12-01'} ],
      projects: [],
      bids: []
    };
    // Load persisted demo data from localStorage if present
    (function(){
      try{
        var stored = localStorage.getItem('spark_demo_db');
        if(stored){
          var parsed = JSON.parse(stored);
          if(parsed && typeof parsed === 'object'){
            // shallow merge keys
            Object.keys(parsed).forEach(function(k){ DB._data[k] = parsed[k]; });
          }
        }
      }catch(e){ console.warn('Unable to load demo DB from localStorage', e); }
    })();

    DB.ready = Promise.resolve();
    DB.query = function(sql, params){
      // very small convenience: support SELECT * FROM testimonials WHERE is_approved=1
      try{
        if(/FROM testimonials/i.test(sql)){
          return DB._data.testimonials.filter(function(t){ return t.is_approved==1; });
        }
        if(/FROM users/i.test(sql)){
          return DB._data.users.slice();
        }
      }catch(e){ console.error(e); }
      return [];
    };
    // persistence helpers for demo
    function saveDemo(){ try{ localStorage.setItem('spark_demo_db', JSON.stringify(DB._data)); }catch(e){ console.warn('Failed to save demo DB', e); } }
    DB.exportJSON = function(){ return JSON.stringify(DB._data); };
    DB.importJSON = function(json){ try{ var p = (typeof json==='string')? JSON.parse(json): json; if(p && typeof p==='object'){ DB._data = p; saveDemo(); return Promise.resolve(DB._data); } return Promise.reject('Invalid JSON'); }catch(e){ return Promise.reject(e); } };
    DB.clearDemo = function(){
      DB._data = { users: [], testimonials: [] };
      saveDemo();
      // After clearing, ensure admin account exists so admin pages and tests still work
      return seedAdmin().then(function(){ saveDemo(); return Promise.resolve(); });
    };

    DB.getUsers = function(){ return Promise.resolve(DB._data.users.slice()); };
    DB.updateUser = function(id, patch){
      var u = DB._data.users.find(function(x){return x.id==id;}); if(!u) return Promise.reject('not found'); Object.assign(u, patch); saveDemo(); return Promise.resolve(u);
    };
    // projects + bids + reviews helpers for demo
    DB.getProjects = function(){ return Promise.resolve((DB._data.projects||[]).slice().reverse()); };
    DB.createProject = function(p){ if(!p || !p.title) return Promise.reject('title required'); var id = (DB._data.projects.reduce(function(m,r){return Math.max(m,r.id||0);},0)||0)+1; var proj = Object.assign({ id:id, title:p.title, desc:p.desc||'', client_email:p.client_email||'', created_at:(new Date()).toISOString().slice(0,10), status:'open' }, p); DB._data.projects.push(proj); saveDemo(); return Promise.resolve(proj); };
    DB.getBids = function(projectId){ return Promise.resolve((DB._data.bids||[]).filter(function(b){ return String(b.project_id) === String(projectId); })); };
    DB.createBid = function(b){ if(!b || !b.project_id) return Promise.reject('project_id required'); var id = (DB._data.bids.reduce(function(m,r){return Math.max(m,r.id||0);},0)||0)+1; var nb = Object.assign({ id:id, project_id:b.project_id, writer_id:b.writer_id, amount:b.amount||0, message:b.message||'', created_at:(new Date()).toISOString().slice(0,10) }, b); DB._data.bids.push(nb); saveDemo(); return Promise.resolve(nb); };
    DB.getReviews = function(writerId){ return Promise.resolve((DB._data.testimonials||[]).filter(function(t){ return String(t.writer_id) === String(writerId); })); };
    DB.createReview = function(r){ if(!r || !r.writer_id) return Promise.reject('writer_id required'); var id = (DB._data.testimonials.reduce(function(m,u){return Math.max(m,u.id||0);},0)||0)+1; var rev = Object.assign({ id:id, writer_id:r.writer_id, name:r.name||'', message:r.message||'', rating:r.rating||5, is_approved:0, created_at:(new Date()).toISOString().slice(0,10) }, r); DB._data.testimonials.push(rev); saveDemo(); return Promise.resolve(rev); };
    // compute average rating for a writer (approved reviews only)
    DB.getWriterAvgRating = function(writerId){
      return DB.getReviews(writerId).then(function(revs){
        var approved = (revs||[]).filter(function(r){ return r.is_approved==1; });
        var count = approved.length || 0;
        var sum = 0;
        for(var i=0;i<approved.length;i++){ sum += Number(approved[i].rating)||0; }
        var avg = count ? Math.round((sum/count)*10)/10 : 0;
        return Promise.resolve({ avg: avg, count: count });
      });
    };
    DB.createUser = function(data){
      // simple uniqueness check on email
      if(!data || !data.email) return Promise.reject('email required');
      var exists = DB._data.users.find(function(u){ return u.email===data.email; });
      if(exists) return Promise.reject('email exists');
      var id = (DB._data.users.reduce(function(m,u){return Math.max(m,u.id||0);},0) || 0) + 1;
      var user = { id: id, email: data.email, name: data.name||'', role: data.role||'client', joined_at: (new Date()).toISOString().slice(0,10), active: (data.active===undefined?1: (data.active?1:0)) };
      if(data.password) user.password = data.password;
      DB._data.users.push(user);
      saveDemo();
      return Promise.resolve(user);
    };
    // Auth wrapper for demo mode
    DB.auth = {
      signUp: function(opts){
        return DB.createUser({ email: opts.email, name: opts.name, role: opts.role, password: opts.password, active: opts.role==='writer'?0:1 });
      },
      signIn: function(opts){
        return new Promise(function(resolve, reject){
          var u = DB._data.users.find(function(x){ return x.email===opts.email; });
          if(!u) return reject(new Error('User not found'));
          if(u.password && opts.password !== u.password) return reject(new Error('Incorrect password'));
          resolve(u);
        });
      },
      signOut: function(){ return Promise.resolve(); }
    };

    // Reusable admin seeding helper so admin survives a clear/reset
    function seedAdmin(){
      try{
        var adminEmail = 'websitesbrian585@gmail.com';
        var exists = DB._data.users.find(function(u){ return u.email===adminEmail; });
        if(!exists){
          return DB.createUser({ email: adminEmail, name: 'Brian Webs', role: 'admin', password: '123456', active: 1 }).then(function(){
            console.log('Seeded demo admin:', adminEmail);
            return true;
          }).catch(function(e){ console.warn('Admin seed failed', e); return false; });
        }
        return Promise.resolve(false);
      }catch(e){ console.warn('Admin seed error', e); return Promise.resolve(false); }
    }
    // call it once on init
    seedAdmin().catch(function(){ /* ignore errors */ });
    return DB;
  }

  function initSupabase(cfg){
    DB.mode = 'supabase';
    DB.ready = loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js').then(function(){
      try{
        var supa = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
        DB.supa = supa;
        // convenience wrappers
        DB.query = function(sql){
          // For now, run simple SELECT helper via RPC is not available, so keep minimal
          console.warn('Use specific helpers instead of raw SQL with Supabase client.');
          return Promise.resolve([]);
        };
        DB.getUsers = function(){
          return supa.from('users').select('id,email,name,role,joined_at,active').order('joined_at', {ascending:false}).then(function(r){ if(r.error) return Promise.reject(r.error); return r.data; });
        };
        DB.updateUser = function(id, patch){
          return supa.from('users').update(patch).eq('id', id).then(function(r){ if(r.error) return Promise.reject(r.error); return r.data && r.data[0]; });
        };
        DB.createUser = function(data){ return supa.from('users').insert([data]).then(function(r){ if(r.error) return Promise.reject(r.error); return r.data && r.data[0]; }); };

        // Projects, bids and reviews wrappers for Supabase
        DB.getProjects = function(){ return supa.from('projects').select('*').order('created_at',{ascending:false}).then(function(r){ if(r.error) return Promise.reject(r.error); return r.data; }); };
        DB.createProject = function(p){ return supa.from('projects').insert([p]).then(function(r){ if(r.error) return Promise.reject(r.error); return r.data && r.data[0]; }); };
        DB.getBids = function(projectId){ return supa.from('bids').select('*').eq('project_id', projectId).then(function(r){ if(r.error) return Promise.reject(r.error); return r.data; }); };
        DB.createBid = function(b){ return supa.from('bids').insert([b]).then(function(r){ if(r.error) return Promise.reject(r.error); return r.data && r.data[0]; }); };
        DB.getReviews = function(writerId){ return supa.from('testimonials').select('*').eq('writer_id', writerId).then(function(r){ if(r.error) return Promise.reject(r.error); return r.data; }); };
        DB.createReview = function(r){ return supa.from('testimonials').insert([r]).then(function(rsp){ if(rsp.error) return Promise.reject(rsp.error); return rsp.data && rsp.data[0]; }); };

        // compute average rating for a writer (approved reviews only)
        DB.getWriterAvgRating = function(writerId){
          return DB.getReviews(writerId).then(function(revs){
            var approved = (revs||[]).filter(function(r){ return r.is_approved==1; });
            var count = approved.length || 0;
            var sum = 0;
            for(var i=0;i<approved.length;i++){ sum += Number(approved[i].rating)||0; }
            var avg = count ? Math.round((sum/count)*10)/10 : 0;
            return { avg: avg, count: count };
          });
        };

        // Auth wrapper using Supabase Auth + users table for profiles
        DB.auth = {
          signUp: function(opts){
            // opts: {email,password,name,role}
            return supa.auth.signUp({email:opts.email,password:opts.password}).then(function(res){
              if(res.error) return Promise.reject(res.error);
              // create profile row in users table
              var profile = { email: opts.email, name: opts.name||'', role: opts.role||'client', active: opts.role==='writer'?0:1, joined_at: (new Date()).toISOString().slice(0,10), auth_user_id: (res.data && res.data.user)? res.data.user.id : null };
              return supa.from('users').insert([profile]).then(function(r){ if(r.error) return Promise.reject(r.error); return { auth: res, profile: r.data && r.data[0] }; });
            });
          },
          signIn: function(opts){
            // opts: {email,password}
            return supa.auth.signInWithPassword({email:opts.email,password:opts.password}).then(function(res){ if(res.error) return Promise.reject(res.error); return res; });
          },
          signOut: function(){ return supa.auth.signOut(); },
          getUserProfileByEmail: function(email){ return supa.from('users').select('*').eq('email', email).limit(1).then(function(r){ if(r.error) return Promise.reject(r.error); return r.data && r.data[0]; }); }
        };
        return DB;
      }catch(e){ console.error(e); return Promise.reject(e); }
    });
    return DB;
  }

  // Initialization: check for config
  var cfg = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL && window.APP_CONFIG.SUPABASE_ANON_KEY) ? window.APP_CONFIG : null;
  if(cfg){
    initSupabase(cfg);
  } else {
    initDemo();
  }

  // expose
  window._DB = DB;
})();

