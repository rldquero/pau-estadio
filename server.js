const express = require("express");
const path = require("path");
const PDFDocument = require("pdfkit");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "Público")));

app.post("/generar-pdf", (req, res) => {

    const datos = req.body;

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=informe_evento.pdf"
    );

    doc.pipe(res);

    // TITULO
    doc
        .fontSize(22)
        .text("INFORME OPERATIVO SAFETY STADIUM", {
            align: "center"
        });

    doc.moveDown();

    // DATOS
    doc.fontSize(14);

    doc.text(`Jornada: ${datos.jornada || ""}`);
    doc.text(`Partido: ${datos.partido || ""}`);
    doc.text(`Responsable: ${datos.responsable || ""}`);
    doc.text(`Fecha: ${datos.fecha || ""}`);

    doc.moveDown();

    // CRONOLOGIA
    doc
        .fontSize(18)
        .text("CRONOLOGÍA");

    doc.moveDown();

    if(datos.cronologia){

        datos.cronologia.forEach(item => {

            doc
                .fontSize(12)
                .text(`${item.hora} - ${item.texto}`);

        });

    }

    doc.moveDown();

    // OBSERVACIONES
    doc
        .fontSize(18)
        .text("OBSERVACIONES");

    doc.moveDown();

    doc
        .fontSize(12)
        .text(datos.observaciones || "Sin observaciones");

    doc.end();

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Servidor funcionando en puerto ${PORT}`);

});