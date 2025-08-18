export default function FixUserLayout({
  children
}: {
  children: React.ReactNode
}) {
  // Simple layout without the user sync check to avoid redirect loops
  return <>{children}</>
}