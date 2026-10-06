import Image from "next/image";
export function AuthHeader() {
  return (
    <header className="relative flex h-16 shrink-0 items-center justify-center bg-brand" data-node-id="1:3">
      <img src="/brand-logo.png" alt="MeePro" className="h-9 w-auto object-contain" />
    </header>
  );
}
