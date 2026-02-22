"use client";

import { atom } from "jotai";
import type { Wish } from "./types";

export const userIdAtom = atom<string | null>(null);
export const wishCountAtom = atom<number>(0);
export const wishesAtom = atom<Wish[]>([]);
export const nextTokenAtom = atom<string | null>(null);
export const loadingAtom = atom<boolean>(false);
export const hasMoreAtom = atom<boolean>(true);
export const releasePlayingAtom = atom<boolean>(false);
