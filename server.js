const express = require("express")
const path = require("path")
const PDFDocument = require("pdfkit")

const app = express()

app.use(express.json())

app.use(express.static(path.join(__dirname, "public")))


// GENERAR PDF
app.post("/generar-pdf", (req, res) => {

    const datos = req.body

    const doc = new PDFDocument()

    const nombreArchivo = `informe_${Date.now()}.pdf`

    res.setHeader("Content-Type", "application/pdf")

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${nombreArchivo}`
    )

    doc.pipe(res)

    // TITULO
    doc
        .fontSize(22)
        .text("INFORME FINAL DEL EVENTO", {
            align: "center"
        })

    doc.moveDown()

    doc.fontSize(14)

    doc.text(`Partido: ${datos.partido || ""}`)
    doc.text(`Fecha: ${datos.fecha || ""}`)
    doc.text(`Estadio: ${datos.estadio || ""}`)

    doc.moveDown()

    doc
        .fontSize(18)
        .text("CRONOLOGÍA")

    doc.moveDown()

    if (datos.cronologia) {

        datos.cronologia.forEach(item => {

            doc
                .fontSize(12)
                .text(`${item.hora} - ${item.texto}`)

        })

    }

    doc.moveDown()

    doc
        .fontSize(18)
        .text("OBSERVACIONES")

    doc.moveDown()

    doc
        .fontSize(12)
        .text(datos.observaciones || "Sin observaciones")

    doc.end()

})


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor funcionando en puerto ${PORT}`)
})
