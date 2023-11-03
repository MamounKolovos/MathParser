# MathParser
This is my programming experiment to build a parser and tokenizer that reads mathematical expressions and processes them. I originally got interested in how parsers work from seeing one of my peers implement a JavaScript parser that performs text highlighting. The parser is working and the evaluator is a WIP.

## How does the program work?
The entire parser is one large object-oriented recursive descent parser. You are inside a recursive call from the start until the end. I use a tokenizer to get each token in the string and then I recursively sort the tokens into a large JSON structure. The program also uses the concept of folding which is an optimization technique that compilers use.

Basic arithmetic operators currently supported:
- addition, subtraction, division, multiplication
- 
Logarithmic and trigonometric operators/functions currently supported:
- square root
- absolute value
- sin, cos, tangent
- natural log
- vector math
- factorial

## Below is an example of the program parsing and evaluating a simple addition expression
Notice the JSON structure which is a decomposed representation of the terms into logical units.
![addition operation](https://github.com/MamounKolovos/MathParser/assets/121258835/fa1284d1-5176-4a64-bc9b-2348729e1918)

## Below is an example of the parser implementing order of operations and additional expression terms
Notice that the program understands parentheses enforce order.
![more complex operation](https://github.com/MamounKolovos/MathParser/assets/121258835/e1c9a062-cea9-44ca-87e6-189a797baba9)
