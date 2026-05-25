const express = require("express");
const path = require("path");
const PDFDocument = require("pdfkit");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "Público")));

app.post("/generar-pdf", (req, res) => {

    const datos = req.body;

    const doc = new PDFDocument({
        margin: 40
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=informe_evento.pdf");

    doc.pipe(res);

    try {
        doc.image(path.join(__dirname, "Público", "IMG", "logo.png"), 40, 30, {
            width: 60
        });
    } catch (error) {
        console.log("Logo no encontrado");
    }

    doc
        .fontSize(24)
        .fillColor("#111827")
        .text("INFORME OPERATIVO SAFETY STADIUM", 120, 40);

    doc
        .fontSize(12)
        .fillColor("#64748b")
        .text("Sistema de gestión operativa y emergencias", 120, 75);

    doc.moveDown(4);

    doc
        .fontSize(16)
        .fillColor("#111827")
        .text("DATOS DEL EVENTO");

    doc.moveDown();

    doc
        .fontSize(12)
        .fillColor("#000000")
        .text(`Jornada: ${datos.jornada || ""}`)
        .text(`Partido: ${datos.partido || ""}`)
        .text(`Responsable redacción: ${datos.responsable || ""}`)
        .text(`Fecha informe: ${datos.fecha || ""}`);

    doc.moveDown(2);

    doc
        .fontSize(16)
        .fillColor("#111827")
        .text("CRONOLOGÍA OPERATIVA");

    doc.moveDown();

    if (datos.cronologia && datos.cronologia.length > 0) {

        datos.cronologia.forEach(item => {
            doc
                .fontSize(11)
                .fillColor("#000000")
                .text(`${item.hora} - ${item.texto}`);

            doc.moveDown(0.5);
        });

    } else {
        doc
            .fontSize(11)
            .fillColor("#000000")
            .text("No hay registros en la cronología.");
    }

    doc.moveDown(2);

    doc
        .fontSize(16)
        .fillColor("#111827")
        .text("OBSERVACIONES");

    doc.moveDown();

    doc
        .fontSize(11)
        .fillColor("#000000")
        .text(datos.observaciones || "Sin observaciones.");

    doc.moveDown(4);

    doc
        .fontSize(12)
        .fillColor("#111827")
        .text(`Redactado por: ${datos.responsable || ""}`);

    doc.end();

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor funcionando en puerto ${PORT}`);
});