(() => {
  "use strict";

  let panelUsuarios = null;
  let observer = null;
  let usuarioSeleccionado = null;

  function esAdministradora() {
    return String(window.zeroStockPerfil?.rol || "").trim().toLowerCase() === "administradora";
  }

  function volverAlInicio() {
    if (panelUsuarios) panelUsuarios.style.display = "none";
    const panelInicio = document.getElementById("zs-inicio");
    if (panelInicio) panelInicio.style.display = "block";
  }

  async function obtenerAccessToken() {
    const client = window.zeroStockSupabase;
    if (!client?.functions?.invoke) {
      throw new Error("No se pudo conectar con la administración de usuarios.");
    }

    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;

    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) throw new Error("No hay una sesión autenticada disponible.");
    return accessToken;
  }

  async function invocarAdministrarUsuarios(body) {
    const client = window.zeroStockSupabase;
    const accessToken = await obtenerAccessToken();

    const { data, error } = await client.functions.invoke("administrar-usuarios", {
      body,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error || "No fue posible completar la operación.");
    return data;
  }

  function crearPanelUsuarios() {
    if (panelUsuarios) return panelUsuarios;

    panelUsuarios = document.createElement("section");
    panelUsuarios.id = "zs-usuarios-panel";
    panelUsuarios.style.cssText = "display:none;max-width:720px;margin:24px auto;padding:28px;background:#fff;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.08);box-sizing:border-box;";
    panelUsuarios.innerHTML = `
      <button id="zs-usuarios-volver" type="button" style="border:0;background:transparent;color:#ad1457;font-weight:700;cursor:pointer;padding:0 0 18px;">← Volver al inicio</button>
      <h2 style="margin:0 0 24px;color:#1f2937;">Administrar usuarios</h2>

      <div id="zs-usuarios-menu" style="max-width:520px;margin:0 auto;display:grid;gap:12px;">
        <button id="zs-opcion-crear" type="button" style="width:100%;text-align:left;padding:16px 18px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;color:#1f2937;">
          <strong style="display:block;font-size:15px;margin-bottom:4px;">Crear nuevo usuario</strong>
          <span style="font-size:13px;color:#6b7280;">Crea una nueva cuenta de distribuidor.</span>
        </button>
        <button id="zs-opcion-editar" type="button" style="width:100%;text-align:left;padding:16px 18px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;color:#1f2937;">
          <strong style="display:block;font-size:15px;margin-bottom:4px;">Editar usuario</strong>
          <span style="font-size:13px;color:#6b7280;">Modifica los datos de un distribuidor existente.</span>
        </button>
        <button id="zs-opcion-eliminar" type="button" style="width:100%;text-align:left;padding:16px 18px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;color:#1f2937;">
          <strong style="display:block;font-size:15px;margin-bottom:4px;">Eliminar usuario</strong>
          <span style="font-size:13px;color:#6b7280;">Elimina permanentemente una cuenta de distribuidor.</span>
        </button>
      </div>

      <div id="zs-usuarios-crear" style="display:none;max-width:520px;margin:0 auto;">
        <button id="zs-crear-volver" type="button" style="border:0;background:transparent;color:#ad1457;font-weight:700;cursor:pointer;padding:0 0 18px;">← Volver a administrar usuarios</button>
        <h3 style="margin:0 0 20px;color:#1f2937;font-size:18px;">Crear nuevo usuario</h3>
        <form id="zs-usuarios-form">
          <div style="margin-bottom:16px;">
            <label for="zs-usuario-nombre" style="display:block;margin-bottom:7px;color:#374151;font-size:14px;font-weight:700;">Nombre</label>
            <input id="zs-usuario-nombre" type="text" autocomplete="off" required style="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;">
          </div>
          <div style="margin-bottom:16px;">
            <label for="zs-usuario-email" style="display:block;margin-bottom:7px;color:#374151;font-size:14px;font-weight:700;">Correo electrónico</label>
            <input id="zs-usuario-email" type="email" autocomplete="off" required style="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;">
          </div>
          <div style="margin-bottom:16px;">
            <label for="zs-usuario-password" style="display:block;margin-bottom:7px;color:#374151;font-size:14px;font-weight:700;">Contraseña inicial</label>
            <input id="zs-usuario-password" type="password" autocomplete="new-password" minlength="6" required style="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;">
          </div>
          <button id="zs-usuarios-submit" type="submit" style="width:100%;border:0;border-radius:8px;padding:12px;background:#ad1457;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">Crear usuario</button>
          <div id="zs-usuarios-mensaje" role="status" aria-live="polite" style="min-height:20px;margin-top:14px;text-align:center;font-size:13px;line-height:1.45;"></div>
        </form>
      </div>

      <div id="zs-usuarios-editar" style="display:none;max-width:520px;margin:0 auto;">
        <button id="zs-editar-volver" type="button" style="border:0;background:transparent;color:#ad1457;font-weight:700;cursor:pointer;padding:0 0 18px;">← Volver a administrar usuarios</button>
        <h3 style="margin:0 0 8px;color:#1f2937;font-size:18px;">Editar usuario</h3>
        <p style="margin:0 0 18px;color:#6b7280;font-size:13px;">Selecciona el distribuidor que quieres modificar.</p>
        <div id="zs-editar-lista" style="display:grid;gap:10px;"></div>
        <div id="zs-editar-lista-mensaje" role="status" aria-live="polite" style="min-height:20px;margin-top:14px;text-align:center;font-size:13px;line-height:1.45;"></div>
      </div>

      <div id="zs-usuarios-eliminar" style="display:none;max-width:520px;margin:0 auto;">
        <button id="zs-eliminar-volver" type="button" style="border:0;background:transparent;color:#ad1457;font-weight:700;cursor:pointer;padding:0 0 18px;">← Volver a administrar usuarios</button>
        <h3 style="margin:0 0 8px;color:#1f2937;font-size:18px;">Eliminar usuario</h3>
        <p style="margin:0 0 18px;color:#6b7280;font-size:13px;">Selecciona el distribuidor que quieres eliminar permanentemente.</p>
        <div id="zs-eliminar-lista" style="display:grid;gap:10px;"></div>
        <div id="zs-eliminar-lista-mensaje" role="status" aria-live="polite" style="min-height:20px;margin-top:14px;text-align:center;font-size:13px;line-height:1.45;"></div>
      </div>

      <div id="zs-usuarios-eliminar-confirmacion" style="display:none;max-width:520px;margin:0 auto;">
        <button id="zs-eliminar-confirmacion-volver" type="button" style="border:0;background:transparent;color:#ad1457;font-weight:700;cursor:pointer;padding:0 0 18px;">← Volver a elegir usuario</button>
        <h3 style="margin:0 0 14px;color:#1f2937;font-size:18px;">Confirmar eliminación</h3>
        <div style="padding:16px;border:1px solid #fecaca;background:#fff7f7;border-radius:10px;">
          <p id="zs-eliminar-pregunta" style="margin:0 0 8px;color:#1f2937;font-weight:700;"></p>
          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5;">Se eliminarán permanentemente su cuenta y todos sus informes. Esta acción no se puede deshacer.</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">
          <button id="zs-eliminar-cancelar" type="button" style="border:1px solid #d1d5db;border-radius:8px;padding:12px;background:#fff;color:#374151;font-size:14px;font-weight:700;cursor:pointer;">Cancelar</button>
          <button id="zs-eliminar-confirmar" type="button" style="border:0;border-radius:8px;padding:12px;background:#b91c1c;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">Eliminar</button>
        </div>
        <div id="zs-eliminar-mensaje" role="status" aria-live="polite" style="min-height:20px;margin-top:14px;text-align:center;font-size:13px;line-height:1.45;"></div>
      </div>

      <div id="zs-usuarios-editar-formulario" style="display:none;max-width:520px;margin:0 auto;">
        <button id="zs-editar-form-volver" type="button" style="border:0;background:transparent;color:#ad1457;font-weight:700;cursor:pointer;padding:0 0 18px;">← Volver a elegir usuario</button>
        <h3 style="margin:0 0 20px;color:#1f2937;font-size:18px;">Editar usuario</h3>
        <form id="zs-editar-form">
          <div style="margin-bottom:16px;">
            <label for="zs-editar-nombre" style="display:block;margin-bottom:7px;color:#374151;font-size:14px;font-weight:700;">Nombre</label>
            <input id="zs-editar-nombre" type="text" autocomplete="off" required style="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;">
          </div>
          <div style="margin-bottom:16px;">
            <label for="zs-editar-email" style="display:block;margin-bottom:7px;color:#374151;font-size:14px;font-weight:700;">Correo electrónico</label>
            <input id="zs-editar-email" type="email" autocomplete="off" required style="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;">
          </div>
          <button id="zs-editar-submit" type="submit" style="width:100%;border:0;border-radius:8px;padding:12px;background:#ad1457;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">Guardar cambios</button>
          <div id="zs-editar-mensaje" role="status" aria-live="polite" style="min-height:20px;margin-top:14px;text-align:center;font-size:13px;line-height:1.45;"></div>
        </form>
      </div>`;

    const sesion = document.getElementById("zs-sesion");
    if (sesion?.parentNode) sesion.parentNode.insertBefore(panelUsuarios, sesion.nextSibling);
    else document.body.appendChild(panelUsuarios);

    panelUsuarios.querySelector("#zs-usuarios-volver").addEventListener("click", volverAlInicio);
    panelUsuarios.querySelector("#zs-opcion-crear").addEventListener("click", mostrarCrearUsuario);
    panelUsuarios.querySelector("#zs-opcion-editar").addEventListener("click", mostrarEditarUsuarios);
    panelUsuarios.querySelector("#zs-opcion-eliminar").addEventListener("click", mostrarEliminarUsuarios);
    panelUsuarios.querySelector("#zs-crear-volver").addEventListener("click", mostrarMenuUsuarios);
    panelUsuarios.querySelector("#zs-editar-volver").addEventListener("click", mostrarMenuUsuarios);
    panelUsuarios.querySelector("#zs-editar-form-volver").addEventListener("click", mostrarEditarUsuarios);
    panelUsuarios.querySelector("#zs-eliminar-volver").addEventListener("click", mostrarMenuUsuarios);
    panelUsuarios.querySelector("#zs-eliminar-confirmacion-volver").addEventListener("click", mostrarEliminarUsuarios);
    panelUsuarios.querySelector("#zs-eliminar-cancelar").addEventListener("click", mostrarEliminarUsuarios);
    panelUsuarios.querySelector("#zs-eliminar-confirmar").addEventListener("click", confirmarEliminarUsuario);
    panelUsuarios.querySelector("#zs-usuarios-form").addEventListener("submit", crearUsuario);
    panelUsuarios.querySelector("#zs-editar-form").addEventListener("submit", guardarEdicionUsuario);
    return panelUsuarios;
  }

  function ocultarSecciones() {
    ["#zs-usuarios-menu", "#zs-usuarios-crear", "#zs-usuarios-editar", "#zs-usuarios-editar-formulario", "#zs-usuarios-eliminar", "#zs-usuarios-eliminar-confirmacion"].forEach((selector) => {
      const elemento = panelUsuarios?.querySelector(selector);
      if (elemento) elemento.style.display = "none";
    });
  }

  function mostrarMenuUsuarios() {
    ocultarSecciones();
    usuarioSeleccionado = null;
    const menu = panelUsuarios?.querySelector("#zs-usuarios-menu");
    const volverInicio = panelUsuarios?.querySelector("#zs-usuarios-volver");
    if (menu) menu.style.display = "grid";
    if (volverInicio) volverInicio.style.display = "inline-block";
  }

  function mostrarCrearUsuario() {
    ocultarSecciones();
    const crear = panelUsuarios?.querySelector("#zs-usuarios-crear");
    const volverInicio = panelUsuarios?.querySelector("#zs-usuarios-volver");
    if (crear) crear.style.display = "block";
    if (volverInicio) volverInicio.style.display = "none";
  }

  async function mostrarEditarUsuarios() {
    ocultarSecciones();
    usuarioSeleccionado = null;

    const editar = panelUsuarios?.querySelector("#zs-usuarios-editar");
    const volverInicio = panelUsuarios?.querySelector("#zs-usuarios-volver");
    const lista = panelUsuarios?.querySelector("#zs-editar-lista");
    const mensaje = panelUsuarios?.querySelector("#zs-editar-lista-mensaje");

    if (editar) editar.style.display = "block";
    if (volverInicio) volverInicio.style.display = "none";
    if (lista) lista.innerHTML = "";
    if (mensaje) {
      mensaje.style.color = "#374151";
      mensaje.textContent = "Cargando distribuidores...";
    }

    try {
      const data = await invocarAdministrarUsuarios({ accion: "listar" });
      const usuarios = Array.isArray(data.usuarios) ? data.usuarios : [];

      if (!usuarios.length) {
        mensaje.textContent = "No hay distribuidores para editar.";
        return;
      }

      mensaje.textContent = "";

      usuarios.forEach((usuario) => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.style.cssText = "width:100%;text-align:left;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;color:#1f2937;";
        boton.innerHTML = `
          <strong style="display:block;font-size:14px;margin-bottom:4px;"></strong>
          <span style="display:block;font-size:13px;color:#6b7280;"></span>
        `;
        boton.querySelector("strong").textContent = usuario.nombre || "Sin nombre";
        boton.querySelector("span").textContent = usuario.email || "Sin correo";
        boton.addEventListener("click", () => abrirFormularioEdicion(usuario));
        lista.appendChild(boton);
      });
    } catch (error) {
      console.error("No se pudieron cargar los distribuidores:", error);
      mensaje.style.color = "#b91c1c";
      mensaje.textContent = error?.message || "No fue posible cargar los distribuidores.";
    }
  }

  function abrirFormularioEdicion(usuario) {
    usuarioSeleccionado = usuario;
    ocultarSecciones();

    const formularioPanel = panelUsuarios?.querySelector("#zs-usuarios-editar-formulario");
    const volverInicio = panelUsuarios?.querySelector("#zs-usuarios-volver");
    const nombre = panelUsuarios?.querySelector("#zs-editar-nombre");
    const email = panelUsuarios?.querySelector("#zs-editar-email");
    const mensaje = panelUsuarios?.querySelector("#zs-editar-mensaje");

    if (nombre) nombre.value = usuario.nombre || "";
    if (email) email.value = usuario.email || "";
    if (mensaje) mensaje.textContent = "";
    if (formularioPanel) formularioPanel.style.display = "block";
    if (volverInicio) volverInicio.style.display = "none";
  }

  async function mostrarEliminarUsuarios() {
    ocultarSecciones();
    usuarioSeleccionado = null;

    const eliminar = panelUsuarios?.querySelector("#zs-usuarios-eliminar");
    const volverInicio = panelUsuarios?.querySelector("#zs-usuarios-volver");
    const lista = panelUsuarios?.querySelector("#zs-eliminar-lista");
    const mensaje = panelUsuarios?.querySelector("#zs-eliminar-lista-mensaje");

    if (eliminar) eliminar.style.display = "block";
    if (volverInicio) volverInicio.style.display = "none";
    if (lista) lista.innerHTML = "";
    if (mensaje) {
      mensaje.style.color = "#374151";
      mensaje.textContent = "Cargando distribuidores...";
    }

    try {
      const data = await invocarAdministrarUsuarios({ accion: "listar" });
      const usuarios = Array.isArray(data.usuarios) ? data.usuarios : [];

      if (!usuarios.length) {
        mensaje.textContent = "No hay distribuidores para eliminar.";
        return;
      }

      mensaje.textContent = "";

      usuarios.forEach((usuario) => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.style.cssText = "width:100%;text-align:left;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;color:#1f2937;";
        boton.innerHTML = `
          <strong style="display:block;font-size:14px;margin-bottom:4px;"></strong>
          <span style="display:block;font-size:13px;color:#6b7280;"></span>
        `;
        boton.querySelector("strong").textContent = usuario.nombre || "Sin nombre";
        boton.querySelector("span").textContent = usuario.email || "Sin correo";
        boton.addEventListener("click", () => abrirConfirmacionEliminacion(usuario));
        lista.appendChild(boton);
      });
    } catch (error) {
      console.error("No se pudieron cargar los distribuidores:", error);
      mensaje.style.color = "#b91c1c";
      mensaje.textContent = error?.message || "No fue posible cargar los distribuidores.";
    }
  }

  function abrirConfirmacionEliminacion(usuario) {
    usuarioSeleccionado = usuario;
    ocultarSecciones();

    const confirmacion = panelUsuarios?.querySelector("#zs-usuarios-eliminar-confirmacion");
    const volverInicio = panelUsuarios?.querySelector("#zs-usuarios-volver");
    const pregunta = panelUsuarios?.querySelector("#zs-eliminar-pregunta");
    const mensaje = panelUsuarios?.querySelector("#zs-eliminar-mensaje");

    const botonEliminar = panelUsuarios?.querySelector("#zs-eliminar-confirmar");
    const botonCancelar = panelUsuarios?.querySelector("#zs-eliminar-cancelar");

    if (pregunta) pregunta.textContent = `¿Eliminar a ${usuario.nombre || "este usuario"}?`;
    if (mensaje) mensaje.textContent = "";

    // Restablecer los botones al abrir una nueva confirmación.
    if (botonEliminar) {
      botonEliminar.style.display = "";
      botonEliminar.disabled = false;
      botonEliminar.textContent = "Eliminar";
    }

    if (botonCancelar) {
      botonCancelar.style.display = "";
      botonCancelar.disabled = false;
      botonCancelar.textContent = "Cancelar";
    }

    if (confirmacion) confirmacion.style.display = "block";
    if (volverInicio) volverInicio.style.display = "none";
  }

  async function confirmarEliminarUsuario() {
    if (!esAdministradora() || !usuarioSeleccionado?.id) return;

    const boton = panelUsuarios?.querySelector("#zs-eliminar-confirmar");
    const cancelar = panelUsuarios?.querySelector("#zs-eliminar-cancelar");
    const mensaje = panelUsuarios?.querySelector("#zs-eliminar-mensaje");
    const nombre = usuarioSeleccionado.nombre || "Usuario";

    mensaje.textContent = "";
    mensaje.style.color = "#374151";
    boton.disabled = true;
    cancelar.disabled = true;
    boton.textContent = "Eliminando...";

    try {
      await invocarAdministrarUsuarios({
        accion: "eliminar",
        id: usuarioSeleccionado.id
      });

      usuarioSeleccionado = null;
      mensaje.style.color = "#166534";
      mensaje.textContent = `${nombre} fue eliminado permanentemente.`;
      boton.style.display = "none";
      cancelar.style.display = "none";
    } catch (error) {
      console.error("No se pudo eliminar el usuario:", error);
      mensaje.style.color = "#b91c1c";
      mensaje.textContent = error?.message || "No fue posible eliminar el usuario.";
      boton.disabled = false;
      cancelar.disabled = false;
      boton.textContent = "Eliminar";
    }
  }

  function abrirUsuarios() {
    if (!esAdministradora()) return;
    const panelInicio = document.getElementById("zs-inicio");
    if (panelInicio) panelInicio.style.display = "none";
    crearPanelUsuarios().style.display = "block";
    mostrarMenuUsuarios();
  }

  async function crearUsuario(event) {
    event.preventDefault();
    if (!esAdministradora()) return;

    const form = event.currentTarget;
    const boton = form.querySelector("#zs-usuarios-submit");
    const mensaje = form.querySelector("#zs-usuarios-mensaje");
    const nombre = form.querySelector("#zs-usuario-nombre").value.trim();
    const email = form.querySelector("#zs-usuario-email").value.trim();
    const password = form.querySelector("#zs-usuario-password").value;

    mensaje.textContent = "";
    mensaje.style.color = "#374151";
    boton.disabled = true;
    boton.textContent = "Creando usuario...";

    try {
      const data = await invocarAdministrarUsuarios({ nombre, email, password });

      form.reset();
      mensaje.style.color = "#166534";
      mensaje.textContent = `Usuario ${data.usuario?.nombre || nombre} creado correctamente.`;
    } catch (error) {
      console.error("No se pudo crear el usuario:", error);
      mensaje.style.color = "#b91c1c";
      mensaje.textContent = error?.message || "No fue posible crear el usuario. Inténtalo nuevamente.";
    } finally {
      boton.disabled = false;
      boton.textContent = "Crear usuario";
    }
  }

  async function guardarEdicionUsuario(event) {
    event.preventDefault();
    if (!esAdministradora() || !usuarioSeleccionado?.id) return;

    const form = event.currentTarget;
    const boton = form.querySelector("#zs-editar-submit");
    const mensaje = form.querySelector("#zs-editar-mensaje");
    const nombre = form.querySelector("#zs-editar-nombre").value.trim();
    const email = form.querySelector("#zs-editar-email").value.trim();

    mensaje.textContent = "";
    mensaje.style.color = "#374151";
    boton.disabled = true;
    boton.textContent = "Guardando cambios...";

    try {
      const data = await invocarAdministrarUsuarios({
        accion: "editar",
        id: usuarioSeleccionado.id,
        nombre,
        email
      });

      usuarioSeleccionado = data.usuario;
      form.querySelector("#zs-editar-nombre").value = data.usuario?.nombre || nombre;
      form.querySelector("#zs-editar-email").value = data.usuario?.email || email;
      mensaje.style.color = "#166534";
      mensaje.textContent = `Usuario ${data.usuario?.nombre || nombre} actualizado correctamente.`;
    } catch (error) {
      console.error("No se pudo editar el usuario:", error);
      mensaje.style.color = "#b91c1c";
      mensaje.textContent = error?.message || "No fue posible guardar los cambios.";
    } finally {
      boton.disabled = false;
      boton.textContent = "Guardar cambios";
    }
  }

  function sincronizarBoton() {
    const opciones = document.querySelector("#zs-inicio .zs-inicio-opciones");
    if (!opciones) return;

    let boton = document.getElementById("zs-administrar-usuarios");
    if (!esAdministradora()) {
      if (boton) boton.remove();
      if (panelUsuarios) panelUsuarios.style.display = "none";
      return;
    }

    if (!boton) {
      boton = document.createElement("button");
      boton.className = "zs-inicio-opcion zs-admin-principal";
      boton.id = "zs-administrar-usuarios";
      boton.type = "button";
      boton.innerHTML = "<strong>Administrar usuarios</strong><span>Crea y administra cuentas de distribuidores.</span>";
      boton.addEventListener("click", abrirUsuarios);
      opciones.appendChild(boton);
    }
  }

  function iniciar() {
    sincronizarBoton();
    observer = new MutationObserver(sincronizarBoton);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  else iniciar();
})();
