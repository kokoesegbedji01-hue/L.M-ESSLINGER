const root = document.documentElement;
const saved = localStorage.getItem('theme') || 'light';
root.dataset.theme = saved;

function syncSwitches(isDark){
  document.querySelectorAll('.switch').forEach(sw=>{
    sw.classList.toggle('on', isDark);
    sw.setAttribute('aria-pressed', String(isDark));
  });
}
syncSwitches(saved === 'dark');

function setCurrentDateLabels(){
  const now = new Date();
  const label = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  document.querySelectorAll('[data-current-date]').forEach(el=>{
    el.textContent = `Updated ${label}`;
  });
}


document.querySelectorAll('.switch').forEach(sw=>{
  sw.addEventListener('click',()=>{
    const isDark = root.dataset.theme !== 'dark';
    root.dataset.theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    syncSwitches(isDark);
  });
});

function countElement(el, target, suffix='', duration=1300){
  if(el.dataset.animated === 'true') return;
  el.dataset.animated = 'true';
  const start = performance.now();
  function tick(now){
    const p = Math.min((now-start)/duration,1);
    const eased = p < .5 ? 4*p*p*p : 1 - Math.pow(-2*p + 2, 3)/2;
    el.textContent = Math.round(target*eased) + suffix;
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function animateCounters(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    countElement(el, Number(el.dataset.count), el.dataset.suffix || '', 1400);
    el.closest('.metric')?.classList.add('is-visible');
  });
}

function animateBars(){
  document.querySelectorAll('.fill').forEach(f=>{
    const v = f.dataset.value || 0;
    f.style.width = '0%';
    setTimeout(()=>{ f.style.width = v + '%'; }, 120);
  });
  document.querySelectorAll('.skill-value').forEach(val=>{
    const text = val.textContent.trim();
    const num = parseInt(text,10);
    if(!Number.isNaN(num)){
      val.textContent = '0%';
      val.classList.add('counting');
      val.dataset.animated = 'false';
      countElement(val, num, '%', 1050);
      setTimeout(()=>val.classList.remove('counting'),1150);
    }
  });
  document.querySelectorAll('.col span').forEach((c,i)=>{
    c.style.transform = 'scaleY(0)';
    setTimeout(()=>{ c.style.transform = 'scaleY(1)'; }, 160 + i*70);
  });
}

const skillSets = {
  overview:[['Quality Assurance',99],['SAR Writing',98],['AML Investigations',97],['KYC / EDD',95],['Compliance Remediation',95],['OFAC / Sanctions',92],['Fraud Investigations',90],['Enterprise Support',90]],
  investigations:[['AML Investigations',98],['SAR Decisioning',98],['Fraud Investigations',94],['Transaction Monitoring',92],['Case Reviews',95],['314(b) Collaboration',88]],
  regulatory:[['BSA / AML',98],['OFAC',94],['KYC / EDD',96],['CTR / SAR',95],['Audit Readiness',97],['Procedure Review',92]],
  leadership:[['QA Leadership',99],['Project Manager Mentoring',93],['Training Delivery',92],['Key Client Relationships',90],['Enterprise Support',91],['Cross-functional Remediation',94]],
  technology:[['ACL Analytics',82],['SQL',78],['Case Management Tools',90],['QA Testing Protocols',94],['Reporting Dashboards',84],['Process Optimization',91]]
};

function renderDynamicSkills(type){
  const box = document.querySelector('#dynamicSkills');
  if(!box || !skillSets[type]) return;
  box.innerHTML = skillSets[type].map(([name,val])=>`<div class="skill"><div class="skill-name">${name}</div><div class="bar"><div class="fill" data-value="${val}"></div></div><div class="skill-value">${val}%</div></div>`).join('');
  setTimeout(animateBars,40);
}

document.querySelectorAll('.filter').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderDynamicSkills(btn.dataset.filter);
    const label = document.querySelector('#focusLabel');
    if(label) label.textContent = btn.textContent;
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.screen-overlay');
function closeMenu(){ sidebar?.classList.remove('open'); overlay?.classList.remove('show'); }
menuToggle?.addEventListener('click',()=>{ sidebar?.classList.add('open'); overlay?.classList.add('show'); });
overlay?.addEventListener('click', closeMenu);
document.querySelectorAll('.sidebar .nav a').forEach(a=>a.addEventListener('click', closeMenu));
window.addEventListener('resize',()=>{ if(window.innerWidth > 1024) closeMenu(); });

const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      if(entry.target.matches('.metric')){
        const n = entry.target.querySelector('[data-count]');
        if(n) countElement(n, Number(n.dataset.count), n.dataset.suffix || '', 1400);
      }
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.25}) : null;
document.querySelectorAll('.metric,.card,.panel').forEach(el=>revealObserver?.observe(el));


setCurrentDateLabels();
animateCounters();
animateBars();
renderDynamicSkills('overview');

// Profile view mode: dashboard <-> traditional portfolio
const savedView = localStorage.getItem('profileView') || 'dashboard';
root.dataset.view = savedView;
function syncViewControls(view){
  document.querySelectorAll('[data-view-option]').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.viewOption === view);
    btn.setAttribute('aria-pressed', String(btn.dataset.viewOption === view));
  });
  document.querySelectorAll('[data-view-toggle]').forEach(btn=>{
    btn.textContent = view === 'dashboard' ? 'Portfolio' : 'Dashboard';
    btn.setAttribute('aria-label', view === 'dashboard' ? 'Switch to portfolio view' : 'Switch to dashboard view');
  });
}
function setProfileView(view){
  root.dataset.view = view;
  localStorage.setItem('profileView', view);
  syncViewControls(view);
  closeMenu();
}
document.querySelectorAll('[data-view-option]').forEach(btn=>{
  btn.addEventListener('click',()=> setProfileView(btn.dataset.viewOption));
});
document.querySelectorAll('[data-view-toggle]').forEach(btn=>{
  btn.addEventListener('click',()=> setProfileView(root.dataset.view === 'dashboard' ? 'portfolio' : 'dashboard'));
});
syncViewControls(savedView);
