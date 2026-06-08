import { apiClient } from "@/lib/api/client";
import type {
  BrandRecord,
  ApiKeyRecord,
  DeskRecord,
  ManagementListResponse,
  ManagementOverview,
  ManagementUsersResponse,
  IpRestrictionRecord,
  PermissionGroupRecord
} from "./types";

export function fetchManagementOverview() {
  return apiClient<ManagementOverview>("/api/management");
}

export function fetchBrands() {
  return apiClient<ManagementListResponse<BrandRecord>>("/api/management/brands");
}

export function fetchDesks() {
  return apiClient<ManagementListResponse<DeskRecord>>("/api/management/desks");
}

export function fetchPermissionGroups() {
  return apiClient<ManagementListResponse<PermissionGroupRecord>>("/api/management/permission-groups");
}

export function fetchManagementUsers() {
  return apiClient<ManagementUsersResponse>("/api/management/users");
}

export function fetchApiKeys() {
  return apiClient<ManagementListResponse<ApiKeyRecord>>("/api/management/api-keys");
}

export function fetchIpRestrictions() {
  return apiClient<ManagementListResponse<IpRestrictionRecord>>("/api/management/ip-restrictions");
}
