import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { IOrder } from "../types/order.interface.js";

export async function generateInvoicePDF(order: IOrder): Promise<Buffer> {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.innerHTML = `
        <div id="pdf-content" style="width: 210mm; padding: 20mm; font-family: Arial;">
            <!-- Your invoice HTML structure here -->
            <h1>Invoice #${order.orderID}</h1>
            <!-- Include all invoice details -->
        </div>
    `;
    document.body.appendChild(tempDiv);

    try {
        const canvas = await html2canvas(
            tempDiv.querySelector("#pdf-content") as HTMLElement,
            {
                scale: 2,
                logging: false,
                useCORS: true,
            }
        );

        const pdf = new jsPDF("p", "mm", "a4");
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

        return pdfBuffer;
    } finally {
        document.body.removeChild(tempDiv);
    }
}
