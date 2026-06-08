import { apiClient } from "@/lib/api/client";
import type { ExposureOverview } from "./types";

export function fetchExposureOverview() {
  return apiClient<ExposureOverview>("/api/exposure");
}
