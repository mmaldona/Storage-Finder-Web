import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";

type ScanState = "scanning" | "success" | "error";

const ScanQR = () => {
  const navigate = useNavigate();
  const { locations } = useStorageSpaces();
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [message, setMessage] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStarted = useRef<boolean>(false);

  const stopScanner = async () => {
    if (scannerRef.current && isStarted.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (_e) {
        // scanner already stopped
      }
      isStarted.current = false;
    }
  };

  const handleScanRef = useRef<(text: string) => void>();
  handleScanRef.current = async (text: string) => {
    await stopScanner();
    if (text.startsWith("storagefinder://space/")) {
      const spaceId = text.replace("storagefinder://space/", "");
      const loc = locations.find((l) => l.id === spaceId);
      if (loc) {
        setScanState("success");
        setMessage(`Opened: ${loc.name}`);
        setTimeout(() => navigate(`/location/${spaceId}`), 1200);
      } else {
        setScanState("error");
        setMessage("This QR code is not from StorageFinder");
      }
    } else {
      setScanState("error");
      setMessage("This QR code is not from StorageFinder");
    }
  };

  const startScanner = async () => {
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      stream.getTracks().forEach((t) => t.stop());
    } catch (_) {
      setScanState("error");
      setMessage(
        "Camera access is required to scan QR codes. Please allow camera access in your browser settings."
      );
      return;
    }
    setScanState("scanning");
  };

  // Initialize scanner whenever scanState becomes "scanning"
  useEffect(() => {
    if (scanState !== "scanning") return;

    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;
    let mounted = true;

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (isStarted.current && mounted) {
            handleScanRef.current?.(decodedText);
          }
        },
        () => {}
      )
      .then(() => {
        if (mounted) isStarted.current = true;
      })
      .catch(() => {
        if (mounted) {
          setScanState("error");
          setMessage(
            "Camera access is required to scan QR codes. Please allow camera access in your browser settings."
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, [scanState]);

  // Stop scanner and go back to wherever the user came from
  const handleCancel = async () => {
    await stopScanner();
    navigate(-1);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <h1 className="text-xl font-semibold text-foreground">Scan QR</h1>
        <p className="text-sm text-muted-foreground">Point your camera at a StorageFinder QR code</p>
      </div>

      {scanState === "success" ? (
        /* Success banner */
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
          <div className="max-w-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <p className="text-base font-semibold text-foreground">{message}</p>
            <p className="mt-1 text-sm text-muted-foreground">Opening now…</p>
          </div>
        </div>
      ) : scanState === "error" ? (
        /* Error state */
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="max-w-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="mb-6 text-base font-semibold text-foreground">{message}</p>
            <Button
              className="h-12 w-full gap-2 bg-primary text-base text-primary-foreground hover:bg-primary/90"
              onClick={startScanner}
            >
              <QrCode className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="ghost"
              className="mt-3 h-11 w-full text-muted-foreground"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        /* Scanning — live camera view */
        <div className="flex flex-1 flex-col">
          <div className="relative flex-1 bg-black">
            <div id="qr-reader" className="h-full w-full" />

            {/* Overlay frame */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-64 w-64">
                <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-md border-l-4 border-t-4 border-primary" />
                <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-md border-r-4 border-t-4 border-primary" />
                <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-md border-b-4 border-l-4 border-primary" />
                <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-md border-b-4 border-r-4 border-primary" />
              </div>
            </div>
          </div>

          {/* Cancel button */}
          <div className="border-t border-border bg-background px-6 py-4">
            <Button
              variant="outline"
              className="h-12 w-full gap-2 text-base"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanQR;
