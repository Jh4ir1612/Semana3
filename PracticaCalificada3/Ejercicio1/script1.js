    const colores = ["#FF6666", "#66FF66", "#6666FF", "#FFFF66", "#FF66FF"];
    let elementos = [];
    let elementosVisibles = [];
    let seleccionado = null;

    const canvas = document.getElementById("ruleta");
    const ctx = canvas.getContext("2d");
    const textarea = document.getElementById("texto-elementos");
    const respuesta = document.getElementById("respuesta");

    function actualizarElementos() {
      elementos = textarea.value.split("\n").filter(e => e.trim() !== "");
      elementosVisibles = elementos.map((el, i) => !elementosVisibles[i] ? true : elementosVisibles[i]);
      dibujarRuleta();
    }

    function dibujarRuleta() {
      const total = elementos.length;
      const angulo = (2 * Math.PI) / total;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar la ruleta
      elementos.forEach((elemento, i) => {
        if (!elementosVisibles[i]) return;

        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.fillStyle = colores[i % colores.length];
        ctx.arc(200, 200, 180, i * angulo, (i + 1) * angulo);
        ctx.fill();

        ctx.save();
        ctx.translate(200, 200);
        ctx.rotate((i + 0.5) * angulo);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = "16px Arial";
        ctx.fillText(elemento, 170, 5);
        ctx.restore();
      });

      // Dibujar flecha indicadora (triángulo rojo)
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.moveTo(200, 10);
      ctx.lineTo(190, 30);
      ctx.lineTo(210, 30);
      ctx.fill();
    }

    function girarRuleta() {
      const disponibles = elementos.map((el, i) => elementosVisibles[i] ? i : -1).filter(i => i !== -1);
      if (disponibles.length === 0) return;

      const indexSeleccionado = disponibles[Math.floor(Math.random() * disponibles.length)];
      seleccionado = indexSeleccionado;

      // Calcular la rotación necesaria para que el elemento seleccionado quede bajo la flecha
      const anguloPorElemento = (2 * Math.PI) / elementos.length;
      // La flecha está en la posición -90 grados (arriba), por eso ajustamos con Math.PI/2
      const anguloObjetivo = (3 * Math.PI / 2) - (indexSeleccionado * anguloPorElemento + anguloPorElemento/2);
      const rotacionTotal = anguloObjetivo + (10 * 2 * Math.PI); // rotación completa + aleatorio

      let pasos = 60;
      let pasoActual = 0;

      function animar() {
        pasoActual++;
        const progreso = pasoActual / pasos;
        const anguloActual = progreso * rotacionTotal;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar la ruleta rotada
        ctx.translate(200, 200);
        ctx.rotate(anguloActual);
        ctx.translate(-200, -200);
        
        // Volver a dibujar la ruleta en la posición rotada
        const total = elementos.length;
        const angulo = (2 * Math.PI) / total;
        
        elementos.forEach((elemento, i) => {
          if (!elementosVisibles[i]) return;

          ctx.beginPath();
          ctx.moveTo(200, 200);
          ctx.fillStyle = colores[i % colores.length];
          ctx.arc(200, 200, 180, i * angulo, (i + 1) * angulo);
          ctx.fill();

          ctx.save();
          ctx.translate(200, 200);
          ctx.rotate((i + 0.5) * angulo);
          ctx.textAlign = "right";
          ctx.fillStyle = "#000";
          ctx.font = "16px Arial";
          ctx.fillText(elemento, 170, 5);
          ctx.restore();
        });

        ctx.restore();

        // Dibujar flecha indicadora (siempre en la misma posición)
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.moveTo(200, 10);
        ctx.lineTo(190, 30);
        ctx.lineTo(210, 30);
        ctx.fill();

        if (pasoActual < pasos) {
          requestAnimationFrame(animar);
        } else {
          respuesta.textContent = elementos[indexSeleccionado];
        }
      }

      animar();
    }

    function ocultarSeleccionado() {
      if (seleccionado !== null) {
        elementosVisibles[seleccionado] = false;
        const lineas = textarea.value.split("\n");
        lineas[seleccionado] = lineas[seleccionado].padStart(lineas[seleccionado].length + 2, ""); // Espacios visibles
        textarea.value = lineas.map((linea, i) => i === seleccionado ? `>> ${linea}` : linea).join("\n");
        dibujarRuleta();
      }
    }

    function reiniciar() {
      elementosVisibles = elementos.map(() => true);
      textarea.value = elementos.join("\n");
      dibujarRuleta();
      respuesta.textContent = "RESPUESTA";
    }

    function pantallaCompleta() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    }

    // Eventos
    textarea.addEventListener("input", actualizarElementos);
    textarea.addEventListener("click", () => textarea.removeAttribute("readonly"));
    document.getElementById("btn-iniciar").addEventListener("click", girarRuleta);
    document.getElementById("btn-reiniciar").addEventListener("click", reiniciar);
    canvas.addEventListener("click", girarRuleta);

    document.addEventListener("keydown", e => {
      switch (e.code) {
        case "Space":
          e.preventDefault();
          girarRuleta();
          break;
        case "KeyS":
          ocultarSeleccionado();
          break;
        case "KeyR":
          reiniciar();
          break;
        case "KeyF":
          pantallaCompleta();
          break;
        case "KeyE":
          textarea.removeAttribute("readonly");
          break;
      }
    });

    // Inicializar
    actualizarElementos();