"use client";

import { create } from "zustand";

export type CrmListKey = "clients" | "leads" | "tasks";

type CrmListState = {
  q: string;
  status: string;
  stage: string;
  tag: string;
  page: number;
  pageSize: number;
};

type CrmStore = {
  lists: Record<CrmListKey, CrmListState>;
  setListFilter: (key: CrmListKey, filter: Partial<CrmListState>) => void;
  resetList: (key: CrmListKey) => void;
};

const defaultListState: CrmListState = {
  q: "",
  status: "",
  stage: "",
  tag: "",
  page: 1,
  pageSize: 10
};

export const useCrmStore = create<CrmStore>((set) => ({
  lists: {
    clients: defaultListState,
    leads: defaultListState,
    tasks: defaultListState
  },
  setListFilter: (key, filter) =>
    set((state) => ({
      lists: {
        ...state.lists,
        [key]: {
          ...state.lists[key],
          ...filter,
          page: filter.page ?? 1
        }
      }
    })),
  resetList: (key) =>
    set((state) => ({
      lists: {
        ...state.lists,
        [key]: defaultListState
      }
    }))
}));
