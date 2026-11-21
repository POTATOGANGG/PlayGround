const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
let page='HOME', restrictedUnlocked=false, activeTool='', category='All', searchQuery='', settingsTab='AI Provider';
const config={endpoint:localStorage.getItem('karma-endpoint')||'',model:localStorage.getItem('karma-model')||'',key:'',imageEndpoint:localStorage.getItem('karma-image-endpoint')||''};
const view=$('#view');
const escapeHtml=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const toast=text=>{const r=$('#toast-root');r.innerHTML=`<div class="toast">${escapeHtml(text)}</div>`;setTimeout(()=>r.innerHTML='',2600)};
const tools=[
['chat','AI Chat','Conversational assistant','AI'],['writer','Writing Studio','Rewrite and shape text','Create'],['summarizer','Smart Summarizer','Condense long material','AI'],['brainstorm','Brainstormer','Generate fresh ideas','Create'],['code','Code Explainer','Understand code clearly','AI'],['image','Image Studio','Generate visual concepts','Create'],['wordcount','Word Counter','Count words and characters','Local'],['readtime','Reading Time','Estimate reading duration','Local'],['keywords','Keyword Extractor','Find recurring terms','Local'],['case','Case Converter','Transform text casing','Local'],['focus','Focus Timer','Run a 25-minute timer','Local'],['planner','Day Planner','Build a simple task plan','Local']
].map(([id,name,desc,type])=>({id,name,desc,type}));

function setPage(next){page=next;render();}
function navInit(){ $$('[data-nav]').forEach(b=>b.onclick=()=>setPage(b.dataset.nav)); $('#restricted-trigger').onclick=openSecurity; $('#notifications').onclick=()=>toast('You are all caught up.'); $('#profile-menu').onclick=()=>showSettings('Workspace'); }
function closeModal(){ $('#modal-root').innerHTML='' }
function showSettings(tab='AI Provider'){settingsTab=tab;setPage('SETTINGS')}

function homePage(){return `<section class="hero"><div class="hero-copy"><div class="eyebrow">KARMA AI WORKSPACE</div><h1>Intelligence,<br><em>in motion.</em></h1><p>Build, create, and think with a focused suite of AI and local productivity tools.</p><div class="hero-cta"><button class="btn btn-primary" data-go="AI LAB">OPEN AI LAB ↗</button><button class="btn" data-go="TOOLS">EXPLORE TOOLS</button></div></div><div class="hero-meta"><span>WORKSPACE</span><b>PERSONAL / 01</b></div></section><div class="stats-grid"><div class="stat-card"><span>AVAILABLE TOOLS</span><b class="stat-value">12</b><small>AI + local</small></div><div class="stat-card"><span>ACTIVE STATE</span><b class="stat-value">${restrictedUnlocked?'OPEN':'SECURE'}</b><small>${restrictedUnlocked?'Advanced available':'Identity protected'}</small></div><div class="stat-card"><span>PROVIDER</span><b class="stat-value">${config.endpoint?'LIVE':'READY'}</b><small>${config.endpoint?'Connected':'Configure in settings'}</small></div></div><div class="section-head"><h2>Quick launch</h2><button class="text-button" data-go="TOOLS">View all tools ↗</button></div><div class="tool-grid">${tools.slice(0,4).map(t=>`<button class="tool-card" data-tool="${t.id}"><span class="tool-icon">${t.type==='Local'?'◈':t.type==='Create'?'⌁':'✳'}</span><b>${t.name}</b><p>${t.desc}</p><span class="tool-arrow">↗</span></button>`).join('')}</div>`}
function toolsPage(){const filtered=tools.filter(t=>(category==='All'||t.type===category)&&(`${t.name} ${t.desc}`.toLowerCase().includes(searchQuery.toLowerCase())));return `<div class="page-heading"><div><div class="eyebrow">KARMA WORKSPACE / TOOL LIBRARY</div><h1>Tools</h1><p>Choose an assistant or utility for the work at hand.</p></div><div class="search-box"><input id="tool-search" value="${escapeHtml(searchQuery)}" placeholder="Search tools"><span>⌕</span></div></div><div class="category-row">${['All','AI','Create','Local'].map(c=>`<button class="category ${category===c?'active':''}" data-category="${c}">${c}</button>`).join('')}</div><div class="all-tools-grid">${filtered.map(t=>`<button class="tool-card" data-tool="${t.id}"><span class="tool-icon">${t.type==='Local'?'◈':t.type==='Create'?'⌁':'✳'}</span><b>${t.name}</b><p>${t.desc}</p><small>${t.type==='Local'?'RUNS OFFLINE':t.type}</small><span class="tool-arrow">↗</span></button>`).join('')}</div>${activeTool?toolLayout(activeTool):''}`}
function labPage(){return `<div class="page-heading"><div><div class="eyebrow">KARMA WORKSPACE / AI LAB</div><h1>AI Lab</h1><p>Direct access to connected generative services.</p></div></div><div class="all-tools-grid">${tools.filter(t=>t.type==='AI'||t.type==='Create').map(t=>`<button class="tool-card" data-tool="${t.id}"><span class="tool-icon">✳</span><b>${t.name}</b><p>${t.desc}</p><span class="tool-arrow">↗</span></button>`).join('')}</div>`}
function createPage(){return `<div class="page-heading"><div><div class="eyebrow">KARMA WORKSPACE / CREATE</div><h1>Create studio</h1><p>Shape ideas into words, concepts, code, and visuals.</p></div></div><div class="create-grid">${tools.filter(t=>t.type==='Create'||t.type==='AI').map(t=>`<button class="create-card" data-tool="${t.id}"><span class="tool-icon">${t.type==='Create'?'⌁':'✳'}</span><h3>${t.name}</h3><p>${t.desc}</p><span>Open studio ↗</span></button>`).join('')}</div>`}

function toolLayout(id){const t=tools.find(x=>x.id===id);if(!t)return '';const local=t.type==='Local';return `<div class="tool-layout"><div class="tool-form"><div class="eyebrow">${escapeHtml(t.type.toUpperCase())} TOOL</div><h2>${t.name}</h2><p>${t.desc}</p>${local?localToolFields(id):aiToolFields(id)}</div><div class="result-panel"><div class="eyebrow">OUTPUT</div><div id="tool-output" class="tool-output">Your result will appear here.</div></div></div>`}
function aiToolFields(id){const multiline=['chat','writer','summarizer','brainstorm','code','image'].includes(id);return `${multiline?'<label class="eyebrow" for="tool-input">YOUR INPUT</label><textarea id="tool-input" class="textarea" placeholder="Enter your prompt or source material..."></textarea>':''}<div class="form-row"><div><label class="eyebrow">TONE</label><select id="tool-tone" class="field"><option>Clear</option><option>Professional</option><option>Creative</option><option>Concise</option></select></div><div><label class="eyebrow">DETAIL</label><select id="tool-detail" class="field"><option>Balanced</option><option>Brief</option><option>Detailed</option></select></div></div><button class="btn btn-primary" id="tool-run">Run ${id==='image'?'image':'tool'} ↗</button>`}
function localToolFields(id){if(id==='focus')return '<div class="timer"><span id="timer-value">25:00</span><button class="btn btn-primary" id="timer-toggle">Start timer</button></div>';if(id==='planner')return '<label class="eyebrow" for="tool-input">TODAY’S TASKS</label><textarea id="tool-input" class="textarea" placeholder="Write one task per line..."></textarea><button class="btn btn-primary" id="tool-run">Build plan</button>';if(id==='case')return '<label class="eyebrow" for="tool-input">TEXT</label><textarea id="tool-input" class="textarea"></textarea><select id="tool-case" class="field"><option>UPPERCASE</option><option>lowercase</option><option>Title Case</option></select><button class="btn btn-primary" id="tool-run">Convert</button>';return '<label class="eyebrow" for="tool-input">TEXT</label><textarea id="tool-input" class="textarea" placeholder="Paste text here..."></textarea><button class="btn btn-primary" id="tool-run">Analyze</button>'}

function bindCards(){ $$('[data-tool]').forEach(b=>b.onclick=()=>{activeTool=b.dataset.tool;if(page==='TOOLS')render();else setPage('TOOLS')}); $$('[data-go]').forEach(b=>b.onclick=()=>setPage(b.dataset.go)); }
function bindTool(id){
 if($('#tool-search')) $('#tool-search').oninput=e=>{searchQuery=e.target.value;render()};
 $$('[data-category]').forEach(b=>b.onclick=()=>{category=b.dataset.category;render()});
 const run=$('#tool-run');if(run)run.onclick=()=>runLocalOrProvider(id);
 if(id==='focus')bindTimer();
}
function runLocalOrProvider(id){const input=$('#tool-input')?.value?.trim()||'';const out=$('#tool-output');
 if(id==='wordcount'){const words=input.match(/\b\S+\b/g)||[];out.textContent=`Words: ${words.length}\nCharacters: ${input.length}\nCharacters (no spaces): ${input.replace(/\s/g,'').length}`;return}
 if(id==='readtime'){const w=(input.match(/\b\S+\b/g)||[]).length;out.textContent=`Estimated reading time: ${(w/200).toFixed(1)} minutes\nBased on 200 words per minute.`;return}
 if(id==='keywords'){const freq={};input.toLowerCase().replace(/[^a-z0-Z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>4).forEach(w=>freq[w]=(freq[w]||0)+1);out.textContent=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([w,n])=>`${w} — ${n}`).join('\n')||'Add longer words to extract keywords.';return}
 if(id==='case'){const mode=$('#tool-case').value;if(mode==='UPPERCASE')out.textContent=input.toUpperCase();else if(mode==='lowercase')out.textContent=input.toLowerCase();else out.textContent=input.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());return}
 if(id==='planner'){out.textContent=input.split('\n').map((x,i)=>x.trim()?`${i+1}. ${x.trim()}\n   Focus block: 25 min`:'').filter(Boolean).join('\n')||'Add tasks to build a plan.';return}
 providerRun(id,input,out)
}
async function providerRun(id, input, out) {
  if (!input) { out.textContent = 'Add input first.'; return; }
  if (!config.endpoint || !config.model || !config.key) {
    out.textContent = 'AI provider not configured. Open Settings to add an endpoint, model, and API key.';
    return;
  }
  out.textContent = 'Generating…';
  try {
    const tool = tools.find(x => x.id === id);
    const tone = $('#tool-tone')?.value || 'Clear';
    const detail = $('#tool-detail')?.value || 'Balanced';
    if (id === 'image') {
      const response = await fetch(config.imageEndpoint || config.endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}`},
        body: JSON.stringify({model: config.model, prompt: input, n: 1, size: '1024x1024'})
      });
      if (!response.ok) throw Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      const imageUrl = data.data?.[0]?.url;
      if (data.data?.[0]?.b64_json) out.innerHTML = `<img alt="Generated result" src="data:image/png;base64,${data.data[0].b64_json}">`;
      else if (imageUrl) out.innerHTML = `<img alt="Generated result" src="${escapeHtml(imageUrl)}">`;
      else out.textContent = JSON.stringify(data, null, 2);
    } else {
      const response = await fetch(`${config.endpoint.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}`},
        body: JSON.stringify({
          model: config.model,
          messages: [
            {role: 'system', content: `You are ${tool?.name || 'a helpful assistant'}. Respond in a ${tone.toLowerCase()}, ${detail.toLowerCase()} style.`},
            {role: 'user', content: input}
          ],
          temperature: 0.7
        })
      });
      if (!response.ok) throw Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      out.textContent = data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2);
    }
  } catch (error) {
    out.textContent = `Provider error: ${error.message}`;
  }
}

let timerSeconds=1500,timerHandle=null;function bindTimer(){const b=$('#timer-toggle'),v=$('#timer-value');if(!b)return;b.onclick=()=>{if(timerHandle){clearInterval(timerHandle);timerHandle=null;b.textContent='Resume timer'}else{b.textContent='Pause timer';timerHandle=setInterval(()=>{timerSeconds--;const m=String(Math.floor(timerSeconds/60)).padStart(2,'0'),s=String(timerSeconds%60).padStart(2,'0');v.textContent=`${m}:${s}`;if(timerSeconds<=0){clearInterval(timerHandle);timerHandle=null;b.textContent='Start timer';toast('Focus session complete.')}},1000)}}}

function settingsPage(){return `<div class="page-heading"><div><div class="eyebrow">KARMA WORKSPACE / PREFERENCES</div><h1>Settings</h1><p>Configure provider access and workspace preferences.</p></div></div><div class="settings-layout"><aside class="settings-menu">${['AI Provider','Workspace','Privacy'].map(t=>`<button class="${settingsTab===t?'active':''}" data-setting="${t}">${t}</button>`).join('')}</aside><div class="settings-content">${settingsTab==='AI Provider'?providerSettings():settingsTab==='Workspace'?workspaceSettings():privacySettings()}</div></div>`}
function providerSettings(){return `<h2>AI Provider</h2><p>Use an OpenAI-compatible chat endpoint.</p><label class="eyebrow">CHAT BASE / ENDPOINT</label><input id="setting-endpoint" class="field" value="${escapeHtml(config.endpoint)}" placeholder="https://api.example.com/v1"><label class="eyebrow">MODEL</label><input id="setting-model" class="field" value="${escapeHtml(config.model)}" placeholder="model-name"><label class="eyebrow">API KEY</label><input id="setting-key" type="password" class="field" placeholder="Enter key for this tab"><label class="eyebrow">IMAGE ENDPOINT (OPTIONAL)</label><input id="setting-image" class="field" value="${escapeHtml(config.imageEndpoint)}" placeholder="https://api.example.com/v1/images/generations"><button class="btn btn-primary" id="save-provider">Save provider settings</button><div class="security-status" id="provider-status">Keys remain in tab memory and are cleared on reload.</div>`}
function workspaceSettings(){return `<h2>Workspace</h2><p>Personalize your session.</p><label class="toggle-row"><span><b>Reduce motion</b><small>Limit interface animation</small></span><input id="reduce-motion" type="checkbox" ${document.body.classList.contains('reduce-motion')?'checked':''}></label>`}
function privacySettings(){return `<h2>Privacy</h2><p>Provider requests are made only after you run an AI tool. API keys are not persisted. Local tools work entirely in your browser.</p><button class="btn" id="clear-local">Clear stored provider preferences</button>`}
function bindSettings(){ $$('[data-setting]').forEach(b=>b.onclick=()=>{settingsTab=b.dataset.setting;render()}); const save=$('#save-provider');if(save)save.onclick=()=>{config.endpoint=$('#setting-endpoint').value.trim().replace(/\/$/,'');config.model=$('#setting-model').value.trim();config.key=$('#setting-key').value.trim();config.imageEndpoint=$('#setting-image').value.trim();localStorage.setItem('karma-endpoint',config.endpoint);localStorage.setItem('karma-model',config.model);localStorage.setItem('karma-image-endpoint',config.imageEndpoint);$('#provider-status').textContent=config.endpoint&&config.model&&config.key?'Provider settings saved for this tab.':'Preferences saved. Add an API key to enable requests.';$('#provider-status').className='security-status granted'};const motion=$('#reduce-motion');if(motion)motion.onchange=()=>{document.body.classList.toggle('reduce-motion',motion.checked);localStorage.setItem('karma-motion',motion.checked?'1':'0')};const clear=$('#clear-local');if(clear)clear.onclick=()=>{['karma-endpoint','karma-model','karma-image-endpoint'].forEach(k=>localStorage.removeItem(k));config.endpoint=config.model=config.imageEndpoint='';toast('Stored provider preferences cleared.')}}

function openSecurity(){if(restrictedUnlocked){setPage('RESTRICTED');return}const root=$('#modal-root');root.innerHTML=`<div class="modal-backdrop" id="security-backdrop"><div class="modal" id="security-modal"><div class="security-mark">▣</div><div class="eyebrow">KARMA SECURITY PROTOCOL / 01</div><h2>Restricted access</h2><p>Identity verification is required to access the protected workspace.</p><form id="security-form"><label class="eyebrow" for="access-code">ACCESS CREDENTIAL</label><input id="access-code" class="field key-input" type="password" autocomplete="off" placeholder="Enter access credential"><div id="security-status" class="security-status">SECURE CHANNEL READY</div><button class="btn btn-primary" style="width:100%" type="submit">UNLOCK ↗</button></form></div></div>`;$('#security-backdrop').onclick=e=>{if(e.target.id==='security-backdrop')closeModal()};$('#security-form').onsubmit=e=>{e.preventDefault();const input=$('#access-code'),status=$('#security-status');if(input.value.trim().toUpperCase()==='CARMA'){restrictedUnlocked=true;status.textContent='ACCESS GRANTED';status.className='security-status granted';$('#security-modal').classList.add('modal-success');setTimeout(()=>{closeModal();setPage('RESTRICTED');toast('Access granted. Secure workspace unlocked.')},700)}else{status.textContent='ACCESS DENIED';status.className='security-status denied';input.value='';input.focus()}}}
function restrictedPage(){if(!restrictedUnlocked)return `<div class="page-heading"><div><div class="eyebrow">KARMA WORKSPACE / SECURE ZONE</div><h1>Restricted tools are locked</h1><p>Verify access to open this separate workspace.</p></div></div><div class="restricted-head"><div><h2>Protected workspace</h2><p>Advanced features remain inaccessible until security verification succeeds.</p></div><button class="btn btn-primary" id="verify-again">Verify access ↗</button></div>`;const cards=[['workflow','Workflow Composer','Build a guided plan for a multi-step project.'],['synthesis','Knowledge Synthesis','Organize notes into themes and questions.'],['strategy','Scenario Planner','Compare options and state assumptions.']];return `<div class="page-heading"><div><div class="eyebrow">KARMA WORKSPACE / SECURE ZONE</div><h1>Advanced workspace</h1><p>Exclusive tools for complex work, with you in control.</p></div><button class="btn" id="lock-system">▣ &nbsp; LOCK SYSTEM</button></div><div class="restricted-head"><div><h2>Access granted</h2><p>Restricted workspace is unlocked for this tab.</p></div><span class="restricted-badge">● VERIFIED SESSION</span></div><div class="restricted-grid">${cards.map(([id,name,desc])=>`<div class="restricted-card"><span class="tool-icon">✳</span><h3>${name}</h3><p>${desc}</p><button class="btn btn-small" data-advanced="${id}">Open tool ↗</button></div>`).join('')}</div>`}
function lockSystem(){restrictedUnlocked=false;setPage('HOME');toast('Restricted tools are locked.')}
function openAdvanced(id){if(!restrictedUnlocked)return;const meta={workflow:'Workflow Composer',synthesis:'Knowledge Synthesis',strategy:'Scenario Planner'};const root=$('#modal-root');root.innerHTML=`<div class="modal-backdrop" id="advanced-backdrop"><div class="modal wide"><div class="modal-top"><div><div class="eyebrow">RESTRICTED WORKSPACE</div><h2>${meta[id]}</h2></div><button class="modal-close">×</button></div><label class="eyebrow">YOUR INPUT</label><textarea id="advanced-input" class="textarea"></textarea><div id="advanced-status" class="security-status">Provider requests are made only when you click Generate.</div><div class="modal-actions"><button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="advanced-run">Generate draft ↗</button></div></div></div>`;$$('.modal-close,[data-close]').forEach(b=>b.onclick=closeModal);$('#advanced-backdrop').onclick=e=>{if(e.target.id==='advanced-backdrop')closeModal()};$('#advanced-run').onclick=()=>providerRun(id,$('#advanced-input').value.trim(),$('#advanced-status'))}

function bindRestricted(){const v=$('#verify-again');if(v)v.onclick=openSecurity;const l=$('#lock-system');if(l)l.onclick=lockSystem;$$('[data-advanced]').forEach(b=>b.onclick=()=>openAdvanced(b.dataset.advanced))}
function render(){ $('#current-section').textContent=page==='HOME'?'OVERVIEW':page;$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav===page));view.innerHTML=page==='HOME'?homePage():page==='TOOLS'?toolsPage():page==='AI LAB'?labPage():page==='CREATE'?createPage():page==='SETTINGS'?settingsPage():page==='RESTRICTED'?restrictedPage():homePage();bindCards();if(page==='TOOLS')bindTool(activeTool);if(page==='SETTINGS')bindSettings();if(page==='RESTRICTED')bindRestricted();}

navInit();render();if(localStorage.getItem('karma-motion')==='1')document.body.classList.add('reduce-motion');
