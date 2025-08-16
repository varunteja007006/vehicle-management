import NavbarClient from "./NavbarClient";

export default function Navbar() {
  return (
    <nav className="flex flex-row gap-5 items-center justify-between p-4 bg-primary/20">
      <h1 className="font-bold text-2xl">Velo</h1>
      <div className="flex flex-row items-center gap-5">
        <NavbarClient />
      </div>
    </nav>
  );
}
