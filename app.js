const DB = window.AIRPORT_DATA || {};

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div style="padding:24px;color:white;">
      <h1>APP JS WORKS</h1>
      <p>Аэропортов: ${DB.airports?.length || 0}</p>
      <p>Зон: ${DB.zones?.length || 0}</p>
      <p>Точек: ${DB.venues?.length || 0}</p>
    </div>
  `;
});
