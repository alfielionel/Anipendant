import { Outlet } from 'react-router-dom'
import NavBar from '@/components/NavBar'
import PinGate from '@/features/auth/PinGate'

export default function Layout() {
  return (
    <>
      <PinGate />
      <NavBar />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  )
}
