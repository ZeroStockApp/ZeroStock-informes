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
  const volverInicio = document.getElementById("zs-volver-inicio");
  const volverBtn = document.getElementById("zs-volver-btn");
  let vistaActual = "inicio";
  let sesionInicializada = false;

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

  function showLogin() {
    login.style.display = "flex";
    app.style.display = "none";
    if (volverInicio) volverInicio.style.display = "none";
    sessionBar.style.display = "none";
    userLabel.textContent = "";
    window.zeroStockSession = null;
    window.zeroStockPerfil = null;
  }

  async function showApp(session) {
    login.style.display = "none";
    app.style.display = "block";
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
      return;
    }

    window.zeroStockPerfil = perfil;
    userLabel.textContent = perfil.nombre;

    // Dar un instante al formulario para terminar de cargar sus opciones
    // antes de reconstruir un borrador existente.
    setTimeout(() => {
      recuperarBorradorExistente();
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
    await client.auth.signOut();
    showLogin();
  });

  client.auth.onAuthStateChange((_event, session) => {
    if (session) {
      window.zeroStockSession = session;

      // Una renovación interna de la sesión no debe sacar a la usuaria
      // del formulario ni devolverla al menú principal.
      if (!sesionInicializada) {
        sesionInicializada = true;
        showApp(session);
      }
    } else {
      sesionInicializada = false;
      vistaActual = "inicio";
      showLogin();
    }
  });

  (async () => {
    const { data, error } = await client.auth.getSession();

    if (!error && data.session) {
      sesionInicializada = true;
      await showApp(data.session);
    } else {
      showLogin();
    }
  })();


  // =========================================================
  // CONTROL DE VISTA Y LIMPIEZA DEL FORMULARIO
  // =========================================================

  function mostrarFormulario() {
    vistaActual = "formulario";
    if (volverInicio) volverInicio.style.display = "block";
    app.style.display = "block";
    if (typeof panelInicio !== "undefined" && panelInicio) {
      panelInicio.style.display = "none";
    }
  }

  async function volverAlInicio() {
    vistaActual = "inicio";
    app.style.display = "none";
    if (volverInicio) volverInicio.style.display = "none";

    // No borra ni finaliza el borrador: solo vuelve al menú.
    if (typeof prepararInicioZeroStock === "function") {
      await prepararInicioZeroStock();
    }
  }

  if (volverBtn) {
    volverBtn.addEventListener("click", volverAlInicio);
  }

  function limpiarFormularioParaInformeNuevo() {
    // Desvincular primero el borrador anterior para que el observador
    // no pueda volver a sincronizar las filas que vamos a quitar.
    informeEnCursoId = null;
    window.zeroStockInformeEnCursoId = null;

    const tbody = document.getElementById("tbody");
    if (tbody) tbody.innerHTML = "";

    const tipoEl = document.getElementById("tipo-informe");
    if (tipoEl) tipoEl.value = "0";

    const distribuidorEl = document.getElementById("distribuidor");
    if (distribuidorEl) distribuidorEl.selectedIndex = 0;

    const formularioCompleto = document.getElementById("formulario-completo");
    if (formularioCompleto) formularioCompleto.style.display = "none";

    const campos = ["codigo", "nombre", "cantidad", "defecto"];
    campos.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.tagName === "SELECT") el.selectedIndex = 0;
      else el.value = "";
    });

    document.querySelectorAll(".valor-talla").forEach(el => {
      el.value = 0;
    });

    const estadoBueno = document.getElementById("estado-bueno");
    if (estadoBueno) estadoBueno.checked = true;

    const total = document.getElementById("total");
    if (total) total.textContent = "total item: 0";
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
      // CREAR INFORME
      // =========================

      const {
        data: informe,
        error: errorInforme
      } = await client
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
