// Mostrar/ocultar el menú cuando se haga clic en el ícono
function toggleMenu() {
    const navList = document.getElementById("nav-list");
    navList.classList.toggle("show");
  }
  
  // Cerrar el menú al hacer clic en un enlace
  const menuLinks = document.querySelectorAll(".navbar a");
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      const navList = document.getElementById("nav-list");
      navList.classList.remove("show");
    });
  });
  