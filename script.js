const apiKey = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtdW5pd2xpYUBnbWFpbC5jb20iLCJqdGkiOiJlN2QzZDAxNS1jNzU4LTQ5YjMtYWExYi0zNTZhMWFkMTkxYjkiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTc0NDUzNzQxNCwidXNlcklkIjoiZTdkM2QwMTUtYzc1OC00OWIzLWFhMWItMzU2YTFhZDE5MWI5Iiwicm9sZSI6IiJ9.CdsN48fQlXsCZrDWmR_i-BdaNTScRYbyCulcm0C8tMk";

const container = document.getElementById("forecast-container");

const rangos = [
  { min: -Infinity, max: 1, cemento: "52,5 RE", agua: "caliente", dosis: "325 kg/m³ + Acelerante" },
  { min: 1, max: 4, cemento: "52,5 RE", agua: "caliente", dosis: "325 kg/m³" },
  { min: 4, max: 7, cemento: ["52,5 RE", "52,5 R"], agua: "caliente", dosis: ["300 kg/m³", "350 kg/m³"] },
  { min: 7, max: 11, cemento: "52,5 R", agua: ["caliente", "fría"], dosis: ["325 kg/m³", "350 kg/m³"] },
  { min: 11, max: 15, cemento: "52,5 R", agua: ["caliente", "fría"], dosis: ["300 kg/m³", "325 kg/m³"] },
  { min: 15, max: 19, cemento: ["52,5 R", "42,5 R"], agua: "fría", dosis: ["300 kg/m³", "350 kg/m³"] },
  { min: 19, max: 24, cemento: "42,5 R", agua: "fría", dosis: "325 kg/m³" },
  { min: 24, max: 29, cemento: "42,5 R", agua: "fría", dosis: "300 kg/m³" },
  { min: 29, max: Infinity, cemento: "42,5 R", agua: "fría", dosis: "300 kg/m³ + Regar 1ª y 2ª hora; Masterkure 150→200" }
];

function calcularDosificacion(temp) {
  const resultados = [];

  rangos.forEach((rango, i) => {
    if (temp === rango.min && i > 0) {
      const anterior = rangos[i - 1];
      resultados.push(...formatearRango(anterior));
    }
    if (temp >= rango.min && temp < rango.max) {
      resultados.push(...formatearRango(rango));
    }
  });

  return resultados;
}

function formatearRango(rango) {
  const cementos = Array.isArray(rango.cemento) ? rango.cemento : [rango.cemento];
  const aguas = Array.isArray(rango.agua) ? rango.agua : [rango.agua];
  const dosis = Array.isArray(rango.dosis) ? rango.dosis : [rango.dosis];

  const combinaciones = [];
  for (let i = 0; i < Math.max(cementos.length, aguas.length, dosis.length); i++) {
    combinaciones.push(
      `${cementos[i % cementos.length]}, ${aguas[i % aguas.length]}, ${dosis[i % dosis.length]}`
    );
  }

  return combinaciones;
}

fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/26089/?api_key=${apiKey}`)
  .then(res => res.json())
  .then(data => fetch(data.datos))
  .then(res => res.json())
  .then(json => {
    const dias = json[0].prediccion.dia;

    dias.forEach((dia, i) => {
      const fecha = dia.fecha.split("T")[0];
      const tMax = dia.temperatura.maxima;
      const tMinSiguiente = dias[i + 1]?.temperatura?.minima ?? dia.temperatura.minima;
      const lluvia = dia.probPrecipitacion[0].value;

      const tempMedia = ((tMax + tMinSiguiente) / 2).toFixed(1);
      const dosificaciones = calcularDosificacion(parseFloat(tempMedia));

      const weatherHTML = `
        <div class="forecast-day">
          <div class="weather">
            <strong>${fecha}</strong><br>
            Temp Max: ${tMax} °C<br>
            Temp Min (día sig.): ${tMinSiguiente} °C<br>
            Temp Media: ${tempMedia} °C<br>
            Lluvia: ${lluvia || 0} %
          </div>
          <div class="dosificacion">
            ${dosificaciones.map(d => `<div>${d}</div>`).join("")}
          </div>
        </div>
      `;

      container.innerHTML += weatherHTML;
    });
  });
