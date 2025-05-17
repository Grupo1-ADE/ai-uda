// tutor.js

function initTutorIA() {
  const chat = document.getElementById('chat');
  const input = document.getElementById('inputMensaje');

  function enviarBurbuja(texto, tipo, claseExtra = '') {
    const burbuja = document.createElement('div');
    burbuja.textContent = texto;

    // Añadimos la clase correcta para que CSS gestione colores y posición
    burbuja.classList.add(tipo === 'user' ? 'user-bubble' : 'bot-bubble');
    if (claseExtra) burbuja.classList.add(claseExtra);

    // Animación de entrada
    burbuja.style.opacity = '0';
    burbuja.style.transform = 'translateY(10px)';
    burbuja.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    chat.appendChild(burbuja);
    chat.scrollTop = chat.scrollHeight;
    requestAnimationFrame(() => {
      burbuja.style.opacity = '1';
      burbuja.style.transform = 'translateY(0)';
    });
  }

  function enviarMensaje() {
    const mensaje = input.value.trim();
    if (!mensaje) return;

    enviarBurbuja(mensaje, 'user');
    input.value = '';

    const pensando = document.createElement('div');
    pensando.textContent = '...';

    // Usamos la clase .bot-thinking para tema y estilo
    pensando.classList.add('bot-thinking');

    chat.appendChild(pensando);
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
      pensando.remove();
      enviarBurbuja(generarRespuesta(mensaje), 'bot');
    }, 1200);
  }

  function generarRespuesta(mensaje) {
    const lower = mensaje.toLowerCase();
    if (lower.includes('hola')) return '¡Hola! ¿En qué puedo ayudarte hoy?';
    if (lower.includes('qué es un bucle'))
      return 'Un bucle es una estructura que repite un bloque de código mientras se cumpla una condición.';
    if (lower.includes('gracias')) return '¡De nada! 😊 Si tienes más dudas, aquí estaré.';
    if (lower.includes('cómo se declara una variable'))
      return 'Depende del lenguaje. En JavaScript, por ejemplo: `let x = 5;`';
    return 'Interesante pregunta. Déjame explicártelo... (respuesta simulada)';
  }

  function limpiarChat() {
    chat.innerHTML = '';
    enviarBurbuja('¡Hola! Soy tu tutor IA. ¿En qué puedo ayudarte hoy?', 'bot');
  }

  document.getElementById('formularioChat').addEventListener('submit', e => {
    e.preventDefault();
    enviarMensaje();
    input.focus();
    input.rows = 1;
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
      input.rows = 1;
    } else {
      input.rows = Math.min(6, input.value.split('\n').length);
    }
  });

  limpiarChat();
}

window.initTutorIA = initTutorIA;
