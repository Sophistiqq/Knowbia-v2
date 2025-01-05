// utils/Sudo.ts
export function checkSudo() {
  const sudoData = localStorage.getItem('sudoData')
  if (sudoData) {
    const { isSudo, expiryAt } = JSON.parse(sudoData)
    if (isSudo === 'true' && new Date(expiryAt) > new Date()) {
      return true
    } else if (new Date(expiryAt) <= new Date()) {
      localStorage.setItem('sudoData', JSON.stringify({ isSudo: 'false', expiryAt: '' }))
      return false
    }
  }
  return false
}

export async function setSudo() {
  const expiryAt = new Date(new Date().getTime() + 5 * 60000).toISOString() // 5 minutes
  const sudoData = JSON.stringify({ isSudo: 'true', expiryAt })
  localStorage.setItem('sudoData', sudoData)
}

export async function confirmSudo(password: string) {
  const user_info = JSON.parse(localStorage.getItem('user_info'))
  if (user_info.sudo_password === password) {
    await setSudo()
    return { status: 'success', message: 'Sudo mode enabled for 5 minutes' }
  }
  return { status: 'error', message: 'Incorrect password' }
}

export function clearSudo() {
  localStorage.setItem('sudoData', JSON.stringify({ isSudo: 'false', expiryAt: '' }))
}
