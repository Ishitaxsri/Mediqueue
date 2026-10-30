// Experiment 5: custom module exporting add, subtract, multiply, divide
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => (b === 0 ? 0 : a / b);

module.exports = { add, subtract, multiply, divide };
