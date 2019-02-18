const EOF = void 0

function HTMLLexicalParser (syntaxer) {
  let state = data
  let token = null
  let attribute = null
  let characterReference = ''

  this.receiveInput = function (char) {
    state = state(char)
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
    if (/[A-Z]/.test(c)) {
      token = new StartTagToken(c.toLowerCase())
      return tagName
    }
    if (/[a-z]/.test(c)) {
      token = new StartTagToken(c)
      return tagName
    }
    // no need to handle this
    // if (c === '?') {
    //   return bogusComment
    // }
    error(c)
    return data
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
    if (/[a-z][A-Z]/.test(c`)) {
      token.name += c
    }
  }

  function beforeAttributeName (c) {

  }

  function selfClosingTag (c) {

  }

  function endTagOpen () {

  }

  function emitToken (token) {
    syntaxer.receiveInput(token)
  }

  function error (c) {
    console.log(`warn: unexpected char '${c}'`)
  }
}

class StartTagToken {
  constructor (name) {
    assert(typeof name === 'string')
    this.name = name
  }
}

class EndTagToken {
  constructor (name) {
    assert(typeof name === 'string')
    this.name = name
  }
}

class Attribute {
  constructor (key, value) {
    assert(typeof key === 'string', 'key should be a string')
    assert(typeof value === 'string', 'value should be a string')
    this.key = key
    this.value = value
  }
}
