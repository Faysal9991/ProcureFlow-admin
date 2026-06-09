import { InvoiceDetailPage } from "@/features/invoices/components";

type InvoicePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;

  return <InvoiceDetailPage invoiceId={id} />;
}
