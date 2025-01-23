import axios from "axios";
import { sign } from "./signer";

export async function send(payload: any, secret: string) {
  const jwtToken = sign(secret);

  try {
    const response = await axios.post(`http://localhost:8551`, payload, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error sending request:", error);
    throw error;
  }
}
