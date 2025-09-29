// NavBinder.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigator } from "../utils/nav.utils";

export default function NavBinder() {
  const navigate = useNavigate();
  useEffect(() => setNavigator(navigate), [navigate]);
  return null;
}