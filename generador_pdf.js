function generarPDF() {
  const jsPDF = window.jspdf.jsPDF;

  // Creamos el documento Carta horizontal
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "letter"
  });

  // Márgenes seguros
  const marginLeft = 10;
  const marginTop = 15;

  // Título principal
  doc.setFontSize(16);
  doc.setTextColor(150, 0, 60);
  doc.text("Informe de Recepción de Carga", 140, marginTop, { align: "center" });

  // Subtítulo
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text("Distribuidor: Stock RMC", 140, marginTop + 8, { align: "center" });
  doc.text("Creado: " + new Date().toLocaleString(), 140, marginTop + 13, { align: "center" });

  // Tomamos la tabla del HTML
  const tabla = document.querySelector("#pdf table");

  // Convertimos la tabla HTML en un PDF profesional
  doc.autoTable({
    html: tabla,
    startY: marginTop + 20,
    margin: { left: marginLeft, right: marginLeft },
    styles: {
      fontSize: 8,
      halign: "center",
      valign: "middle",
      cellPadding: 1.5,
      lineColor: [150, 0, 60],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [255, 230, 235],
      textColor: [120, 0, 60],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 20 },  // Código 2 cm
      1: { cellWidth: 70 },  // Producto 7 cm
      2: { cellWidth: 15 },  // Cantidad 1.5 cm
      3: { cellWidth: 15 },  // PP
      4: { cellWidth: 15 },  // P
      5: { cellWidth: 15 },  // M
      6: { cellWidth: 15 },  // G
      7: { cellWidth: 15 },  // GG
      8: { cellWidth: 15 },  // EGG
      9: { cellWidth: 15 },  // EXGG
      10: { cellWidth: 15 }, // U
    },
  });

  // Pie de página
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(10);
  doc.text("TOTAL PRODUCTOS: " + obtenerTotalProductos(), 250, pageHeight - 10, { align: "right" });

  // Preparamos el PDF para que auth.js pueda guardar exactamente
  // el mismo archivo en Supabase Storage.
  const fecha = new Date().toLocaleDateString().replace(/\//g, '-');
  const nombreArchivo = "Informe_Stock_" + fecha + ".pdf";
  window.zeroStockUltimoPdfBlob = doc.output("blob");
  window.zeroStockUltimoPdfNombre = nombreArchivo;

  // Conservamos la descarga local que ya funcionaba.
  doc.save(nombreArchivo);

  // Avisamos a auth.js SOLO cuando el PDF ya está completamente preparado.
  // Así el informe no intenta finalizarse antes de que exista el Blob.
  window.dispatchEvent(new CustomEvent("zerostock:pdf-generado"));
}

// Función auxiliar para tomar el total de productos
function obtenerTotalProductos() {
  const celda = document.querySelector("#pdf td:last-child");
  return celda ? celda.textContent.trim() : "0";
}

window.generarPDF = generarPDF;
