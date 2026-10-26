import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session"; 
import HeaderClient from "./header/HeaderClient";

async function HeaderAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  let user = null;
  if (token) {
    const decoded = await verifyToken(token);
    if (decoded) {
      // Map the JWT payload to the user object HeaderClient expects
      user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.fullName, // <-- Mapping fullName to name
        role: decoded.role
      };
    }
  }

  return <HeaderClient user={user} />;
}

function HeaderAuthFallback() {
  return <HeaderClient user={null} />;
}

export default function MainHeader() {
  return (
    <div className="sticky top-0 z-50 w-full flex flex-col bg-white">
      
      {/* TOP BANNER */}
      <div className="w-full bg-[#F3F0FF] text-[var(--theme-accent)] text-[11px] font-medium tracking-wide text-center py-2 px-4 border-b border-[#E5DEFF]">
        ✨ Complimentary shipping on all orders over $50 — Use code <span className="font-bold underline underline-offset-2">FRESH50</span>
      </div>

      {/* MAIN HEADER */}
      <header className="w-full px-4 md:px-6 bg-white border-b border-gray-200">
        <div className="mx-auto flex h-16 md:h-20 w-full max-w-[1400px] items-center relative">
          
          <div className="absolute left-0 flex items-center justify-start z-20">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-80 outline-none">
              <span className="font-medium text-[20px] tracking-wide text-black whitespace-nowrap">
                Fresh <span className="text-[var(--theme-accent)]">&</span> Fragrant
              </span>
            </Link>
          </div>

          <div className="w-full h-full">
            <Suspense fallback={<HeaderAuthFallback />}>
              <HeaderAuth />
            </Suspense>
          </div>

        </div>
      </header>
    </div>
  );
}
