import { useState } from "react";
import { Bitcoin } from "lucide-react";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

export default function ImageWithFallback({ fallbackClassName, className, alt, ...props }: Props) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    return (
      <div className={`flex items-center justify-center gradient-orange/20 bg-secondary ${fallbackClassName || className}`}>
        <Bitcoin className="h-12 w-12 text-primary/40" />
      </div>
    );
  }

  return (
    <div className={`relative ${fallbackClassName || ""}`}>
      {!loaded && (
        <div className={`absolute inset-0 bg-secondary animate-pulse ${fallbackClassName || className}`} />
      )}
      <img
        className={className}
        alt={alt}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
