(() => {
  "use strict";

  let panelUsuarios = null;
  let observer = null;

  function esAdministradora() {
    return String(window.zeroStockPerfil?.rol || "").trim().toLowerCase() === "administradora";
  }

  function volverAlInicio() {
    if (panelUsuarios) panelUsuarios.style.display = "none";
    const panelInicio = document.getElementById("zs-inicio");
    if (panelInicio) panelInicio.style.display = "block";
  }

  function crearPanelUsuarios() {
    if (panelUsuarios) return panelUsuarios;

    panelUsuarios = document.createElement("section");
    panelUsuarios.id = "zs-usuarios-panel";
    panelUsuarios.style.cssText = "display:none;max-width:720px;margin:24px auto;padding:28px;background:#fff;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.08);box-sizing:border-box;";
    panelUsuarios.innerHTML = `
      <button id="zs-usuarios-volver" type="button" style="border:0;background:transparent;color:#ad1457;font-weight:700;cursor:pointer;padding:0 0 18px;">← Volver al inicio</button>
      <h2 style="margin:0 0 24px;color:#1f2937;">Administrar usuarios</h2>
      <form id="zs-usuarios-form" style="max-width:520px;margin:0 auto;">
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
      <div id="zs-distribuidores" style="max-width:520px;margin:32px auto 0;padding-top:24px;border-top:1px solid #e5e7eb;">
        <h3 style="margin:0 0 14px;color:#1f2937;font-size:17px;">Distribuidores</h3>
        <div id="zs-distribuidores-lista" style="color:#6b7280;font-size:14px;">Cargando distribuidores...</div>
      </div>`;

    const sesion = document.getElementById("zs-sesion");
    if (sesion?.parentNode) sesion.parentNode.insertBefore(panelUsuarios, sesion.nextSibling);
    else document.body.appendChild(panelUsuarios);

    panelUsuarios.querySelector("#zs-usuarios-volver").addEventListener("click", volverAlInicio);
    panelUsuarios.querySelector("#zs-usuarios-form").addEventListener("submit", crearUsuario);
    return panelUsuarios;
  }

  async function cargarDistribuidores() {
    const client = window.zeroStockSupabase;
    const lista = panelUsuarios?.querySelector("#zs-distribuidores-lista");
    if (!lista) return;

    lista.style.color = "#6b7280";
    lista.textContent = "Cargando distribuidores...";

    try {
      if (!client?.from) throw new Error("No se pudo conectar con la base de datos.");

      const { data: perfiles, error } = await client
        .from("perfiles")
        .select("id, nombre, rol, activo")
        .eq("activo", true)
        .order("nombre", { ascending: true });

      if (error) throw error;

      const distribuidores = (perfiles || []).filter(perfil =>
        perfil?.id &&
        String(perfil?.rol || "").trim().toLowerCase() !== "administradora"
      );

      if (!distribuidores.length) {
        lista.textContent = "No hay distribuidores registrados.";
        return;
      }

      lista.innerHTML = "";
      distribuidores.forEach(perfil => {
        const fila = document.createElement("div");
        fila.style.cssText = "padding:12px 14px;margin-bottom:8px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;color:#1f2937;font-weight:700;";
        fila.textContent = perfil.nombre || "Sin nombre";
        lista.appendChild(fila);
      });
    } catch (error) {
      console.error("No se pudieron cargar los distribuidores:", error);
      lista.style.color = "#b91c1c";
      lista.textContent = "No fue posible cargar los distribuidores.";
    }
  }

  async function abrirUsuarios() {
    if (!esAdministradora()) return;
    const panelInicio = document.getElementById("zs-inicio");
    if (panelInicio) panelInicio.style.display = "none";
    crearPanelUsuarios().style.display = "block";
    await cargarDistribuidores();
  }

  async function crearUsuario(event) {
    event.preventDefault();
    if (!esAdministradora()) return;

    const client = window.zeroStockSupabase;
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
      if (!client?.functions?.invoke) throw new Error("No se pudo conectar con la administración de usuarios.");

      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error("No hay una sesión autenticada disponible.");

      const { data, error } = await client.functions.invoke("administrar-usuarios", {
        body: { nombre, email, password },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "No fue posible crear el usuario.");

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
      boton.className = "zs-inicio-opcion";
      boton.id = "zs-administrar-usuarios";
      boton.type = "button";
      boton.innerHTML = "<strong>Administrar usuarios</strong><span>Crea nuevas cuentas de distribuidores.</span>";
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
