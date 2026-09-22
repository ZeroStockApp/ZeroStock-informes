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

  function showLogin() {
    login.style.display = "flex";
    app.style.display = "none";
    sessionBar.style.display = "none";
    userLabel.textContent = "";
  }

  function showApp(session) {
    login.style.display = "none";
    app.style.display = "block";
    sessionBar.style.display = "flex";
    userLabel.textContent = session?.user?.email || "";
    errorBox.textContent = "";
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

      showApp(data.session);
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
      showApp(data.session);
    } else {
      showLogin();
    }
  })();
})();
