"use client";

import { Button, ButtonProps } from "@/components/ui/button";

interface DownloadButtonProps extends ButtonProps {
  downloadUrl: string;
  filename?: string;
  buttonText?: string;
}

const DownloadButton = ({
  downloadUrl,
  filename,
  buttonText = "Descargar",
  ...props
}: DownloadButtonProps) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || downloadUrl.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={handleDownload} {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      {buttonText}
    </Button>
  );
};

export default DownloadButton;