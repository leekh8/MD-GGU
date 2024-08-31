import React, { useEffect, useState } from "react";
import { getServerStatus } from "../api";
import { useAuth } from "../components/AuthProvider";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getServerStatus();
        setServerStatus(response.data);
      } catch (error) {
        console.error("Failed to fetch server status: ", error);
        setServerStatus({ error: "Failed to fetch status" });
      }
    };
    fetchStatus();
  }, []);

  if (user.role !== "ADMIN") {
    return <Navigate to="/" />; // 관리자가 아니면 홈으로 리다이렉트
  }

  return (
    <div>
      <h1>{t("adminPage")}</h1>
      <p>{t("serverStatus")}:</p>
      <pre>
        {serverStatus ? JSON.stringify(serverStatus, null, 2) : t("loading")}
      </pre>
    </div>
  );
};
