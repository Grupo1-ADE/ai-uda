// foro.js

// Utilidad para formatear timestamps de forma relativa
function timeAgo(date) {
    const diff = Date.now() - date;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `Hace ${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `Hace ${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `Hace ${hr}h`;
    const d = Math.floor(hr / 24);
    return `Hace ${d}d`;
  }
  
  function initForo() {
    // ——— HILOS PRECARGADOS ———
    let allThreads = [
      {
        id: 't1',
        user: 'alumno1',
        ts: Date.now() - 3600_000, // hace 1h
        title: '¿Alguien puede explicar el funcionamiento de la instrucción JAL en RISC-V?',
        messages: [
          {
            user: 'alumno1',
            text: 'Estoy perdido con el offset de 20 bits.',
            ts: Date.now() - 3500_000,
            likes: 0,
            reactions: {}
          },
          {
            user: 'yo',
            text: 'Básicamente JAL concatena el PC alto con el offset y salta allí.',
            ts: Date.now() - 3400_000,
            likes: 0,
            reactions: {}
          }
        ]
      },
      {
        id: 't2',
        user: 'estudianteX',
        ts: Date.now() - 7200_000, // hace 2h
        title: 'Buenas prácticas para nombrar variables en JavaScript',
        messages: [
          {
            user: 'estudianteX',
            text: 'Yo sigo camelCase pero ¿qué opinan de snake_case?',
            ts: Date.now() - 7100_000,
            likes: 0,
            reactions: {}
          }
        ]
      },
      {
        id: 't3',
        user: 'compa2',
        ts: Date.now() - 10_800_000, // hace 3h
        title: '¿Por qué usar const en lugar de let?',
        messages: [
          {
            user: 'compa2',
            text: 'Const evita reasignaciones accidentales.',
            ts: Date.now() - 10_500_000,
            likes: 0,
            reactions: {}
          }
        ]
      }
    ];
    // ————————————————
  
    let visibleThreads = [];
    const pageSize = 3;
    let page = 0;
  
    // Guardar última lectura para badges de no leído
    const lastRead = JSON.parse(localStorage.getItem('lastRead') || '{}');
  
    // Referencias al DOM
    const refs = {
      btnToggle: document.getElementById('btnToggleNew'),
      formDiv: document.getElementById('newThreadForm'),
      btnCreate: document.getElementById('btnCreateThread'),
      inputTitle: document.getElementById('threadTitle'),
      inputContent: document.getElementById('threadContent'),
      searchInput: document.getElementById('searchInput'),
      filterSelect: document.getElementById('filterSelect'),
      threadsList: document.getElementById('threadsList'),
      btnLoadMore: document.getElementById('btnLoadMore'),
      threadContainer: document.getElementById('threadMessagesContainer'),
      dmSelect: document.getElementById('dmSelect'),
      dmInput: document.getElementById('dmInput'),
      btnSendDM: document.getElementById('btnSendDM'),
      dmMessages: document.getElementById('dmMessages'),
      toast: document.getElementById('toast')
    };
  
    // Mostrar toast de feedback
    function showToast(msg) {
      refs.toast.textContent = msg;
      refs.toast.classList.add('show');
      setTimeout(() => refs.toast.classList.remove('show'), 2000);
    }
  
    // Crear avatar con iniciales
    function makeAvatar(name) {
      return `<div class="avatar">${name.slice(1, 3).toUpperCase()}</div>`;
    }
  
    // Renderizar markdown básico (**negrita**)
    function mdToHtml(txt) {
      return txt.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    }
  
    // Mostrar skeletons en lista de hilos
    function showThreadsSkeleton() {
      refs.threadsList.innerHTML = '';
      for (let i = 0; i < pageSize; i++) {
        const sk = document.createElement('li');
        sk.innerHTML = `<div class="skeleton skeleton-thread"></div>`;
        refs.threadsList.appendChild(sk);
      }
    }
  
    // Mostrar skeletons al abrir hilo
    function showMsgsSkeleton(id) {
      const pane = document.getElementById(`thread-${id}`);
      pane.classList.add('active');
      pane.innerHTML = '';
      for (let i = 0; i < 2; i++) {
        const sk = document.createElement('div');
        sk.className = 'skeleton skeleton-msg';
        pane.appendChild(sk);
      }
    }
  
    // Aplicar filtros y búsqueda
    function applyFilters() {
      let arr = allThreads;
      const q = refs.searchInput.value.toLowerCase();
      if (q) arr = arr.filter(t => t.title.toLowerCase().includes(q));
      if (refs.filterSelect.value === 'mine') arr = arr.filter(t => t.user === 'yo');
      visibleThreads = arr;
      page = 0;
      loadAndRenderThreads();
    }
  
    // Cargar + renderizar con skeleton
    function loadAndRenderThreads() {
      showThreadsSkeleton();
      setTimeout(renderThreads, 1000);
    }
  
    // Renderizar la lista de hilos
    function renderThreads() {
      refs.threadsList.innerHTML = '';
      const start = page * pageSize;
      const slice = visibleThreads.slice(start, start + pageSize);
      slice.forEach(t => {
        const unreadClass = (!lastRead[t.id] || t.ts > lastRead[t.id]) ? ' unread' : '';
        const li = document.createElement('li');
        li.className = unreadClass;
        li.innerHTML = `
          <div class="thread-info">
            ${makeAvatar(t.user)}
            <div class="thread-text">
              <div class="thread-title">${t.title}</div>
              <div class="thread-meta">@${t.user} · ${t.messages.length} respuestas · ${timeAgo(t.ts)}</div>
            </div>
          </div>
          <div class="thread-actions">
            <button onclick="showThread('${t.id}')">Responder</button>
          </div>`;
        refs.threadsList.appendChild(li);
  
        // Prepara panel de mensajes si no existe
        let pane = document.getElementById(`thread-${t.id}`);
        if (!pane) {
          pane = document.createElement('div');
          pane.id = `thread-${t.id}`;
          pane.className = 'thread-messages';
          refs.threadContainer.appendChild(pane);
        }
      });
  
      refs.btnLoadMore.style.display = (page + 1) * pageSize < visibleThreads.length
        ? 'block' : 'none';
    }
  
    // Paginación
    refs.btnLoadMore.onclick = () => { page++; loadAndRenderThreads(); };
  
    // Filtrado en tiempo real
    refs.searchInput.oninput = applyFilters;
    refs.filterSelect.onchange = applyFilters;
  
    // Toggle del formulario de nuevo hilo
    refs.btnToggle.onclick = () => {
      refs.formDiv.style.display = refs.formDiv.style.display === 'flex' ? 'none' : 'flex';
    };
  
    // Crear nuevo hilo
    refs.btnCreate.onclick = () => {
      const title = refs.inputTitle.value.trim();
      const content = refs.inputContent.value.trim();
      if (!title || !content) return;
      const id = Date.now().toString();
      allThreads.unshift({
        id,
        user: 'yo',
        ts: Date.now(),
        title,
        messages: [{ user:'yo', text:content, ts:Date.now(), likes:0, reactions:{} }]
      });
      refs.inputTitle.value = '';
      refs.inputContent.value = '';
      lastRead[id] = Date.now();
      localStorage.setItem('lastRead', JSON.stringify(lastRead));
      showToast('Hilo publicado');
      refs.formDiv.style.display = 'none';
      applyFilters();
      showThread(id);
    };
  
    // Mostrar hilo y sus mensajes
    window.showThread = id => {
      showMsgsSkeleton(id);
      setTimeout(() => {
        const t = allThreads.find(x => x.id === id);
        const pane = document.getElementById(`thread-${id}`);
        pane.innerHTML = `
          <div class="thread-header">
            <h4>${t.title}</h4>
            <div class="thread-meta">@${t.user} · ${t.messages.length} respuestas · ${timeAgo(t.ts)}</div>
          </div>
          ${t.messages.map((m, i) => `
            <div class="message" data-thread="${id}" data-idx="${i}">
              <strong>@${m.user}</strong>
              <div>${mdToHtml(m.text)}</div>
              <div class="thread-meta">${timeAgo(m.ts)}</div>
              <div class="actions">
                <button onclick="likeMsg('${id}',${i})">❤️ ${m.likes}</button>
              </div>
              <div class="reactions">
                😊 <span onclick="react('${id}',${i},'😊')">${m.reactions['😊']||0}</span>
                🎉 <span onclick="react('${id}',${i},'🎉')">${m.reactions['🎉']||0}</span>
                👍 <span onclick="react('${id}',${i},'👍')">${m.reactions['👍']||0}</span>
              </div>
            </div>
          `).join('')}
          <form id="form-${id}">
            <input type="text" id="reply-${id}" placeholder="Tu respuesta…"/>
            <button type="submit">Enviar</button>
          </form>`;
        pane.querySelector(`#form-${id}`).onsubmit = e => {
          e.preventDefault();
          const txt = document.getElementById(`reply-${id}`).value.trim();
          if (!txt) return;
          t.messages.push({ user:'yo', text:txt, ts:Date.now(), likes:0, reactions:{} });
          t.ts = Date.now();
          lastRead[id] = Date.now();
          localStorage.setItem('lastRead', JSON.stringify(lastRead));
          showToast('Respuesta enviada');
          applyFilters();
          showThread(id);
        };
      }, 1000);
    };
  
    // “Me gusta”
    window.likeMsg = (tid, idx) => {
      const t = allThreads.find(x => x.id === tid);
      t.messages[idx].likes++;
      showToast('Te gusta este mensaje');
      showThread(tid);
    };
  
    // Reacciones rápidas
    window.react = (tid, idx, emoji) => {
      const m = allThreads.find(x => x.id === tid).messages[idx];
      m.reactions[emoji] = (m.reactions[emoji] || 0) + 1;
      showThread(tid);
    };
  
    // DM (sin cambios)
    const dms = [{ to:'alumno1', text:'¡Ey! ¿Revisaste el ejercicio 3?', ts:Date.now() - 600_000 }];
    refs.btnSendDM.onclick = () => {
      const txt = refs.dmInput.value.trim();
      if (!txt) return;
      dms.unshift({ to: refs.dmSelect.value, text: txt, ts: Date.now() });
      refs.dmInput.value = '';
      showToast('DM enviado');
      refs.dmMessages.innerHTML = dms
        .map(d => `<div class="dm"><strong>@${d.to}</strong> ${d.text} <span style="color:#aaa;font-size:.8rem;">${timeAgo(d.ts)}</span></div>`)
        .join('');
    };
  
    // Inicialización
    applyFilters();
    refs.dmMessages.innerHTML = dms
      .map(d => `<div class="dm"><strong>@${d.to}</strong> ${d.text} <span style="color:#aaa;font-size:.8rem;">${timeAgo(d.ts)}</span></div>`)
      .join('');
  }
  
  // Exponer initForo
  window.initForo = initForo;
  