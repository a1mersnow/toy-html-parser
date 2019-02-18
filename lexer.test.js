const { HTMLLexicalParser } = require('./lexer')

const testHTML = `<html maaa=a >
    <head>
        <title>cool</title>
    </head>
    <body>
        <img src="a" />
    </body>
</html>`

const dummySyntaxer = {
  receiveInput: (token) => {
    if (typeof token === 'string') {
      console.log(`String(${token.replace(/\n/, '\\n').replace(/ /, '<whitespace>')})`)
    } else {
      console.log(token)
    }
  }
}

const lexer = new HTMLLexicalParser(dummySyntaxer)

for (let c of testHTML) {
  lexer.receiveInput(c)
}
