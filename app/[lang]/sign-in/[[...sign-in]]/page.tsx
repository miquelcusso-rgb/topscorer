import { SignIn } from '@clerk/nextjs'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>
}) {
  const { redirect_url } = await searchParams
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0a0908' }}
    >
      <SignIn forceRedirectUrl={redirect_url ?? '/'} />
    </div>
  )
}
