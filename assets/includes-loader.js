// Minimal includes loader: injects a header and footer for static preview
(function(){
  function buildNav(){
    var cu = null;
    try{ cu = JSON.parse(localStorage.getItem('currentUser')||'null'); }catch(e){ cu = null; }
    var left = '<a href="index.html" class="brand">Spark Writers</a>';
    var links = [];
    links.push('<a href="index.html">Home</a>');
    links.push('<a href="writers.html">Writers</a>');
    links.push('<a href="projects.html">Projects</a>');
    if(cu){
      // role specific nav
      var role = (cu.role||'').toLowerCase();
      if(role === 'admin'){
        links.push('<a href="dashboard.html">Admin</a>');
        links.push('<a href="#" id="logoutBtn">Logout</a>');
      } else if(role === 'client'){
        // client nav: Home, Writers, Profile, Logout
        links.push('<a href="index.html">Home</a>');
        links.push('<a href="clients_index.html">Writers</a>');
        links.push('<a href="profile-edit.html">Profile</a>');
        links.push('<a href="#" id="logoutBtn">Logout</a>');
      } else if(role === 'writer'){
        links.push('<a href="writers_index.html">My Dashboard</a>');
        links.push('<a href="projects.html">Projects</a>');
        links.push('<a href="profile-edit.html">Profile</a>');
        links.push('<a href="#" id="logoutBtn">Logout</a>');
      } else {
        links.push('<a href="#" id="logoutBtn">Logout</a>');
      }
    } else {
      links.push('<a href="login.html">Login</a>');
      links.push('<a href="register.html">Sign Up</a>');
    }
    return '<div class="container nav">'+left+'<nav>' + links.join(' ') + '</nav></div>';
  }

  function load(){
    var header = document.getElementById('site-header');
    if(header){ header.innerHTML = '<header class="site-header">'+buildNav()+'</header>'; }
    var footer = document.getElementById('site-footer');
    if(footer){ footer.innerHTML = '<footer class="site-footer"><div class="container"><p>&copy; '+new Date().getFullYear()+' Spark Writers</p></div></footer>'; }

    // attach logout handler
    var btn = document.getElementById('logoutBtn');
    if(btn){ btn.addEventListener('click', function(e){ e.preventDefault(); localStorage.removeItem('currentUser'); document.dispatchEvent(new Event('site:auth-changed')); location.href = 'index.html'; }); }
  }

  // update on auth changes
  document.addEventListener('site:auth-changed', function(){ load(); });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
