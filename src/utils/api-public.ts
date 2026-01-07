import axios from "axios";
import { generateSignature } from "./api";
import { getDeviceId } from "@/utils/device-id";
import { time } from "console";

export async function postPublic<T>(
  url: string,
  data: Record<string, unknown>
): Promise<T> {
  const { timestamp, hmac } = generateSignature();
  const deviceId = await getDeviceId();

  // console.log(timestamp);
  // console.log(hmac);
  // console.log(deviceId);
  const res = await axios.post<T>(url, data, {
    headers: {
      "X-Timestamp": timestamp,
      "X-Signature": hmac,
      "X-DeviceId": deviceId,
    },
  });
  
  // console.log(res);
  return res.data;
}
