import axios, { AxiosResponse } from "axios";
import CryptoJS from "crypto-js";
import { getDeviceId } from "@/utils/device-id";
import { getValidAppToken } from "./token-manage";
import { NextRequest } from "next/server";
// ============================
// Ambil SECRET untuk signature
// ============================
const getSecret = (): string => {
  const secret = process.env.SIGNATURE_SECRET;
  if (!secret) throw new Error("API Secret not found");
  return secret;
};

// Generate signature unik per request
export const generateSignature = (): { timestamp: string; hmac: string } => {
  const timestamp = new Date().toISOString();
  const secret = getSecret();

  const hmac = CryptoJS.HmacSHA256(timestamp, secret).toString(CryptoJS.enc.Hex);
  return { timestamp, hmac };
};

// Cek apakah dijalankan di server
const isServer = typeof window === "undefined";

// Definisikan tipe req optional
type NextRequestLike = {
  headers?: Record<string, string>;
  [key: string]: unknown;
};


// Ambil appToken dari session
// export const getAppToken = async (_req?: NextRequestLike): Promise<string | undefined> => {
//   try {
//     // if (isServer) {
//       const session = await getServerSession(authOptions);
//       return session?.appToken ?? undefined;
//     // } else {
//     //   const session = await getSession();
//     //   return session?.appToken ?? undefined;
//     // }
//   } catch (error) {
//     console.error("❌ Failed to get appToken:", error);
//     return undefined;
//   }
// };



// ============================
// Axios instance + interceptor
// ============================
const apiClient = axios.create({
  timeout: 15000, // 15 detik
});

apiClient.interceptors.response.use(
  (response) => {
    // ✅ Jika respons sukses, langsung return data
    return response;
  },
  (error) => {
    const data = error.response?.data;
    // ✅ Kalau server kirim JSON error, jangan lempar Error — return response palsu dengan data server
    if (data && typeof data === "object") {
      return Promise.resolve({
        ...error.response,
        data, // tetap berisi data dari server
      });
    }

    // ✅ Kalau tidak ada data dari server, baru lempar error jaringan
    const message =
      error.message || "A connection error occurred while contacting the server.";
    console.error("[API ERROR]", message);

    return Promise.resolve({
      data: {
        success: false,
        message,
        statusCode: error.response?.status || 500,
      },
      status: error.response?.status || 500,
      headers: {},
      config: error.config,
      statusText: error.response?.statusText || "Network Error",
    });
  }
);

// ============================
// GET request dengan signature
// ============================
export const getWithSignature = async <T = unknown>(
  req: NextRequest,
  url: string,
  params?: Record<string, string | number | boolean>,
  origin?: string,
): Promise<T> => {
  const { timestamp, hmac } = generateSignature();
  // const appToken = await getAppToken(_req);
  const appToken = await getValidAppToken(req);
  // console.log(appToken);
  const deviceId = await getDeviceId();
  const response: AxiosResponse<T> = await apiClient.get(url, {
    
    headers: {
      "X-Timestamp": timestamp,
      "X-Signature": hmac,
      "X-DeviceId": deviceId,
      "X-ORIGIN": origin ?? "",
      ...(appToken && { Authorization: `Bearer ${appToken}` }),
    },
    params,
  });
  console.log(response);
  return response.data;
};

// ============================
// POST request dengan signature
// ============================
export const postWithSignature = async <T = unknown>(
  req: NextRequest,
  url: string,
  data: Record<string, unknown> | FormData,
  origin?: string,
): Promise<T> => {
  const { timestamp, hmac } = generateSignature();
  // const appToken = await getAppToken(_req);
  const appToken = await getValidAppToken(req);

  // Deteksi apakah data = FormData
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const deviceId = await getDeviceId();
  const response: AxiosResponse<T> = await apiClient.post(url, data, {
    headers: {
      "X-Timestamp": timestamp,
      "X-Signature": hmac,
      "X-DeviceId": deviceId,
      "X-ORIGIN": origin ?? "",
      ...(appToken && { Authorization: `Bearer ${appToken}` }),
      ...(isFormData ? {} : { "Content-Type": "application/json" }), //biarkan axios set otomatis kalau FormData
    },
  });
  console.log(response);
  return response.data;
};

// ============================
// PUT request dengan signature
// ============================
export const putWithSignature = async <T = unknown>(
  req: NextRequest,
  url: string,
  data: Record<string, unknown> | FormData,
  origin?: string,
): Promise<T> => {
  const { timestamp, hmac } = generateSignature();
  // const appToken = await getAppToken(_req);
  const appToken = await getValidAppToken(req);

  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const deviceId = await getDeviceId();
  const response: AxiosResponse<T> = await apiClient.put(url, data, {
    headers: {
      "X-Timestamp": timestamp,
      "X-Signature": hmac,
      "X-DeviceId": deviceId,
      "X-ORIGIN": origin ?? "",
      ...(appToken && { Authorization: `Bearer ${appToken}` }),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });

  return response.data;
};

// ============================
// PATCH request dengan signature
// ============================
export const patchWithSignature = async <T = unknown>(
  req: NextRequest,
  url: string,
  data: Record<string, unknown> | FormData,
  origin?: string,
): Promise<T> => {
  const { timestamp, hmac } = generateSignature();
  // const appToken = await getAppToken(_req);
  const appToken = await getValidAppToken(req);
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  
  const deviceId = await getDeviceId();
  const response: AxiosResponse<T> = await apiClient.patch(url, data, {
    headers: {
      "X-Timestamp": timestamp,
      "X-Signature": hmac,
      "X-DeviceId": deviceId,
      "X-ORIGIN": origin ?? "",
      ...(appToken && { Authorization: `Bearer ${appToken}` }),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });

  return response.data;
};

// ============================
// DELETE request dengan signature
// ============================
export const deleteWithSignature = async <T = unknown>(
  req: NextRequest,
  url: string,
  origin?: string,
): Promise<T> => {
  const { timestamp, hmac } = generateSignature();
  // const appToken = await getAppToken(_req);
  const appToken = await getValidAppToken(req);
  const deviceId = await getDeviceId();
  const response: AxiosResponse<T> = await apiClient.delete(url, {
    headers: {
      "X-Timestamp": timestamp,
      "X-Signature": hmac,
      "X-DeviceId": deviceId,
      "X-ORIGIN": origin ?? "",
      ...(appToken && { Authorization: `Bearer ${appToken}` }),
    },
  });

  return response.data;
};