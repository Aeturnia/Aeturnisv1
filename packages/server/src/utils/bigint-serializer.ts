/**
 * Utility to safely serialize objects containing BigInt values
 */

export function serializeBigInt(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
}

/**
 * Express middleware to automatically handle BigInt serialization in responses
 */
export function bigIntSerializer(req: any, res: any, next: any) {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Handle BigInt serialization
    const serialized = serializeBigInt(data);
    return originalJson.call(this, serialized);
  };
  
  next();
}