import Image from "next/image";

export function ProfileHeader({ avatarUrl, fullName, email }: Readonly<{ avatarUrl?: string; fullName: string; email: string }>) {
  return (
    <div className='mx-auto flex flex-col items-center justify-center gap-4 text-center'>
      <Image src={avatarUrl ?? "/placeholder.svg"} alt={fullName || "Profile"} width={100} height={100} className='rounded-full' priority />
      <div className='flex flex-row gap-4 items-baseline'>
        <h1 className='text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]'>{fullName}</h1>
      </div>
      <p className='text-muted-foreground'>{email}</p>
    </div>
  );
}
