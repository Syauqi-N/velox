import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = {
  Produk: [
    { label: "Fitur", href: "#fitur" },
    { label: "Kenapa Velox", href: "#kenapa" },
    { label: "Harga", href: "#harga" },
  ],
  Komunitas: [
    { label: "FAQ", href: "#faq" },
    { label: "Masuk", href: "/login" },
    { label: "Daftar", href: "/signup" },
  ],
  Legal: [
    { label: "Kebijakan Privasi", href: "#" },
    { label: "Syarat & Ketentuan", href: "#" },
  ],
} as const;

export default function Footer() {
  return (
    <footer className="bg-[var(--brand-navy-deep)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image
              src="/logos/velox-white-monochrome.png"
              alt="VELOX"
              width={180}
              height={52}
              className="h-12 w-auto object-contain"
            />
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              Komunitas investasi saham Indonesia — riset, diskusi, dan trading
              calls dalam satu circle privat.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white/90">{title}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Velox Capital. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-white/40">
            <span className="text-xs">Komunitas privat — invite only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
