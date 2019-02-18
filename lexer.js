const EOF = void 0

function HTMLLexicalParser (syntaxer) {
  let state = data
  let token = null
  let attribute = null
  let characterReference = ''

  this.receiveInput = function (char) {
    if (state == null) {
      throw new Error('there is an error')
    } else {
      state = state(char)
    }
  }

  this.reset = function () {
    state = data
  }

  function data (c) {
    switch (c) {
      case '&':
        return characterReferenceInData

      case '<':
        return tagOpen

      // perhaps will not encounter in javascript?
      // case '\0':
      //   error()
      //   emitToken(c)
      //   return data

      //  can be handle by default case
      // case EOF:
      //   emitToken(EOF)
      //   return data

      default:
        emitToken(c)
        return data
    }
  }

  // only handle right character reference
  function characterReferenceInData (c) {
    if (c === ';') {
      characterReference += c
      emitToken(characterReference)
      characterReference = ''
      return data
    } else {
      characterReference += c
      return characterReferenceInData
    }
  }

  function tagOpen (c) {
    if (c === '/') {
      return endTagOpen
    }
    if (/[a-zA-Z]/.test(c)) {
      token = new StartTagToken()
      token.name = c.toLowerCase()
      return tagName
    }
    // no need to handle this
    // if (c === '?') {
    //   return bogusComment
    // }
    return error(c)
  }


  function tagName (c) {
    if  (c === '/') {
      return selfClosingTag
    }
    if  (/[\t \f\n]/.test(c)) {
      return beforeAttributeName
    }
    if (c === '>') {
      emitToken(token)
      return data
    }
    if (/[a-zA-Z]/.test(c)) {
      token.name += c.toLowerCase()
      return tagName
    }
  }

  function beforeAttributeName (c) {
    if (/[\t \f\n]/.test(c)) {
      return beforeAttributeName
    }
    if (c === '/') {
      return selfClosingTag
    }
    if (c === '>') {
      emitToken(token)
      return data
    }
    if (/["'<]/.test(c)) {
      return error(c)
    }

    attribute = new Attribute()
    attribute.name = c.toLowerCase()
    attribute.value = ''
    return attributeName
  }

  function attributeName (c) {
    if (c === '/') {
      token[attribute.name] = attribute.value
      return selfClosingTag
    }
    if (c === '=') {
      return beforeAttributeValue
    }
    if (/[\t \f\n]/.test(c)) {
      return beforeAttributeName
    }
    attribute.name += c.toLowerCase()
    return attributeName
  }

  function beforeAttributeValue (c) {
    if (c === '"') {
      return attributeValueDoubleQuoted
    }
    if (c === "'") {
      return attributeValueSingleQuoted
    }
    if (/\t \f\n/.test(c)) {
      return beforeAttributeValue
    }
    attribute.value += c
    return attributeValueUnquoted
  }

  function attributeValueDoubleQuoted (c) {
    if (c === '"') {
      token[attribute.name] = attribute.value
      return beforeAttributeName
    }
    attribute.value += c
    return attributeValueDoubleQuoted
  }

  function attributeValueSingleQuoted (c) {
    if (c === "'") {
      token[attribute.name] = attribute.value
      return beforeAttributeName
    }
    attribute.value += c
    return attributeValueSingleQuoted
  }

  function attributeValueUnquoted (c) {
    if (/[\t \f\n]/.test(c)) {
      token[attribute.name] = attribute.value
      return beforeAttributeName
    }
    attribute.value += c
    return attributeValueUnquoted
  }

  function selfClosingTag (c) {
    if (c === '>') {
      emitToken(token)
      endToken = new EndTagToken()
      endToken.name = token.name
      emitToken(endToken)
      return data
    }
  }

  function endTagOpen (c) {
    if (/[a-zA-Z]/.test(c)) {
      token = new EndTagToken()
      token.name = c.toLowerCase()
      return tagName
    }
    if (c === '>') {
      return error(c)
    }
  }

  function emitToken (token) {
    syntaxer.receiveInput(token)
  }

  function error (c) {
    console.log(`warn: unexpected char '${c}'`)
  }
}

class StartTagToken {}

class EndTagToken {}

class Attribute {}

module.exports = {
  HTMLLexicalParser,
  StartTagToken,
  EndTagToken
}
