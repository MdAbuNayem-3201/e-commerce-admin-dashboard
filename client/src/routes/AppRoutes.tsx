import { Routes, Route } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";

import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";

import PermissionPage from "../pages/permission/PermissionPage";
import PermissionGroupPage from "../pages/permission-group/PermissionGroupPage";

import RolePage from "../pages/role/RolePage";
import UserPage from "../pages/user/UserPage";

import CategoryPage from "../pages/category/CategoryPage";
import BrandPage from "../pages/brand/BrandPage";

import AttributePage from "../pages/attribute/AttributePage";
import MediaPage from "../pages/media/MediaPage";
import ProductPage from "../pages/product/ProductPage";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        <Route path="/permission-groups" element={<PermissionGroupPage />} />

        <Route path="/permissions" element={<PermissionPage />} />

        <Route path="/roles" element={<RolePage />} />

        <Route path="/users" element={<UserPage />} />

        <Route path="/categories" element={<CategoryPage />} />

        <Route path="/brands" element={<BrandPage />} />

        <Route path="/attributes" element={<AttributePage />} />

        <Route path="/media" element={<MediaPage />} />

        <Route path="/products" element={<ProductPage />} />
      </Route>
    </Routes>
  );
}
