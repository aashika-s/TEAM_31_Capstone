import { IconCamera } from "@tabler/icons-react";

export default function ScanBox({ onClick, title = "Scan a product label", sub = "Point your camera at the label or upload an image" }) {
  return (
    <div
      onClick={onClick}
      className="border-[1.5px] border-dashed border-border-secondary rounded-app-lg py-7 px-4 text-center text-text-secondary mb-3 cursor-pointer"
    >
      <IconCamera size={32} className="text-accent mx-auto mb-2" />
      <p className="text-sm font-medium text-text-primary mb-1">{title}</p>
      <p className="text-[13px]">{sub}</p>
    </div>
  );
}
