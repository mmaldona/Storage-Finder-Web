import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { X, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodeModalProps {
  spaceName: string;
  spaceId: string;
  onClose: () => void;
}

export function QRCodeModal({ spaceName, spaceId, onClose }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrValue = `storagefinder://space/${spaceId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrValue, {
        width: 240,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
    }
  }, [qrValue]);

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    // Build HTML via string concatenation to avoid template-literal/script-tag parsing issues
    const html =
      "<!DOCTYPE html><html><head><title>QR Code - " +
      spaceName +
      "</title><style>" +
      "body{margin:0;display:flex;flex-direction:column;justify-content:center;" +
      "align-items:center;min-height:100vh;background:white;font-family:sans-serif;}" +
      "img{max-width:300px;width:100%;}" +
      "p{margin-top:12px;font-size:16px;color:#333;font-weight:600;}" +
      "</style></head><body>" +
      "<img src='" + imgData + "'/>" +
      "<p>" + spaceName + "</p>" +
      "</body></html>";
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // On iOS, download attribute is unsupported — open in new tab for long-press save
      window.open(dataUrl, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = spaceName + "-QR.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <h2 className="mb-1 pr-10 text-lg font-semibold text-foreground">
          {spaceName}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">Scan to open this storage space</p>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <p className="mt-3 text-center font-mono text-xs text-muted-foreground/70">
          {qrValue}
        </p>

        {/* Print button */}
        <Button
          className="mt-6 h-12 w-full gap-2 bg-primary text-base text-primary-foreground hover:bg-primary/90"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>

        {/* Save Image button */}
        <Button
          variant="outline"
          className="mt-3 h-12 w-full gap-2 text-base"
          onClick={handleSaveImage}
        >
          <Download className="h-4 w-4" />
          Save Image
        </Button>
      </div>
    </div>
  );
}
