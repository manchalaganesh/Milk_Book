import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Printer, Send, MessageSquare, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useI18n } from '@/lib/i18n.jsx';

export function getInvoiceText(order) {
  if (!order) return '';

  const paymentMethodLabel = {
    cash: 'Cash',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    credit: 'Credit'
  }[order.payment_method] || order.payment_method || 'Cash';

  const itemsText = (order.items || [])
    .map(item => `${item.product_name} x ${item.quantity} = ₹${item.total}`)
    .join('\n');

  // Shorten UUID for BillNumber if it is a standard UUID length, else use full id
  const billNo = order.id && order.id.length > 12 ? order.id.slice(-8).toUpperCase() : order.id || 'N/A';

  return `MilkBook Dairy

Hello ${order.customer_name || 'Customer'},

Thank you for shopping with us.

Invoice Details

Bill No: ${billNo}
Date: ${order.date || ''}

Items:
${itemsText}

Subtotal: ₹${order.total_amount || 0}
Discount: ₹${order.discount || 0}
Total: ₹${order.final_amount || 0}

Payment Mode:
${paymentMethodLabel}

Thank you!
MilkBook Dairy`;
}

export default function InvoiceShareDialog({ order, open, onOpenChange }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Update text when order changes
  useEffect(() => {
    if (order) {
      setMessageText(getInvoiceText(order));
      setCopied(false);
    }
  }, [order, open]);

  if (!order) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Invoice text copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy text.",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = (order.customer_phone || '').replace(/\D/g, '');
    // If phone number is valid, try adding default country code (e.g. 91 for India) if not present
    let phoneUrlParam = cleanPhone;
    if (cleanPhone.length === 10) {
      phoneUrlParam = '91' + cleanPhone;
    }
    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneUrlParam}&text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSMSShare = () => {
    const cleanPhone = (order.customer_phone || '').replace(/\D/g, '');
    const encodedText = encodeURIComponent(messageText);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:${cleanPhone}${separator}body=${encodedText}`;
    window.location.href = smsUrl;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - Bill No: ${order.id || ''}</title>
            <style>
              body {
                font-family: 'Courier New', Courier, monospace;
                padding: 40px;
                white-space: pre-wrap;
                font-size: 14px;
                line-height: 1.5;
                color: #000;
                max-width: 400px;
                margin: 0 auto;
              }
              @media print {
                body {
                  padding: 10px;
                  font-size: 12px;
                }
              }
            </style>
          </head>
          <body>${messageText.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}</body>
        </html>
      `);
      printWindow.document.close();
      // Give browser a moment to load and render content before triggering print dialog
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    } else {
      toast({
        variant: "destructive",
        title: "Print Blocked",
        description: "Please allow popups to print invoices.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card rounded-3xl border border-border shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Share2 className="w-5 h-5 text-primary animate-pulse" />
            Share Invoice
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Review, edit, copy, print or send the invoice for {order.customer_name || 'Customer'}.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Message Preview (Editable)
          </label>
          <div className="relative group">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="min-h-[280px] font-mono text-sm p-4 bg-muted/30 border border-border focus-visible:ring-primary rounded-2xl resize-y leading-relaxed text-foreground select-text"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 mt-4">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              className="rounded-2xl border-2 hover:bg-muted font-medium transition-all duration-200 flex items-center justify-center gap-1.5 py-5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs">Copy Text</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="rounded-2xl border-2 hover:bg-muted font-medium transition-all duration-200 flex items-center justify-center gap-1.5 py-5"
            >
              <Printer className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs">Print Bill</span>
            </Button>

            <Button
              type="button"
              onClick={handleSMSShare}
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-600/10 hover:shadow-blue-700/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-1.5 py-5"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">Send SMS</span>
            </Button>

            <Button
              type="button"
              onClick={handleWhatsAppShare}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-600/10 hover:shadow-emerald-700/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-1.5 py-5"
            >
              <Send className="w-4 h-4" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
