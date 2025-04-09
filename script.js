
document.addEventListener("DOMContentLoaded", () => {
  const calcularBtn = document.getElementById("btn-calcular");
  const salvarBtn = document.getElementById("btn-pdf");
  const resultadoDiv = document.getElementById("resultado");
  const historico = [];
  let chart;

  calcularBtn.addEventListener("click", () => {
    const consumo = parseFloat(document.getElementById('consumo').value);
    const preco = parseFloat(document.getElementById('preco').value);
    const abastecido = parseFloat(document.getElementById('abastecido').value);
    const meta = parseFloat(document.getElementById('meta').value);
    const tipoMeta = document.getElementById('tipo_meta').value;
    const horasDia = parseFloat(document.getElementById('horas_dia').value);
    const taxa = parseFloat(document.getElementById('taxa').value);

    if ([consumo, preco, abastecido, meta, horasDia].some(isNaN)) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    const litros = abastecido / preco;
    const kmDisponivel = litros * consumo;
    const custoPorKm = preco / consumo;

    const metaDia = tipoMeta === "hora" ? meta * horasDia : meta;
    const ganhoLiquidoPorDia = metaDia / (1 - taxa / 100);
    const minimoPorHora = ganhoLiquidoPorDia / horasDia;
    const minimoPorKm = ganhoLiquidoPorDia / kmDisponivel;

    const resultado = {
      litros,
      kmDisponivel,
      custoPorKm,
      metaDia,
      ganhoLiquidoPorDia,
      minimoPorHora,
      minimoPorKm
    };

    historico.push(resultado);

    resultadoDiv.innerHTML = `
      <h3>Resultados:</h3>
      Litros abastecidos: <strong>${litros.toFixed(2)} L</strong><br>
      KM disponíveis: <strong>${kmDisponivel.toFixed(2)} km</strong><br>
      Custo por KM: <strong>R$ ${custoPorKm.toFixed(2)}</strong><br><br>
      Meta considerada: <strong>R$ ${metaDia.toFixed(2)} / dia</strong><br>
      Ganho necessário (com taxa): <strong>R$ ${ganhoLiquidoPorDia.toFixed(2)}</strong><br>
      Mínimo por hora: <strong>R$ ${minimoPorHora.toFixed(2)}</strong><br>
      Mínimo por KM: <strong>R$ ${minimoPorKm.toFixed(2)}</strong><br><br>
      <strong>Dica:</strong> só aceite corridas com valor mínimo de <strong>R$ ${minimoPorKm.toFixed(2)} por KM</strong> ou <strong>R$ ${minimoPorHora.toFixed(2)} por hora</strong>.
    `;

    gerarGrafico(historico);
  });

  salvarBtn.addEventListener("click", () => {
    if (!resultadoDiv.innerHTML.trim()) {
      alert("Calcule primeiro antes de salvar.");
      return;
    }

    const opt = {
      margin: 0.5,
      filename: 'resultado_motorista.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(resultadoDiv).set(opt).save();
  });

  function gerarGrafico(data) {
    const ctx = document.getElementById("grafico").getContext("2d");

    const labels = data.map((_, i) => `Simulação ${i + 1}`);
    const ganhos = data.map(e => e.ganhoLiquidoPorDia);
    const kmDisponiveis = data.map(e => e.kmDisponivel);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Ganho diário necessário (R$)",
            data: ganhos,
            backgroundColor: "rgba(241, 196, 15, 0.8)"
          },
          {
            label: "KM disponíveis",
            data: kmDisponiveis,
            backgroundColor: "rgba(52, 152, 219, 0.7)"
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Simulações de desempenho" }
        }
      }
    });
  }
});
