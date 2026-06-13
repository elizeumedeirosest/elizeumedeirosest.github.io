/* ══════════════════════════════════════
   portfolio.js — Elizeu Medeiros
══════════════════════════════════════ */

/* ── DARK MODE ── */
(function(){
  var body = document.body;
  var btn  = document.getElementById('dmToggle');
  if(!btn) return;
  try{ if(localStorage.getItem('em-dark')==='1') body.classList.add('dark'); }catch(e){}
  btn.addEventListener('click', function(){
    btn.classList.add('rotating');
    var on = body.classList.toggle('dark');
    try{ localStorage.setItem('em-dark', on?'1':'0'); }catch(e){}
    setTimeout(function(){ btn.classList.remove('rotating'); }, 340);
  });
})();

/* ── PROGRESS BAR ── */
(function(){
  var p = document.getElementById('prog');
  if(!p) return;
  window.addEventListener('scroll', function(){
    p.style.width=(scrollY/(document.body.scrollHeight-innerHeight)*100)+'%';
  },{passive:true});
})();

/* ── NAV ── */
(function(){
  var nav=document.getElementById('nav');
  if(!nav) return;
  var lastY=0, hidden=false;
  nav.style.transition='transform .35s cubic-bezier(.4,0,.2,1),background .3s,box-shadow .3s';
  window.addEventListener('scroll',function(){
    var y=window.scrollY;
    if(y<80){ nav.style.transform='translateY(0)'; nav.classList.remove('scrolled'); hidden=false; }
    else {
      nav.classList.add('scrolled');
      if(y>lastY+8&&!hidden){ nav.style.transform='translateY(-100%)'; hidden=true; }
      else if(y<lastY-8&&hidden){ nav.style.transform='translateY(0)'; hidden=false; }
    }
    lastY=y;
  },{passive:true});
})();

/* ── HAMBURGER ── */
(function(){
  var ham=document.getElementById('ham'), nl=document.getElementById('navLinks');
  if(!ham||!nl) return;
  var open=false;
  ham.addEventListener('click',function(){
    open=!open;
    nl.style.cssText=open
      ?'display:flex;flex-direction:column;position:fixed;top:66px;left:0;right:0;background:rgba(255,255,255,.97);backdrop-filter:blur(20px);padding:2rem;gap:1.5rem;border-bottom:1px solid #e2e8f0;z-index:599;box-shadow:0 8px 24px rgba(0,0,0,.07)'
      :'';
  });
})();

/* ── REVEAL ── */
(function(){
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){e.target.classList.add('on');obs.unobserve(e.target);} });
  },{threshold:0.04,rootMargin:'0px 0px -30px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
  document.querySelectorAll('.pcard,.pub-item,.sk-card').forEach(function(el,i){
    el.style.transitionDelay=(i%3)*65+'ms';
    el.classList.add('reveal');
    obs.observe(el);
  });
})();

/* ── SKILL BARS ── */
(function(){
  var bars=document.getElementById('skillBars');
  if(!bars) return;
  var animated=false;
  function animate(){
    if(animated) return; animated=true;
    bars.querySelectorAll('.skill-bar-fill').forEach(function(f){
      f.style.width=f.getAttribute('data-w')+'%';
    });
  }
  new IntersectionObserver(function(e){ if(e[0].isIntersecting) animate(); },{threshold:0.2}).observe(bars);
})();

/* ══════════════════════════════════════
   MODAL
   Recebe o caminho COMPLETO com extensão.
   ex: openFileModal('projetos/projeto1.html', 'Título')
       openFileModal('certificados/cert1.pdf', 'Título')
       openFileModal('imagem/foto.png', 'Foto')
══════════════════════════════════════ */
(function(){
  var overlay   = document.getElementById('fileModal');
  var iframe    = document.getElementById('modalIframe');
  var closeBtn  = document.getElementById('modalClose');
  var titleEl   = document.getElementById('modalTitle');
  var loading   = document.getElementById('modalLoading');
  var errorBox  = document.getElementById('modalError');
  var errorPath = document.getElementById('modalErrorPath');
  if(!overlay||!iframe||!closeBtn) return;

  /* ── Abre o modal com o arquivo ── */
  window.openFileModal = function(src, label){
    var isPdf = /\.pdf$/i.test(src);
    var isImg = /\.(png|jpe?g|gif|webp|svg)$/i.test(src);

    titleEl.textContent = label || src;
    loading.classList.remove('hidden');
    errorBox.classList.remove('show');
    iframe.style.display = 'block';
    hideFallback();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    if(isPdf && window.location.protocol === 'file:'){
      /* PDFs em file:// são bloqueados no iframe pelo browser —
         exibe botão elegante para abrir em nova aba */
      loading.classList.add('hidden');
      iframe.style.display = 'none';
      showPdfFallback(src, label);
      return;
    }

    /* Todos os outros casos: carrega direto no iframe */
    loadIframe(src);
  };

  /* ── Carrega no iframe ── */
  function loadIframe(src){
    var timer = setTimeout(function(){ showError(src); }, 9000);
    iframe.onload = function(){
      clearTimeout(timer);
      setTimeout(function(){ loading.classList.add('hidden'); }, 140);
    };
    iframe.onerror = function(){
      clearTimeout(timer);
      showError(src);
    };
    /* PDF em HTTP: parâmetros para ocupar 100% sem barra extra */
    iframe.src = /\.pdf$/i.test(src) ? src + '#toolbar=0&view=FitH' : src;
  }

  /* ── Fallback visual para PDF em file:// ── */
  function showPdfFallback(src, label){
    var fb = document.getElementById('modalPdfFallback');
    if(!fb){
      fb = document.createElement('div');
      fb.id = 'modalPdfFallback';
      fb.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.25rem;background:var(--off);padding:2rem;text-align:center;z-index:3;';
      document.querySelector('.modal-body').appendChild(fb);
    }
    fb.style.display = 'flex';
    fb.innerHTML =
      '<div style="width:56px;height:56px;border-radius:16px;background:var(--blue-lt);display:flex;align-items:center;justify-content:center;">'
      +'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
      +'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>'
      +'<polyline points="14 2 14 8 20 8"/>'
      +'<line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>'
      +'</svg></div>'
      +'<p style="font-family:var(--serif);font-size:1.1rem;font-weight:700;color:var(--ink)">'+( label||'Documento PDF' )+'</p>'
      +'<p style="font-size:.8rem;color:var(--muted);max-width:34ch;line-height:1.7">'
      +'Navegadores bloqueiam PDFs locais no popup por segurança.<br>'
      +'Clique abaixo para visualizar em uma nova aba.</p>'
      +'<a href="'+src+'" target="_blank" rel="noopener" '
      +'style="display:inline-flex;align-items:center;gap:.55rem;padding:.75rem 1.6rem;background:var(--blue);color:#fff;border-radius:9px;font-size:.8rem;font-weight:700;letter-spacing:.05em;text-decoration:none;box-shadow:0 4px 16px rgba(26,58,255,.3);">'
      +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg>'
      +'Abrir PDF</a>';
  }

  function hideFallback(){
    var fb = document.getElementById('modalPdfFallback');
    if(fb) fb.style.display = 'none';
  }

  function showError(src){
    loading.classList.add('hidden');
    iframe.style.display = 'none';
    if(errorPath) errorPath.textContent = src;
    errorBox.classList.add('show');
  }

  /* ── Fecha ── */
  function closeModal(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function(){
      iframe.src = 'about:blank';
      iframe.style.display = 'block';
      errorBox.classList.remove('show');
      loading.classList.remove('hidden');
      hideFallback();
    }, 380);
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e){ if(e.target===overlay) closeModal(); });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape' && overlay.classList.contains('open')) closeModal();
  });
})();
