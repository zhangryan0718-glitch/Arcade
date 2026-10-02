const STORAGE_KEY = 'pixel-quest-state';
const motivations = ['Small quests. Big momentum.', 'You are closer than you think.', 'One clear at a time.', 'The next level is yours.', 'Momentum looks good on you.'];
let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || { tasks: [], score: 0, streak: 0, lastClear: null };
let selectedId = null;
let activeFilter = 'all';
const $ = (id) => document.getElementById(id);

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function visibleTasks(){ return state.tasks.filter(t => activeFilter === 'all' || (activeFilter === 'done' ? t.done : !t.done)); }
function render(){
  const active = state.tasks.filter(t=>!t.done).length, done = state.tasks.filter(t=>t.done).length;
  $('taskCount').textContent = active; $('allCount').textContent = state.tasks.length; $('activeCount').textContent = active; $('doneCount').textContent = done;
  $('clearedStat').textContent = done; $('xpStat').textContent = String(state.score).padStart(4,'0'); $('highScore').textContent = String(state.score * 100).padStart(6,'0'); $('streakStat').textContent = state.streak;
  const list = $('taskList'), tasks = visibleTasks(); list.innerHTML = '';
  $('emptyState').style.display = tasks.length ? 'none' : 'block';
  tasks.forEach(task => { const item = document.createElement('div'); item.className = `task ${task.done ? 'is-done' : ''}`; item.innerHTML = `<button class="task-check" aria-label="${task.done?'Reopen':'Complete'} ${escapeHtml(task.text)}" data-action="toggle" data-id="${task.id}"></button><span class="task-title">${escapeHtml(task.text)}</span><button class="task-delete" aria-label="Delete task" data-action="delete" data-id="${task.id}">×</button>`; list.appendChild(item); });
  if(selectedId){ const selected=state.tasks.find(t=>t.id===selectedId); if(selected && !selected.done){ $('selectedTaskText').textContent=selected.text; $('completeButton').disabled=false; } else { selectedId=null; resetSelected(); } }
  $('motivation').textContent = motivations[done % motivations.length];
}
function escapeHtml(text){ const div=document.createElement('div'); div.textContent=text; return div.innerHTML; }
function resetSelected(){ $('selectedTaskText').textContent='No quest selected yet'; $('completeButton').disabled=true; }
function toast(message){ const el=$('toast'); el.textContent=message; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2600); }
function addTask(text){ state.tasks.unshift({id: Date.now().toString(), text:text.trim(), done:false}); save(); render(); toast('QUEST ADDED TO THE BOARD ✦'); }
function updateStreak(){ const today = new Date().toDateString(); if(state.lastClear !== today){ state.streak += 1; state.lastClear=today; } }
function completeTask(id){ const task=state.tasks.find(t=>t.id===id); if(!task || task.done) return; task.done=true; state.score += 1; updateStreak(); selectedId=null; save(); render(); toast('QUEST CLEARED! +100 XP ✦'); }

$('taskForm').addEventListener('submit', e=>{ e.preventDefault(); const input=$('taskInput'); if(input.value.trim()){ addTask(input.value); input.value=''; input.focus(); }});
$('taskList').addEventListener('click', e=>{ const button=e.target.closest('button'); if(!button)return; const id=button.dataset.id, task=state.tasks.find(t=>t.id===id); if(button.dataset.action==='toggle'){ if(task.done){task.done=false; save(); render();} else completeTask(id); } if(button.dataset.action==='delete'){state.tasks=state.tasks.filter(t=>t.id!==id); if(selectedId===id){selectedId=null;resetSelected();} save();render();} });
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));button.classList.add('active');activeFilter=button.dataset.filter;render();}));
$('spinButton').addEventListener('click',()=>{ const available=state.tasks.filter(t=>!t.done); if(!available.length){toast('ADD A QUEST TO START PLAYING');$('taskInput').focus();return;} const cabinet=document.querySelector('.cabinet'); cabinet.classList.add('is-spinning'); $('spinButton').disabled=true; let ticks=0; const timer=setInterval(()=>{ const random=available[Math.floor(Math.random()*available.length)]; $('selectedTaskText').textContent=random.text; if(++ticks>12){clearInterval(timer);selectedId=random.id;cabinet.classList.remove('is-spinning');$('spinButton').disabled=false;render();toast('QUEST LOCKED IN — GO GET IT ✦');}},90); });
$('completeButton').addEventListener('click',()=>completeTask(selectedId));
render();
