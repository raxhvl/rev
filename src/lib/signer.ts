import crypto from "crypto";

const timestamp: number = Math.floor(Date.now() / 1000);

interface Payload {
  iat: number;
}

const payload: Payload = {
  iat: timestamp,
};

function base64url(source: Buffer): string {
  return source
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

interface Header {
  alg: string;
  typ: string;
}

export function sign(secret: string): string {
  const header: Header = { alg: "HS256", typ: "JWT" };

  const encodedHeader: string = base64url(Buffer.from(JSON.stringify(header)));
  const encodedPayload: string = base64url(
    Buffer.from(JSON.stringify(payload))
  );

  const signature: string = base64url(
    crypto
      .createHmac("sha256", Buffer.from(secret, "hex"))
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest()
  );

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
