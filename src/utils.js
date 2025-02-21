export async function timer(ms = 1000) {
  return new Promise(r => setTimeout(r, ms))
}