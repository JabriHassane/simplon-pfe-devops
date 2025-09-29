import { Router } from "react-router-dom";

// nav.ts
let _navigate: (to: string, opts?: { replace?: boolean }) => void;

export const setNavigator = (fn: typeof _navigate) => {
  _navigate = fn;
};

export const navigate = (to: string, opts?: { replace?: boolean }) => {
  if (_navigate) {
    _navigate(to, opts);
  } else {
    // Fallback if navigate isn't ready yet
    // window.location.assign(to);
    console.log("Router not available")
  }
};