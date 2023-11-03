# MathParser
This is my programming experiment to build a parser and tokenizer that reads mathematical expressions and processes them. I originally got interested in how parsers work from seeing one of my peers implement a JavaScript parser that performs text highlighting.

## How does the program work?
The entire parser is one large object-oriented recursive descent parser. You are inside a recursive call from the start until the end. I use a tokenizer to get each token in the string and then I recursively sort the tokens into a large JSON structure. The program also uses the concept of folding which is an optimization technique that compilers use.
