import Image from "next/image";
export function AuthHeader() {
  return <header className="relative flex h-16 shrink-0 items-center justify-center bg-brand" data-node-id="1:3"><Image src="/logo.jpg" alt="MeePro" width={52} height={51} priority className="h-[51px] w-[52px] object-cover" /></header>;
}
