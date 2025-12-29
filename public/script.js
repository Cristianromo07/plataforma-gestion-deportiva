/* public/script.js */

document.addEventListener('DOMContentLoaded', () => {
  // Add animation to cards on load (handled by CSS, but we can enhance here if needed)
  console.log('Coldeporte script loaded! 🏃‍♂️');

  // Form Validation enhancement
  const inputs = document.querySelectorAll('input');

  inputs.forEach(input => {
    input.addEventListener('blur', (e) => {
      validateInput(e.target);
    });

    input.addEventListener('input', (e) => {
      // Clear error style on input
      if (e.target.validity.valid) {
        e.target.style.borderColor = '#ddd';
      }
    });
  });

  function validateInput(input) {
    if (!input.checkValidity()) {
      input.style.borderColor = '#dc3545'; // Error color
    } else {
      input.style.borderColor = '#28a745'; // Success color
    }
  }

  // Optional: Toggle Password Visibility
  // We'd need to add a toggle button in HTML for this to work, 
  // keeping it simple for now as per plan, but ready for expansion.

  // --- CONTROL DE ACCESO (FRONTEND) ---
  checkUserRole();
});

function checkUserRole() {
  fetch('/api/user-info')
    .then(response => response.json())
    .then(data => {
      if (data.loggedIn && data.role === 'empleado') {
        hideAdminSections();
      }
    })
    .catch(err => console.error('Error verificando rol:', err));
}

function hideAdminSections() {
  console.log('Aplicando restricciones de rol: EMPLEADO');

  // Lista de rutas que el empleado NO debe ver
  const protectedRoutes = [
    '/cultura',
    '/fomento-deportivo',
    '/actividad-fisica'
    // '/schedule' -> AHORA PERMITIDO
  ];

  // 1. Ocultar enlaces del Menú de Navegación
  protectedRoutes.forEach(route => {
    // Selecciona cualquier enlace <a> que apunte a esa ruta
    const links = document.querySelectorAll(`a[href="${route}"]`);
    links.forEach(link => {
      link.style.display = 'none'; // Ocultar visualmente
    });
  });

  // 2. Ocultar Tarjetas del Dashboard (si usan las mismas rutas)
  // Como usamos selectores por href, esto ya debería cubrir tanto el menú como las cards.
  // Sin embargo, si quieres estar seguro, el código de arriba ya lo hace 
  // porque querySelectorAll busca en todo el documento.
}

