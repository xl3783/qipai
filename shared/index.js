// shared/MyCommonClass.js
class MyCommonClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}!`;
  }
}

module.exports = MyCommonClass;
