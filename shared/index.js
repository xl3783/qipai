// shared/MyCommonClass.js
class MyCommonClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}!`;
  }
}

export default MyCommonClass;