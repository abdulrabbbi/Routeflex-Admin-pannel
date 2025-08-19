export const getImageUrl = (path: string | undefined) => {
  if (!path) return "/placeholder.svg"
  return path.startsWith("http")
    ? path
    : `http://localhost:5000${path}`
}
