"use client";

import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Library", href: "/" },
  { label: "Add New", href: "/books/new" },
];

const Navbar = () => {
  const pathName = usePathname();
  const { user } = useUser();

  return (
    <header className="w-full fixed z-50 bg-('b--bg-primary')">
      <div className="wrapper navbar-height py-4 flex justify-between items-center">
        <Link href="/" className="flex gap-0.5 items-center">
          <Image src="/assets/logo.png" alt="Logo" width={50} height={50} />
          <span className="logo-text">Shelf Aware</span>
        </Link>

        <nav className="w-fit flex gap-7.5 items-center">
          {navItems.map(({ label, href }) => {
            const isActive =
              pathName === href || (href !== "/" && pathName.startsWith(href));

            return (
              <Link
                href={href}
                key={label}
                className={cn(
                  "nav-link-base",
                  isActive ? "nav-link-active" : "text-black hover:opacity-70",
                )}
              >
                {label}
              </Link>
            );
          })}
          <Show when="signed-out">
            <SignInButton />
            <SignUpButton />
          </Show>
          <Show when="signed-in">
            <UserButton />
            {user?.firstName && (
              <Link href="subscriptions" className="nav-user-name">
                {user.firstName}
              </Link>
            )}
          </Show>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
