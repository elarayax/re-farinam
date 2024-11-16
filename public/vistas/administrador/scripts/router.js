const navUniversal = document.getElementById("navUniversal");
function createNav() {
    navUniversal.innerHTML = "";
    const nav = document.createElement("nav");
    nav.innerHTML = `
        <a href="actual">Actual</a>
        <a href="pedidos.html">Pedidos</a>
        <a href="menu.html">Menú</a>
        <a href="inventario.html">Inventario</a>
        <a href="usuarios.html">Usuarios</a>
        <a href="opciones.html">Opciones</a>
        <a href="cerrar-sesion">Cerrar Sesión</a>
    `;
    navUniversal.appendChild(nav);
}
createNav();
