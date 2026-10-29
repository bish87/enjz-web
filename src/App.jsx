import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { LoadingScreen } from '@/components/common/Spinner'
import { RequireAuth, RequireRole } from '@/components/guards/RequireAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'

const Home = lazy(() => import('@/pages/Home'))
const Providers = lazy(() => import('@/pages/Providers'))
const ProviderDetail = lazy(() => import('@/pages/ProviderDetail'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Profile = lazy(() => import('@/pages/Profile'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const ProviderDashboard = lazy(() => import('@/pages/provider/ProviderDashboard'))
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'))
const AdminProviders = lazy(() => import('@/pages/admin/AdminProviders'))
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'))
const AdminAreas = lazy(() => import('@/pages/admin/AdminAreas'))

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="providers" element={<Providers />} />
          <Route path="providers/:id" element={<ProviderDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="provider"
          element={
            <RequireRole role="PROVIDER">
              <DashboardLayout role="provider" />
            </RequireRole>
          }
        >
          <Route index element={<ProviderDashboard />} />
        </Route>

        <Route
          path="admin"
          element={
            <RequireRole role="ADMIN">
              <DashboardLayout role="admin" />
            </RequireRole>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="areas" element={<AdminAreas />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
