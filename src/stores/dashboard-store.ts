import { create } from "zustand";

type DashboardState = {
  activePlatform: string;
  sidebarOpen: boolean;
  setActivePlatform: (platform: string) => void;
  setSidebarOpen: (open: boolean) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  activePlatform: "all",
  sidebarOpen: false,
  setActivePlatform: (platform) => set({ activePlatform: platform }),
  setSidebarOpen: (open) => set({ sidebarOpen: open })
}));
