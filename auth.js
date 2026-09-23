(() => {
  "use strict";

  const login = document.getElementById("zs-login");
  const form = document.getElementById("zs-login-form");
  const email = document.getElementById("zs-email");
  const password = document.getElementById("zs-password");
  const button = document.getElementById("zs-login-btn");
  const errorBox = document.getElementById("zs-login-error");
  const sessionBar = document.getElementById("zs-sesion");
  const userLabel = document.getElementById("zs-usuario");
  const logout = document.getElementById("zs-logout");
  const app = document.getElementById("contenedor");
  let panelInicio = null;
  let borradorDisponible = null;

  if (
    !window.supabase ||
    typeof SUPABASE_URL === "undefined" ||
    typeof SUPABASE_KEY === "undefined"
  ) {
    errorBox.textContent = "No se pudo conectar con el sistema.";
    return;
  }

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  window.zeroStockSupabase = client;
  window.zeroStockSession = null;
  window.zeroStockPerfil = null;

  // Evita que eventos de renovación de sesión reinicien la navegación.
  let usuarioAppCargado = null;
  let cargandoApp = false;

  function showLogin() {
    login.style.display = "flex";
    app.style.display = "none";
    if (panelInicio) panelInicio.style.display = "none";
    sessionBar.style.display = "none";
    userLabel.textContent = "";
    window.zeroStockSession = null;
    window.zeroStockPerfil = null;
  }

  async function showApp(session) {
    // Si Supabase solo renovó/confirmó la misma sesión, actualizamos la sesión
    // pero conservamos exactamente la pantalla en la que está la usuaria.
    if (usuarioAppCargado === session?.user?.id && window.zeroStockPerfil) {
      window.zeroStockSession = session;
      return;
    }
    if (cargandoApp) {
      window.zeroStockSession = session;
      return;
    }
    cargandoApp = true;

    login.style.display = "none";
    app.style.display = "none";
    sessionBar.style.display = "flex";
    errorBox.textContent = "";

    window.zeroStockSession = session;

    const { data: perfil, error } = await client
      .from("perfiles")
      .select("nombre, rol, activo")
      .eq("id", session.user.id)
      .single();

    if (error || !perfil) {
      console.error("No se pudo cargar el perfil:", error);
      userLabel.textContent = session?.user?.email || "";
      window.zeroStockPerfil = null;
      cargandoApp = false;
      return;
    }

    window.zeroStockPerfil = perfil;

    // El formulario antiguo sigue usando #distribuidor internamente.
    // Lo seleccionamos automáticamente según el perfil autenticado.
    const distribuidorEl = document.getElementById("distribuidor");
    const nombrePerfil = (perfil?.nombre || perfil?.nombre_completo || "").trim();
    if (distribuidorEl && nombrePerfil) {
      const normalizar = s => String(s || "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().trim();
      const objetivo = normalizar(nombrePerfil);
      // La cuenta operativa "Stock" corresponde al distribuidor histórico "Stock Rmc".
      // Mantenemos el nombre del selector porque otras partes del formulario/PDF lo usan.
      const objetivoDistribuidor = objetivo === "stock" ? "stock rmc" : objetivo;
      const opcion = Array.from(distribuidorEl.options).find(opt =>
        normalizar(opt.textContent) === objetivoDistribuidor
      );
      if (opcion) distribuidorEl.value = opcion.value;
    }
    userLabel.textContent = perfil.nombre;

    // Solo la primera carga real de la cuenta abre el menú principal.
    usuarioAppCargado = session.user.id;
    cargandoApp = false;
    setTimeout(() => {
      prepararInicioZeroStock();
    }, 0);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorBox.textContent = "";
    button.disabled = true;
    button.textContent = "Ingresando...";

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value
      });

      if (error) throw error;
      if (!data.session) throw new Error("No session");

      await showApp(data.session);
      password.value = "";

    } catch (err) {
      console.error(err);

      errorBox.textContent =
        err?.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : "No fue posible iniciar sesión. Inténtalo nuevamente.";

      showLogin();

    } finally {
      button.disabled = false;
      button.textContent = "Ingresar";
    }
  });

  logout.addEventListener("click", async () => {
    usuarioAppCargado = null;
    cargandoApp = false;
    await client.auth.signOut();
    showLogin();
  });

  client.auth.onAuthStateChange((_event, session) => {
    if (session) {
      showApp(session);
    } else {
      showLogin();
    }
  });

  (async () => {
    const { data, error } = await client.auth.getSession();

    if (!error && data.session) {
      await showApp(data.session);
    } else {
      showLogin();
    }
  })();


  // =========================================================
  // NAVEGACIÓN PRINCIPAL DE ZEROSTOCK
  // =========================================================

  function crearPanelInicioSiHaceFalta() {
    if (panelInicio) return panelInicio;

    const estilos = document.createElement("style");
    estilos.textContent = `
      #zs-inicio { max-width:800px; margin:18px auto 30px; padding:34px 36px; box-sizing:border-box; background:#fff; border-radius:12px; box-shadow:0 0 12px rgba(0,0,0,.10); font-family:Arial,sans-serif; }
      #zs-inicio h1 { margin:0; text-align:center; color:#2c3e50; font-family:'Playfair Display',serif; font-size:30px; }
      #zs-inicio .zs-inicio-saludo { margin:8px 0 28px; text-align:center; color:#6b7280; font-size:14px; }
      .zs-inicio-opciones { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
      .zs-inicio-opcion { min-height:150px; padding:22px 18px; border:1px solid #e5e7eb; border-radius:12px; background:#fff; text-align:left; cursor:pointer; transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease; }
      .zs-inicio-opcion:hover:not(:disabled) { transform:translateY(-2px); border-color:#f8bbd0; box-shadow:0 8px 18px rgba(0,0,0,.08); }
      .zs-inicio-opcion:disabled { opacity:.48; cursor:default; }
      .zs-inicio-opcion strong { display:block; margin-bottom:9px; color:#ad1457; font-size:17px; }
      .zs-inicio-opcion span { color:#6b7280; font-size:13px; line-height:1.45; }
      .zs-inicio-estado { display:block; margin-top:10px; color:#374151!important; font-weight:700; }
      @media (max-width:700px) { #zs-inicio { margin:12px auto 24px; padding:26px 20px; } .zs-inicio-opciones { grid-template-columns:1fr; } .zs-inicio-opcion { min-height:auto; } }
    `;
    document.head.appendChild(estilos);

    panelInicio = document.createElement("section");
    panelInicio.id = "zs-inicio";
    panelInicio.innerHTML = `
      <h1>ZeroStock</h1>
      <p class="zs-inicio-saludo" id="zs-inicio-saludo"></p>
      <div class="zs-inicio-opciones">
        <button class="zs-inicio-opcion" id="zs-crear-informe" type="button"><strong>Crear informe</strong><span>Empieza un informe nuevo.</span></button>
        <button class="zs-inicio-opcion" id="zs-continuar-informe" type="button" disabled><strong>Informe en curso</strong><span>Continúa el informe que dejaste pendiente.</span><span class="zs-inicio-estado" id="zs-borrador-estado">Buscando informe en curso...</span></button>
        <button class="zs-inicio-opcion" id="zs-ver-informes" type="button" disabled><strong>Ver informes</strong><span>Consulta tus últimos informes finalizados.</span><span class="zs-inicio-estado">Próximamente</span></button>
      </div>`;
    sessionBar.insertAdjacentElement("afterend", panelInicio);

    // Regresa al menú principal sin borrar ni modificar el borrador.
    let volverInicio = document.getElementById("zs-volver-inicio");
    if (!volverInicio) {
      volverInicio = document.createElement("div");
      volverInicio.id = "zs-volver-inicio";
      volverInicio.innerHTML = '<button id="zs-volver-btn" type="button">← Volver al inicio</button>';
      sessionBar.insertAdjacentElement("afterend", volverInicio);
    }

    const volverBtn = volverInicio.querySelector("#zs-volver-btn") || volverInicio;
    if (!volverBtn.dataset.zsVolverConectado) {
      volverBtn.dataset.zsVolverConectado = "1";
      volverBtn.addEventListener("click", () => {
        app.style.display = "none";
        panelInicio.style.display = "block";
        volverInicio.style.display = "none";
        prepararInicioZeroStock().catch(err => {
          console.error("No se pudo actualizar el menú principal:", err);
        });
      });
    }

    panelInicio.querySelector("#zs-crear-informe").addEventListener("click", async () => {
      if (borradorDisponible?.id) {
        const crearNuevo = window.confirm(
          "Ya tienes un informe en curso.\n\n¿Seguro que quieres descartarlo y crear un informe nuevo?"
        );

        if (!crearNuevo) return;

        const session = window.zeroStockSession;
        if (!session?.user?.id) return;

        try {
          const { error } = await client
            .from("informes")
            .delete()
            .eq("id", borradorDisponible.id)
            .eq("usuario_id", session.user.id)
            .eq("estado", "borrador");

          if (error) throw error;

          // La relación informe_productos -> informes usa ON DELETE CASCADE,
          // por lo que Supabase elimina automáticamente los productos del borrador.
          borradorDisponible = null;
          informeEnCursoId = null;
          window.zeroStockInformeEnCursoId = null;

        } catch (err) {
          console.error("No se pudo descartar el informe en curso:", err);
          alert("No fue posible descartar el informe en curso. Inténtalo nuevamente.");
          return;
        }
      }

      panelInicio.style.display = "none";
      app.style.display = "block";
      const volverInicio = document.getElementById("zs-volver-inicio");
      if (volverInicio) volverInicio.style.display = "block";
    });

    panelInicio.querySelector("#zs-continuar-informe").addEventListener("click", async () => {
      if (!borradorDisponible?.id) return;
      panelInicio.style.display = "none";
      app.style.display = "block";
      const volverInicio = document.getElementById("zs-volver-inicio");
      if (volverInicio) volverInicio.style.display = "block";
      await recuperarBorradorExistente();
    });
    return panelInicio;
  }

  async function prepararInicioZeroStock() {
    const session = window.zeroStockSession;
    if (!session?.user?.id) return;
    const panel = crearPanelInicioSiHaceFalta();
    const saludo = panel.querySelector("#zs-inicio-saludo");
    const btnContinuar = panel.querySelector("#zs-continuar-informe");
    const estado = panel.querySelector("#zs-borrador-estado");
    app.style.display = "none";
    panel.style.display = "block";
    const volverInicio = document.getElementById("zs-volver-inicio");
    if (volverInicio) volverInicio.style.display = "none";
    saludo.textContent = window.zeroStockPerfil?.nombre ? `Hola, ${window.zeroStockPerfil.nombre}` : "";
    borradorDisponible = null;
    btnContinuar.disabled = true;
    estado.textContent = "Buscando informe en curso...";
    try {
      const { data: borrador, error } = await client.from("informes").select("id, tipo, distribuidor, actualizado_en").eq("usuario_id", session.user.id).eq("estado", "borrador").maybeSingle();
      if (error) throw error;
      borradorDisponible = borrador || null;
      if (borradorDisponible) {
        btnContinuar.disabled = false;
        const tipoTexto = { inventario:"Inventario / Balance", devolucion:"Devolución", recepcion:"Recepción de carga" }[borradorDisponible.tipo] || "Informe";
        estado.textContent = `${tipoTexto} · ${borradorDisponible.distribuidor || "Sin distribuidor"}`;
      } else {
        estado.textContent = "No tienes informes en curso";
      }
    } catch (err) {
      console.error("No se pudo comprobar el informe en curso:", err);
      estado.textContent = "No fue posible comprobar el informe en curso";
    }
  }


  // =========================================================
  // GUARDADO DEL INFORME EN SUPABASE
  // =========================================================

  let guardandoInforme = false;

  // =========================================================
  // INFORME EN CURSO - PRIMER PASO
  // Crea UN informe en Supabase cuando aparece el primer
  // producto en la tabla. Todavía no sincroniza productos.
  // =========================================================

  let informeEnCursoId = null;
  let creandoInformeEnCurso = false;
  let sincronizandoProductos = false;
  let sincronizacionPendiente = false;
  let recuperandoBorrador = false;

  const tipoMapInforme = {
    "1": "inventario",
    "2": "devolucion",
    "3": "recepcion"
  };

  function textoTallasDesdeJson(tallas) {
    if (!tallas || typeof tallas !== "object") return "";

    return Object.entries(tallas)
      .map(([talla, cantidad]) => `${talla}: ${cantidad}`)
      .join(", ");
  }


  function buscarValorSelectPorTexto(select, texto) {
    if (!select || !texto) return null;

    const buscado = String(texto).trim().toLowerCase();

    const opcion = Array.from(select.options).find(
      option =>
        String(option.textContent || "")
          .trim()
          .toLowerCase() === buscado
    );

    return opcion ? opcion.value : null;
  }


  async function recuperarBorradorExistente() {
    const session = window.zeroStockSession;
    const tipoEl = document.getElementById("tipo-informe");
    const distribuidorEl = document.getElementById("distribuidor");
    const tbody = document.getElementById("tbody");

    if (
      !session?.user?.id ||
      !tipoEl ||
      !distribuidorEl ||
      !tbody ||
      informeEnCursoId ||
      recuperandoBorrador
    ) {
      return;
    }

    recuperandoBorrador = true;

    try {
      const {
        data: borrador,
        error: errorBorrador
      } = await client
        .from("informes")
        .select("id, tipo, distribuidor")
        .eq("usuario_id", session.user.id)
        .eq("estado", "borrador")
        .maybeSingle();

      if (errorBorrador) throw errorBorrador;
      if (!borrador) return;

      const {
        data: productos,
        error: errorProductos
      } = await client
        .from("informe_productos")
        .select(
          "codigo, nombre, cantidad, estado_producto, tallas, orden"
        )
        .eq("informe_id", borrador.id)
        .order("orden", { ascending: true });

      if (errorProductos) throw errorProductos;

      informeEnCursoId = borrador.id;
      window.zeroStockInformeEnCursoId = borrador.id;

      const valorTipo = Object.entries(tipoMapInforme)
        .find(([, nombre]) => nombre === borrador.tipo)?.[0];

      if (valorTipo) {
        tipoEl.value = valorTipo;
        tipoEl.dispatchEvent(
          new Event("change", { bubbles: true })
        );
      }

      const valorDistribuidor =
        buscarValorSelectPorTexto(
          distribuidorEl,
          borrador.distribuidor
        );

      if (valorDistribuidor !== null) {
        distribuidorEl.value = valorDistribuidor;
        distribuidorEl.dispatchEvent(
          new Event("change", { bubbles: true })
        );
      }

      tbody.innerHTML = "";

      (productos || []).forEach(producto => {
        const fila = tbody.insertRow();

        const celdaCodigo = fila.insertCell(0);
        celdaCodigo.textContent = producto.codigo || "";
        celdaCodigo.classList.add("col-1");

        const celdaNombre = fila.insertCell(1);
        celdaNombre.textContent = producto.nombre || "";
        celdaNombre.classList.add("col-2");

        const celdaCantidad = fila.insertCell(2);
        celdaCantidad.textContent = producto.cantidad ?? 0;
        celdaCantidad.classList.add("col-3");
        celdaCantidad.classList.add("cantidad");

        const tallasTexto =
          textoTallasDesdeJson(producto.tallas);

        if (tallasTexto) {
          celdaCantidad.dataset.tallas = tallasTexto;
        }

        const celdaEditar = fila.insertCell(3);
        celdaEditar.innerHTML =
          '<button class="boton-accion" onclick="editarCelda(this)"><i class="far fa-edit"></i></button>';
        celdaEditar.classList.add("col-4");

        const celdaBorrar = fila.insertCell(4);
        celdaBorrar.innerHTML =
          '<button class="boton-accion" onclick="eliminarCelda(this)"><i class="far fa-trash-alt"></i></button>';
        celdaBorrar.classList.add("col-5");

        const celdaEstado = fila.insertCell(5);
        celdaEstado.textContent =
          producto.estado_producto || "";
        celdaEstado.classList.add("col-6");
      });

      // La función original del formulario recalcula el total
      // cada vez que crea o elimina una fila.
      if (typeof sumarItems === "function") {
        sumarItems();
      }

      console.log(
        "Borrador recuperado desde Supabase:",
        borrador.id
      );

    } catch (err) {
      console.error(
        "No se pudo recuperar el borrador desde Supabase:",
        err
      );
    } finally {
      recuperandoBorrador = false;
    }
  }


  async function crearInformeEnCursoSiCorresponde() {
    if (informeEnCursoId || creandoInformeEnCurso) return;

    const session = window.zeroStockSession;
    const tipoEl = document.getElementById("tipo-informe");
    const distribuidorEl = document.getElementById("distribuidor");
    const tbody = document.getElementById("tbody");

    if (
      !session?.user?.id ||
      !tipoEl ||
      !distribuidorEl ||
      !tbody ||
      tbody.rows.length === 0 ||
      distribuidorEl.selectedIndex <= 0
    ) {
      return;
    }

    const tipo = tipoMapInforme[String(tipoEl.value)];
    if (!tipo) return;

    const nombreDistribuidor = (
      distribuidorEl.selectedOptions?.[0]?.text ||
      distribuidorEl.value ||
      ""
    ).trim();

    creandoInformeEnCurso = true;

    try {
      // Antes de crear un borrador nuevo, comprobar si este usuario
      // ya tiene uno. Supabase permite un solo borrador por usuario.
      const {
        data: borradorExistente,
        error: errorBuscarBorrador
      } = await client
        .from("informes")
        .select("id")
        .eq("usuario_id", session.user.id)
        .eq("estado", "borrador")
        .maybeSingle();

      if (errorBuscarBorrador) {
        throw errorBuscarBorrador;
      }

      if (borradorExistente?.id) {
        informeEnCursoId = borradorExistente.id;
        window.zeroStockInformeEnCursoId = borradorExistente.id;

        console.log(
          "Borrador existente encontrado en Supabase:",
          borradorExistente.id
        );

        await sincronizarProductosBorrador();
        return;
      }

      const { data: informe, error } = await client
        .from("informes")
        .insert({
          usuario_id: session.user.id,
          tipo: tipo,
          estado: "borrador",
          distribuidor: nombreDistribuidor
        })
        .select("id")
        .single();

      if (error) throw error;

      informeEnCursoId = informe.id;
      window.zeroStockInformeEnCursoId = informe.id;

      console.log(
        "Informe en curso creado correctamente en Supabase:",
        informe.id
      );

      await sincronizarProductosBorrador();
    } catch (err) {
      console.error(
        "No se pudo crear el informe en curso en Supabase:",
        err
      );
    } finally {
      creandoInformeEnCurso = false;
    }
  }

  async function sincronizarProductosBorrador() {
    const tbody = document.getElementById("tbody");

    if (!informeEnCursoId || !tbody) return;

    if (sincronizandoProductos) {
      sincronizacionPendiente = true;
      return;
    }

    sincronizandoProductos = true;

    try {
      const productos = Array.from(tbody.rows).map(
        (fila, index) => {
          const codigo = (
            fila.cells[0]?.innerText || ""
          ).trim();

          const celdaNombre = fila.cells[1];

          const cantidad = parseInt(
            (fila.cells[2]?.innerText || "0").trim(),
            10
          ) || 0;

          const estadoProducto = (
            fila.cells[5]?.innerText || ""
          ).trim();

          let nombre = (
            celdaNombre?.innerText || ""
          ).trim();

          const etiquetaEstado =
            celdaNombre?.querySelector?.(".estado-tag");

          if (etiquetaEstado) {
            nombre = nombre
              .replace(etiquetaEstado.textContent, "")
              .trim();
          }

          return {
            informe_id: informeEnCursoId,
            codigo: codigo || null,
            nombre: nombre,
            cantidad: cantidad,
            estado_producto:
              estadoProducto && estadoProducto !== "0"
                ? estadoProducto
                : null,
            tallas: convertirTallas(
              fila.cells[2]?.dataset?.tallas || ""
            ),
            orden: index + 1
          };
        }
      );

      const { error: errorBorrar } = await client
        .from("informe_productos")
        .delete()
        .eq("informe_id", informeEnCursoId);

      if (errorBorrar) throw errorBorrar;

      if (productos.length > 0) {
        const { error: errorInsertar } = await client
          .from("informe_productos")
          .insert(productos);

        if (errorInsertar) throw errorInsertar;
      }

      console.log(
        "Productos del borrador sincronizados en Supabase:",
        informeEnCursoId
      );
    } catch (err) {
      console.error(
        "No se pudieron sincronizar los productos del borrador:",
        err
      );
    } finally {
      sincronizandoProductos = false;

      if (sincronizacionPendiente) {
        sincronizacionPendiente = false;
        sincronizarProductosBorrador();
      }
    }
  }


  function activarObservadorInformeEnCurso() {
    const tbody = document.getElementById("tbody");
    if (!tbody) return;

    const observer = new MutationObserver(() => {
      if (recuperandoBorrador) return;

      if (tbody.rows.length > 0) {
        if (!informeEnCursoId) {
          crearInformeEnCursoSiCorresponde();
        } else {
          sincronizarProductosBorrador();
        }
      } else if (informeEnCursoId) {
        sincronizarProductosBorrador();
      }
    });

    observer.observe(tbody, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      activarObservadorInformeEnCurso
    );
  } else {
    activarObservadorInformeEnCurso();
  }


  function convertirTallas(texto) {
    if (!texto) return null;

    const resultado = {};

    texto.split(",").forEach(par => {
      const partes = par.split(":");

      if (partes.length < 2) return;

      const talla = partes[0].trim().toLowerCase();
      const valor = parseInt(partes[1].trim(), 10);

      if (
        talla &&
        !Number.isNaN(valor) &&
        valor > 0
      ) {
        resultado[talla] = valor;
      }
    });

    return Object.keys(resultado).length
      ? resultado
      : null;
  }


  async function guardarInformeFinalizado() {

    if (guardandoInforme) return;

    const session = window.zeroStockSession;

    const tipoEl =
      document.getElementById("tipo-informe");

    const distribuidorEl =
      document.getElementById("distribuidor");

    const tbody =
      document.getElementById("tbody");

    if (
      !session?.user?.id ||
      !tipoEl ||
      !distribuidorEl ||
      !tbody
    ) {
      return;
    }

    if (
      distribuidorEl.selectedIndex <= 0 ||
      tbody.rows.length === 0
    ) {
      return;
    }


    const tipoMap = {
      "1": "inventario",
      "2": "devolucion",
      "3": "recepcion"
    };

    const tipo =
      tipoMap[String(tipoEl.value)];

    if (!tipo) return;


    const nombreDistribuidor = (
      distribuidorEl.selectedOptions?.[0]?.text ||
      distribuidorEl.value ||
      ""
    ).trim();


    guardandoInforme = true;

    try {

      const ahora =
        new Date().toISOString();


      // =========================
      // FINALIZAR INFORME EN CURSO
      // Si existe un borrador, convertimos ESE MISMO informe
      // en finalizado. Solo creamos uno nuevo si no hay borrador.
      // =========================

      let informe;
      let errorInforme;

      if (informeEnCursoId) {
        const resultado = await client
          .from("informes")
          .update({
            tipo: tipo,
            estado: "finalizado",
            distribuidor: nombreDistribuidor,
            finalizado_en: ahora
          })
          .eq("id", informeEnCursoId)
          .eq("usuario_id", session.user.id)
          .select("id")
          .single();

        informe = resultado.data;
        errorInforme = resultado.error;
      } else {
        const resultado = await client
          .from("informes")
          .insert({
            usuario_id: session.user.id,
            tipo: tipo,
            estado: "finalizado",
            distribuidor: nombreDistribuidor,
            finalizado_en: ahora
          })
          .select("id")
          .single();

        informe = resultado.data;
        errorInforme = resultado.error;
      }


      if (errorInforme) {
        throw errorInforme;
      }


      // =========================
      // PREPARAR PRODUCTOS
      // =========================

      const productos =
        Array.from(tbody.rows).map(
          (fila, index) => {

            const codigo = (
              fila.cells[0]?.innerText || ""
            ).trim();


            const celdaNombre =
              fila.cells[1];


            const cantidad =
              parseInt(
                (
                  fila.cells[2]?.innerText ||
                  "0"
                ).trim(),
                10
              ) || 0;


            const estadoProducto = (
              fila.cells[5]?.innerText || ""
            ).trim();


            let nombre = (
              celdaNombre?.innerText || ""
            ).trim();


            // Quitar del nombre la etiqueta
            // visual del defecto.
            const etiquetaEstado =
              celdaNombre?.querySelector?.(
                ".estado-tag"
              );


            if (etiquetaEstado) {
              nombre = nombre
                .replace(
                  etiquetaEstado.textContent,
                  ""
                )
                .trim();
            }


            return {

              informe_id:
                informe.id,

              codigo:
                codigo || null,

              nombre:
                nombre,

              cantidad:
                cantidad,

              estado_producto:
                estadoProducto &&
                estadoProducto !== "0"
                  ? estadoProducto
                  : null,

              tallas:
                convertirTallas(
                  fila.cells[2]
                    ?.dataset
                    ?.tallas || ""
                ),

              orden:
                index + 1
            };
          }
        );


      // =========================
      // GUARDAR PRODUCTOS
      // =========================

      // Los productos del borrador ya existen en informe_productos.
      // Antes de guardar la versión final, los reemplazamos para evitar duplicados.
      const { error: errorBorrarProductosFinales } = await client
        .from("informe_productos")
        .delete()
        .eq("informe_id", informe.id);

      if (errorBorrarProductosFinales) {
        throw errorBorrarProductosFinales;
      }

      const {
        error: errorProductos
      } = await client
        .from("informe_productos")
        .insert(productos);


      if (errorProductos) {
        throw errorProductos;
      }


      console.log(
        "Informe guardado correctamente en Supabase:",
        informe.id
      );

      // El borrador ya quedó finalizado; liberar el informe en curso.
      informeEnCursoId = null;
      window.zeroStockInformeEnCursoId = null;


    } catch (err) {

      console.error(
        "No se pudo guardar el informe en Supabase:",
        err
      );

      alert(
        "El PDF puede descargarse, pero el informe no pudo guardarse en el sistema. Avísale al administrador antes de cerrar esta página."
      );

    } finally {

      guardandoInforme = false;

    }
  }


  // =========================================================
  // AL CREAR EL PDF TAMBIÉN GUARDAMOS EL INFORME
  // =========================================================

  const botonPdf =
    document.getElementById("boton-pdf") ||
    document.getElementById(
      "boton-crear-pdf"
    );


  if (botonPdf) {

    botonPdf.addEventListener(
      "click",
      guardarInformeFinalizado
    );

  }

})();
