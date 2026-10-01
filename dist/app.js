const stage = document.querySelector('#stage');
const menu = document.querySelector('#floatingMenu');
const handles = document.querySelectorAll('.drag-handle');
const note = document.querySelector('#stageNote');
const reset = document.querySelector('#resetButton');
const sectionLinks = [...document.querySelectorAll('.menu-item[href^="#"]')];
let pos = { x: 24, y: 16 }; let dragging = false; let offset = { x: 0, y: 0 };
const MAGNET_RANGE = 76;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
function place(animate = false) { menu.style.transition = animate ? 'opacity .3s ease, transform .45s cubic-bezier(.2,.9,.2,1)' : 'opacity .3s ease'; menu.style.left = `${pos.x}px`; menu.style.top = `${pos.y}px`; }
function stageSize(){ return {w:window.innerWidth,h:window.innerHeight,mw:menu.offsetWidth,mh:menu.offsetHeight}; }
function nearestEdge(){ const {w,h,mw,mh}=stageSize(); const edges=[['left',pos.x],['right',w-(pos.x+mw)],['top',pos.y],['bottom',h-(pos.y+mh)]]; return edges.sort((a,b)=>a[1]-b[1])[0]; }
function setEdge(edge){ menu.classList.remove('edge-left','edge-right','edge-top','edge-bottom'); menu.classList.add(`edge-${edge}`); menu.classList.toggle('vertical', edge==='left'||edge==='right'); }
function snapTo(edge, animate){ setEdge(edge); const {w,h,mw,mh}=stageSize(); if(edge==='left')pos.x=16;if(edge==='right')pos.x=w-mw-16;if(edge==='top')pos.y=16;if(edge==='bottom')pos.y=h-mh-16; pos.x=clamp(pos.x,8,w-mw-8);pos.y=clamp(pos.y,8,h-mh-8); note.textContent=`Ancré à la fenêtre · ${{left:'Gauche',right:'Droite',top:'Haute',bottom:'Basse'}[edge]}`; place(animate); }
function anchor(){ snapTo(nearestEdge()[0],true); }
function start(event){ const r=menu.getBoundingClientRect(); dragging=true; menu.classList.add('dragging'); const point=event.touches?event.touches[0]:event; offset={x:point.clientX-r.left,y:point.clientY-r.top}; event.preventDefault(); }
function move(event){ if(!dragging)return; const point=event.touches?event.touches[0]:event, {w,h,mw,mh}=stageSize(); pos.x=clamp(point.clientX-offset.x,8,w-mw-8);pos.y=clamp(point.clientY-offset.y,8,h-mh-8); const [edge,distance]=nearestEdge(); if(distance<MAGNET_RANGE){ snapTo(edge,false); } else { place(); } }
function end(){if(!dragging)return;dragging=false;menu.classList.remove('dragging');anchor();}
handles.forEach(handle=>{handle.addEventListener('pointerdown',start);handle.addEventListener('touchstart',start,{passive:false})}); window.addEventListener('pointermove',move);window.addEventListener('pointerup',end);window.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',end);reset.addEventListener('click',()=>{const s=stageSize();setEdge('top');pos={x:(s.w-menu.offsetWidth)/2,y:16};note.textContent='Position initiale · Haut centré';place(true)});window.addEventListener('resize',()=>{const s=stageSize();pos.x=clamp(pos.x,8,s.w-s.mw-8);pos.y=clamp(pos.y,8,s.h-s.mh-8);place()});requestAnimationFrame(()=>{const s=stageSize();setEdge('top');pos={x:(s.w-menu.offsetWidth)/2,y:16};place()});
const sectionRatios = new Map();
const setActive = id => sectionLinks.forEach(link => { const active = (link.dataset.section || link.getAttribute('href')) === `#${id}`; link.classList.toggle('active', active); if(active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); link.tabIndex = active ? -1 : 0; });
const observer = new IntersectionObserver(entries => { entries.forEach(entry => sectionRatios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)); const active = [...sectionRatios.entries()].sort((a,b)=>b[1]-a[1])[0]; if(active?.[1] > 0) setActive(active[0]); }, { threshold:[.2,.45,.7] });
['accueil','demo','principes','api'].forEach(id => observer.observe(document.getElementById(id)));
let scrollTicking = false;
function syncActiveOnScroll(){ const middle = window.innerHeight / 2; const section = ['accueil','demo','principes','api'].map(id => document.getElementById(id)).sort((a,b) => Math.abs(a.getBoundingClientRect().top + a.offsetHeight / 2 - middle) - Math.abs(b.getBoundingClientRect().top + b.offsetHeight / 2 - middle))[0]; setActive(section.id); scrollTicking = false; }
window.addEventListener('scroll',()=>{ if(!scrollTicking){ scrollTicking=true; requestAnimationFrame(syncActiveOnScroll); } },{passive:true});
requestAnimationFrame(syncActiveOnScroll);
