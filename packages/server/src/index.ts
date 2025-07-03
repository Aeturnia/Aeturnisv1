export const greet = (name: string): string => {
  return `Hello, ${name}! Welcome to Aeturnis Online.`;
};

// Simple server startup for future use
if (require.main === module) {
  console.log(greet('World'));
}