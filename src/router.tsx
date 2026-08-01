import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import Layout from "@/layouts/LauncherLayout"
import Search from "@/routes/search/search"
import Settings from "@/routes/setting/settings"
import IframePage from "@/routes/IframePage"

function PWARedirect() {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get("src") === "pwa_install") {
      navigate("/launcher", { replace: true })
    }
  }, [location, navigate])
  return null
}

export default function Router() {
  return (
    <BrowserRouter>
      <PWARedirect />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/iframe" element={<IframePage />} />
      </Routes>
    </BrowserRouter>
  )
}