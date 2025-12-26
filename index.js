// Minimal interactive JS: reveal on scroll, animated counters, CTA micro-interactions
(function(){
  'use strict';

  function qs(sel, ctx){ return (ctx||document).querySelector(sel); }
  function qsa(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  // reveal elements on scroll
  const revealables = qsa('.reveal');
  function reveal(){
    const y = window.innerHeight;
    revealables.forEach(el=>{
      const r = el.getBoundingClientRect();
      if(r.top < y - 80) el.classList.add('in');
    });
  }
  document.addEventListener('scroll', reveal, {passive:true});
  window.addEventListener('load', reveal);
  window.addEventListener('resize', reveal);

  // counters
  function animateCounters(){
    qsa('.stat-value').forEach(el=>{
      if(el.dataset.animated) return;
      const rect = el.getBoundingClientRect();
      if(rect.top < window.innerHeight - 60){
        el.dataset.animated = '1';
        const target = parseInt(el.getAttribute('data-target')||0,10);
        let start = 0;
        const duration = 1400;
        const step = (timestamp)=>{
          start += Math.ceil(target/30);
          if(start >= target) { el.textContent = target; return; }
          el.textContent = start;
          setTimeout(step, duration/30);
        };
        step();
      }
    });
  }
  window.addEventListener('scroll', animateCounters, {passive:true});
  window.addEventListener('load', animateCounters);

  // CTA micro-interactions
  const browseBtn = qs('#browse-btn');
  const joinBtn = qs('#join-btn');
  if(browseBtn) browseBtn.addEventListener('mouseenter', ()=>browseBtn.classList.add('hover'));
  if(browseBtn) browseBtn.addEventListener('mouseleave', ()=>browseBtn.classList.remove('hover'));
  if(joinBtn) joinBtn.addEventListener('click', ()=>{
    joinBtn.classList.add('pulse');
    setTimeout(()=>joinBtn.classList.remove('pulse'),600);
  });

})();
