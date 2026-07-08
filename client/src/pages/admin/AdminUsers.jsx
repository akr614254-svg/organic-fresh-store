import { useEffect, useState } from 'react'
import { fetchUsers, updateUserRole } from '../../services/adminService'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState(null)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    fetchUsers().then(setUsers).catch((err) => setError(err.message))
  }, [])

  const toggleRole = async (u) => {
    const nextRole = u.role === 'admin' ? 'customer' : 'admin'
    if (!confirm(`Change ${u.name}'s role to "${nextRole}"?`)) return
    setUpdatingId(u._id)
    try {
      const { user: updated } = await updateUserRole(u._id, nextRole)
      setUsers((prev) => prev.map((x) => (x._id === updated.id ? { ...x, role: updated.role } : x)))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-forest font-semibold mb-6">Users</h1>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      <div className="bg-white border border-forest/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sprout/20 text-left text-xs uppercase tracking-wide text-charcoal/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/5">
            {users?.map((u) => (
              <tr key={u._id}>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-charcoal/60">{u.email}</td>
                <td className="px-4 py-3 text-charcoal/50">
                  {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${u.role === 'admin' ? 'bg-turmeric/20 text-turmeric' : 'bg-sprout/40 text-forest'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {u._id !== me.id && (
                    <button
                      onClick={() => toggleRole(u)}
                      disabled={updatingId === u._id}
                      className="text-leaf hover:text-forest text-xs font-medium"
                    >
                      Make {u.role === 'admin' ? 'customer' : 'admin'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users?.length === 0 && <p className="text-sm text-charcoal/50 p-4">No users yet.</p>}
        {!users && !error && <p className="text-sm text-charcoal/50 p-4">Loading…</p>}
      </div>
    </div>
  )
}
