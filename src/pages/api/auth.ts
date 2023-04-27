import type { APIRoute } from 'astro'

const realPassword = import.meta.env.SITE_PASSWORD || ''
const passList = realPassword.split(',') || []
export const post: APIRoute = async (context) => {
  const body = await context.request.json();

  const {param1,param2,signature} = body;
  const secretKey = import.meta.env.SECRET_KEY;

  async function createSha256Hash(data: string , secretKey: string) {
    const encoder = new TextEncoder();
    const dataUint8Array = encoder.encode(data);
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureArrayBuffer = await crypto.subtle.sign("HMAC", key, dataUint8Array);
    const signatureUint8Array = new Uint8Array(signatureArrayBuffer);
    const signatureHex = Array.from(signatureUint8Array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return signatureHex;
  }

  const data = param1 + param2;
  const generatedSignature = await createSha256Hash(data, secretKey);
  const isValidSignature = generatedSignature === signature;


  if (isValidSignature) {
    // Check if param2 is within the 24-hour range
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const param2Time = parseInt(param2);

    if (currentTime >= param2Time && currentTime <= param2Time + 86400) {
      // Param2 is within the 24-hour range
      return new Response(
        JSON.stringify({
          code: 0,
        })
      );
    } else {
      // Param2 is outside the 24-hour range
      return new Response(
        JSON.stringify({
          code: -2,
        })
      );
    }
  } else {
    // Signature is not valid
    return new Response(
      JSON.stringify({
        code: -1,
      })
    );
  }

 
};
