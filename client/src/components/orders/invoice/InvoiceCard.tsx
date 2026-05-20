'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Printer } from 'lucide-react';
import { useGetOrderByIDQuery } from '@/redux/features/orders/ordersApi';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import InvoiceTemplate from './InvoiceTemplate';
import { useGetPaymentByOrderIDQuery } from '@/redux/features/payments/paymentApi';

export default function InvoiceCard({ orderID }: { orderID: string }) {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const { data, isLoading } = useGetOrderByIDQuery(orderID, {
        skip: !orderID,
    });
    const { data: paymentData, isLoading: isPaymentDataLoading } =
        useGetPaymentByOrderIDQuery(orderID, {
            skip: !orderID,
        });

    const order = !isLoading ? data?.data : {};
    const payment = !isPaymentDataLoading ? paymentData.data : {};

    const generatePDF = async (): Promise<Blob> => {
        if (typeof window === 'undefined') {
            throw new Error('Cannot generate PDF on server side');
        }

        setIsGeneratingPDF(true);
        try {
            const invoiceElement = document.getElementById('invoice-content');
            if (!invoiceElement) throw new Error('Invoice element not found');

            const canvas = await html2canvas(invoiceElement, {
                scale: 2,
                logging: false,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const pdfBlob = pdf.output('blob');
            return pdfBlob;
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handlePrint = async () => {
        if (typeof window === 'undefined') return;

        setIsGeneratingPDF(true);
        try {
            const pdfBlob = await generatePDF();
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
        } catch (error) {
            console.log(error);
            toast.error('Failed to generate PDF');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <p className="text-destructive">No order data found</p>
            </div>
        );
    }

    return (
        <section className="w-full max-w-4xl mx-auto p-4 print:p-0">
            <div className="flex justify-end gap-3 mb-6 print:hidden">
                <Button
                    onClick={handlePrint}
                    disabled={isGeneratingPDF}
                    variant="outline"
                    className="gap-2"
                >
                    {isGeneratingPDF ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Printer className="h-4 w-4" />
                    )}
                    {isGeneratingPDF ? 'Preparing...' : 'Print/Save PDF'}
                </Button>
            </div>

            <InvoiceTemplate order={order} payment={payment} />
        </section>
    );
}
