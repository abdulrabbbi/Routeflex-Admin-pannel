
export const getImageUrl = (path: string | undefined) => {
  if (!path) return "/placeholder.svg"
  return path.startsWith("http")
    ? path
    : `${process.env.REACT_APP_BACKEND_URL}${path}`
}
