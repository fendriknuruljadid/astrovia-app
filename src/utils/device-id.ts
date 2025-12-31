import { cookies } from "next/headers";

export const getDeviceIdServer = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get("device_id")?.value;
};

export const getDeviceIdClient = (): string | undefined => {
    if (typeof document === "undefined") return undefined;
  
    const match = document.cookie.match(/device_id=([^;]+)/);
    return match?.[1];
};
  
export const getDeviceId = async (): Promise<string | undefined> => {
    if (typeof window === "undefined") {
      return await getDeviceIdServer();
    }
    return getDeviceIdClient();
};
