import { DashboardLayout } from './components'

export default function Dashboard({children}: {children: React.ReactNode}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}