import Image from "next/image";
import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center">
      {/* Desktop: horizontal logo */}
      <Image
        src="/logos/velox-primary-horizontal.png"
        alt="Velox Capital"
        width={220}
        height={56}
        className="hidden h-13 w-auto object-contain sm:block"
        priority
      />
      {/* Mobile: compact logo (1920x630, ~3:1 ratio) */}
      <Image
        src="/logos/velox-primary-compact.png"
        alt="Velox Capital"
        width={122}
        height={40}
        className="h-10 w-auto object-contain sm:hidden"
        priority
      />
    </Link>
  );
}
