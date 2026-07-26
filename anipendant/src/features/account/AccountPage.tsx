import { useAuth } from '@/hooks/useAuth'
import ChangePinForm from '@/features/account/ChangePinForm'
import ChangeApiForm from '@/features/account/ChangeApiForm'

export default function AccountPage() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="account-page">
      <h1>Account Settings</h1>

      <section className="account-section">
        <h2>Profile</h2>
        <div className="profile-info">
          <div className="profile-field">
            <span className="profile-label">Username</span>
            <span className="profile-value">{user.username}</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Email</span>
            <span className="profile-value">{user.email}</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Current API</span>
            <span className="profile-value">{user.selected_api}</span>
          </div>
        </div>
      </section>

      <section className="account-section">
        <ChangePinForm />
      </section>

      <section className="account-section">
        <ChangeApiForm />
      </section>

      <section className="account-section danger-zone">
        <h2>Sign Out</h2>
        <p>Sign out of your account on this device.</p>
        <button type="button" className="btn btn-danger" onClick={logout}>
          Sign Out
        </button>
      </section>
    </div>
  )
}
