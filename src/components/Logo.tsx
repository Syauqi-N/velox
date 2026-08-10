import Image from "next/image";
import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center">
      {/* Desktop: horizontal logo */}
      <Image
        src="/logos/velox-primary-horizontal.png"
        alt="Velox Capital"
        width={180}
        height={44}
        className="hidden h-10 w-auto object-contain sm:block"
        priority
      />
      {/* Mobile: compact logo */}
      <Image
        src="/logos/velox-primary-compact.png"
        alt="Velox Capital"
        width={40}
        height={40}
        className="h-10 w-auto object-contain sm:hidden"
        priority
      />
    </Link>
  );
}
