export default function TestCenterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Testing Center Portal</h1>
        <p className="text-muted-foreground">
          Manage referrals, input test results, and track patient status
        </p>
      </div>
      <div>{children}</div>
    </div>
  )
}