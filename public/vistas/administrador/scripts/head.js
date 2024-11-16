function loadScripts() {
    const serverIP = localStorage.getItem('serverIP') || 'localhost'; // Obtener la IP del servidor o localhost
    const scriptUrls = [
        `http://${serverIP}:3000/administrador/scripts/zonas.js`,
        `http://${serverIP}:3000/administrador/scripts/medidas.js`,
        `http://${serverIP}:3000/administrador/scripts/categorias.js`,
    ];

    scriptUrls.forEach(url => {
        const script = document.createElement('script');
        script.src = url;
        script.defer = true; // Asegúrate de que se carguen después de que el DOM esté listo
        document.head.appendChild(script); // Agregar el script al head
    });

    const stylesPage = [
        `http://${serverIP}:3000/estilos/global.css`,
        `http://${serverIP}:3000/estilos/opciones.css`,
    ]

    stylesPage.forEach(url => {
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = url;
        document.head.appendChild(style);
    });
}
window.onload = loadScripts;