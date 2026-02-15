
import { VerificationForm } from "./form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-1">
      
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-center">
          <a href="/" className="flex items-center gap-2 font-medium">
          <Image
              className='dark:hidden'
              src="/full-logo-light.svg"
              alt="Astrovia Logo"
              width={150}
              height={50}
            />
            <Image
              className='hidden dark:block'
              src="/full-logo-dark.svg"
              alt="Astrovia Logo"
              width={150}
              height={50}
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <VerificationForm />
          </div>
        </div>
      </div>
      
    </div>
  )
}
