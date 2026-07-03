"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import d from "@/lib/decryptor";

export const TRANSACTION_CATEGORY = {
  WITHDRAW: "1",
  DEPOSIT: "2",
} as const;

export const TRANSACTION_TITLE = {
  [TRANSACTION_CATEGORY.WITHDRAW]: "Tarikan Tunai",
  [TRANSACTION_CATEGORY.DEPOSIT]: "Setoran Tunai",
} as const;

export const WITHDRAW_COOKIE = "withdraw";
export const DEPOSIT_COOKIE = "deposit";

const CATEGORY_STORAGE_KEY = "category";
const CATEGORY_CHANGE_EVENT = "ebranch:category-change";

export type TransactionCategory =
  (typeof TRANSACTION_CATEGORY)[keyof typeof TRANSACTION_CATEGORY];

export type TransactionForm = Record<string, string>;

function isTransactionCategory(
  value: string | null
): value is TransactionCategory {
  return (
    value === TRANSACTION_CATEGORY.WITHDRAW ||
    value === TRANSACTION_CATEGORY.DEPOSIT
  );
}

export function getStoredTransactionCategory(): TransactionCategory | null {
  if (typeof window === "undefined") return null;

  const category = window.localStorage.getItem(CATEGORY_STORAGE_KEY);

  return isTransactionCategory(category) ? category : null;
}

export function setStoredTransactionCategory(category: TransactionCategory) {
  window.localStorage.setItem(CATEGORY_STORAGE_KEY, category);
  window.dispatchEvent(new Event(CATEGORY_CHANGE_EVENT));
}

export function clearStoredTransactionCategory() {
  window.localStorage.removeItem(CATEGORY_STORAGE_KEY);
  window.dispatchEvent(new Event(CATEGORY_CHANGE_EVENT));
}

export function useStoredTransactionCategory() {
  const [category, setCategory] = useState<TransactionCategory | null>(null);

  useEffect(() => {
    const syncCategory = () => {
      setCategory(getStoredTransactionCategory());
    };

    queueMicrotask(syncCategory);
    window.addEventListener("storage", syncCategory);
    window.addEventListener(CATEGORY_CHANGE_EVENT, syncCategory);

    return () => {
      window.removeEventListener("storage", syncCategory);
      window.removeEventListener(CATEGORY_CHANGE_EVENT, syncCategory);
    };
  }, []);

  return category;
}

export function useStoredCookie(cookieName: string) {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setValue(Cookies.get(cookieName) ?? null);
    });
  }, [cookieName]);

  return value;
}

export function readEncryptedCookie<T extends object>(
  cookieName: string
): Partial<T> | null {
  const cookie = Cookies.get(cookieName);

  if (!cookie) return null;

  try {
    const decrypted = d(cookie);

    if (!decrypted) return null;

    return JSON.parse(decrypted) as Partial<T>;
  } catch {
    return null;
  }
}

export function getTransactionFormByCategory(
  category: TransactionCategory | null
): TransactionForm | null {
  if (category === TRANSACTION_CATEGORY.WITHDRAW) {
    return readEncryptedCookie<TransactionForm>(WITHDRAW_COOKIE) as TransactionForm | null;
  }

  if (category === TRANSACTION_CATEGORY.DEPOSIT) {
    return readEncryptedCookie<TransactionForm>(DEPOSIT_COOKIE) as TransactionForm | null;
  }

  return null;
}

export function clearTransactionDraftCookies() {
  Cookies.remove(WITHDRAW_COOKIE);
  Cookies.remove(DEPOSIT_COOKIE);
}

export function clearTransactionSession() {
  Cookies.remove("reffid");
  Cookies.remove("branchId");
  clearTransactionDraftCookies();
  clearStoredTransactionCategory();
}
