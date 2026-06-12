import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="w-full fixed z-50 bg-('b--bg-primary')">
      <div className="wrapper navbar-height py-4 flex justify-between items-center">
        <Link href="/" className="flex gap-0.5 items-center">
          <Image src="/assets/logo.png" alt="Logo" width={50} height={50} />
          <span className="logo-text">Shelf Aware</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
