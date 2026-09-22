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

  const tipoMapInforme = {
    "1": "inventario",
    "2": "devolucion",
    "3": "recepcion"
  };

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
