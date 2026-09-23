"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const logo = (
    <Image
      src="/stayio-logo.svg"
      alt="Stayio"
      width={325}
      height={104}
      style={{ width: "325px", height: "auto" }}
      priority
    />
  );

  return <nav className="nav">{isHome ? logo : <Link href="/">{logo}</Link>}</nav>;
}
