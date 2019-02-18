const { StartTagToken, EndTagToken } = require('./lexer')

class HTMLDocument {
  constructor () {
    this.isDocument = true
    this.childNodes = []
  }
}
class Node {}
class Element extends Node {
  constructor (token) {
    super(token)
    for (const key in token) {
      this[key] = token[key]
    }
    this.childNodes = []
  }
  [Symbol.toStringTag] () {
    return `Element<${this.name}>`
  }
}
class Text extends Node {
  constructor (value) {
    super(value)
    this.value = value || ''
  }
}

function HTMLSyntaticalParser () {
  const stack = [new HTMLDocument]

  this.receiveInput = function (token) {
    if (typeof token === 'string') {
      if (getTop(stack) instanceof Text) {
        getTop(stack).value += token
      } else {
        let t = new Text(token)
        getTop(stack).childNodes.push(t)
        stack.push(t)
      }
    } else if (getTop(stack) instanceof Text) {
      stack.pop()
    }

    if (token instanceof StartTagToken) {
      let e = new Element(token)
      getTop(stack).childNodes.push(e)
      return stack.push(e)
    }
    if (token instanceof EndTagToken) {
      return stack.pop()
    }
  }

  this.getOutput = () => stack[0]
}

function getTop (stack) {
  return stack[stack.length - 1]
}

module.exports = {
  HTMLSyntaticalParser
}
