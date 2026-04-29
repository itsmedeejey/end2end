export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const buf = Buffer.from(base64, "base64");

  //this return only the actual data by slicing the garbage data
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  );
}
