import { useMemo } from "react";

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function addressToColors(address: string): [string, string, string] {
  const h = hashCode(address);
  const h1 = h % 360;
  const h2 = (h1 + 137) % 360;
  const h3 = (h1 + 274) % 360;
  return [
    `hsl(${h1}, 70%, 55%)`,
    `hsl(${h2}, 65%, 50%)`,
    `hsl(${h3}, 60%, 45%)`,
  ];
}

interface IdenticonProps {
  address: string;
  size?: number;
  className?: string;
}

export default function Identicon({ address, size = 40, className = "" }: IdenticonProps) {
  const [c1, c2, c3] = useMemo(() => addressToColors(address), [address]);
  const angle = useMemo(() => hashCode(address) % 360, [address]);

  return (
    <div
      className={`rounded-full shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(${angle}deg, ${c1}, ${c2}, ${c3})`,
      }}
      aria-hidden="true"
    />
  );
}
