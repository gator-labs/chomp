import { sum } from "../app/actions/test";


console.log("Sum result:"); 

test("should return the sum of two numbers", () => {
  const result = sum(2, 5);
  console.log("Sum result:", result); 
  expect(result).toBe(7);
});
