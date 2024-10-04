import WalletMultiButton from "./wallet-multi-button";

import Image from "next/image";
import SolanaLogo from "../../public/solanaLogo.svg";

export function NavBar() {
  return (
    <div className="flex justify-around bg-[#050816] items-center border border-black m-auto  p-5">
      <div className="hidden md:block">
      <Image src={SolanaLogo} alt="Solana Logo" width={200} height={200} />
      </div>
      <WalletMultiButton />
    </div>
  );
}
