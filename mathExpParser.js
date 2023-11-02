/**
*
*   Expr ::=
*       Factor
*     | Expr '+' Factor
*   Factor ::=
*       Atom
*     | Factor '*' Atom
*   Atom ::=
*       'number'
*     | '(' Expr ')'
*/
const assert = require("assert");
const ruleSet = require("./CExpression");

class Stack{
    constructor(){
        this.stack = [];
    }

    peek(){
        if (this.stack[this.size()-1] == null){
            return null;
        }else{
            return this.stack[this.size()-1];
        }
    }

    push(token){
        this.stack.push(token);
    }

    pop(){
        this.stack.pop();
    }

    size(){
        return this.stack.length;
    }
}

const Spec = [
    //----------------
    //Whitespace:

    [/^\s+/, null],

    //----------------
    //Symbols, delimiters:
    [/^\(/, '('],
    [/^\)/, ')'],
    [/^\[/, '['],
    [/^\]/, ']'],
    [/^\|/, '|'],

    [/^\,/,','],

    //----------------
    //Variables and Equalities

    [/^[a-df-z]/, "VARIABLE"],
    [/^\=/, "EQUALS"],

    //----------------
    // Functions
    [/^\\sqrt\(/, "ROOT_FUNCTION"],
    [/^\\abs\(/, "ABS_FUNCTION"],
    [/^\\sin\(/, "TRIG_FUNCTION"],
    [/^\\cos\(/, "TRIG_FUNCTION"],
    [/^\\tan\(/, "TRIG_FUNCTION"],
    [/^\\ln\(/, "LOG_FUNCTION"],


    //----------------
    //Numbers and Irrational Constants:

    [/^([0-9]+([.][0-9]*)?|[.][0-9]+)/, "NUMBER"], //fix negatives for non digits
    [/^e/, "IRRATIONAL_CONSTANT"],
    [/^\\pi/, "IRRATIONAL_CONSTANT"],

    //----------------
    // Math Operators: +, -, *, /

    [/^[\+\-]/, "ADDITIVE_OPERATOR"],
    [/^\*/, "MULTIPLICATIVE_OPERATOR"],
    [/^\//, "DIVISIVE_OPERATOR"],
    [/^\^/, "EXPONENTIAL_OPERATOR"],
    [/^\!/, "FACTORIAL_OPERATOR"]

];

class Tokenizer{
    init(string){
        this._string = string;
        this._cursor = 0;
    }

    hasMoreTokens(){
        return this._cursor < this._string.length;
    }

    getNextToken(){
        if (!this.hasMoreTokens()){ //no more tokens when we reach the end of the file
            return null;
        }
        
        const string = this._string.slice(this._cursor);

        for (const [regexp, tokenType] of Spec){
            const tokenValue = this._match(regexp, string);

            if (tokenValue == null){
                continue;
            }

            //should skip token, eg: whitespace
            if (tokenType == null){
                return this.getNextToken();
            }
            // console.log({type: tokenType, value: tokenValue});
            return {
                type: tokenType,
                value: tokenValue
            };
        }

        throw new SyntaxError(`Unexpected token: "${string[0]}"`);
    }
    /**
     * matches a token for a regular expression
     */
    _match(regexp, string){
        const matched = regexp.exec(string);
        if (matched == null){ //return null if there are no matches
            return null;
        }
        this._cursor += matched[0].length;
        return matched[0];
    }
}

const DefaultFactory = {
    Statement(expression){
        return {
            expression
        }
    },

    Expression(additiveExpression){
        return additiveExpression;
    },

}

const SExpressionFactory = {
    Statement(expression){
        return expression;
    },

    Expression(additiveExpression){
        function buildStr(left){
            //leaf node
            if (left.type == "NumericLiteral"){
                return left.value.toString();
            }
            const leftEval = buildStr(left.left);
            const rightEval = buildStr(left.right);

            if (left.operator == "+"){
                return "(" + leftEval + " + " + rightEval + ")";
            }
            if (left.operator == "-"){
                return "(" + leftEval + " - " + rightEval + ")";
            }
            if (left.operator == "*"){
                return "(" + leftEval + " * " + rightEval + ")";
            }
            if (left.operator == "/"){
                return "(" + leftEval + " / " + rightEval + ")";
            }
            if (left.operator == "%"){
                return "(" + leftEval + " % " + rightEval + ")";
            }
           
        }
        return buildStr(additiveExpression);
    },

}

class Vector{
    static isVector(vector){
        return Array.isArray(vector);
    }
    
    static add(vec1, vec2){
        let resultVec = vec1.length < vec2.length ? vec2 : vec1;
        const len = vec1.length > vec2.length ? vec2.length : vec1.length; //use smaller vec as upper bound
        for (let i = 0; i < len; i++){
            resultVec[i] = vec1[i] + vec2[i]; 
        }
        return resultVec;
    }

    static sub(vec1, vec2){
        let resultVec = vec1.length < vec2.length ? vec2 : vec1;
        const len = vec1.length > vec2.length ? vec2.length : vec1.length; //use smaller vec as upper bound
        for (let i = 0; i < len; i++){
            resultVec[i] = vec1[i] - vec2[i]; 
        }
        return resultVec;
    }

    static mul(leftEval, rightEval){ //commutative
        const scalar = !Vector.isVector(leftEval) ? leftEval : rightEval;
        const vec = scalar == leftEval ? rightEval : leftEval;
        return vec.map(a => scalar*a);
    }

    static div(leftEval, rightEval){ //not commutative
        const scalar = !Vector.isVector(leftEval) ? leftEval : rightEval;
        const vec = scalar == leftEval ? rightEval : leftEval;
        if (scalar == leftEval){ // 2 / [5,5,5] should yield 2/5 components
            return vec.map(a => scalar/a);
        }else{ // [5,5,5] / 2  should yield 5/2 components
            return vec.map(a => a/scalar);
        }
    }

    static dot(vec1, vec2){
        if (vec1.length != vec2.length){
            throw new Error("Cannot perform dot product on vectors of different sizes");
        }

        let sum = 0;
        for(let i = 0; i < vec1.length; i++) {
            sum += vec1[i]*vec2[i];
        }
        return sum;
    }
}

class Parser{
    constructor(){
        this._string = '';
        this._tokenizer = new Tokenizer();
    }

    parse(string, AST_MODE){
        this.factory;
        switch(AST_MODE){
            case "default":
                this.factory = DefaultFactory;
                break;
            case "s-expression":
                this.factory = SExpressionFactory;
                break;
        }

        this._string = string;
        this._tokenizer.init(string);

        this._lookahead = this._tokenizer.getNextToken();
        return this.Program();
    }


    sort(expression){
        function primitiveEqMath(operator, child, sideOfChild){
            //left side of equation
            let fn;
            switch(operator){
                case "+": fn = "add"; break;
                case "-": fn = "sub"; break;
                case "*": fn = "mul"; break;
                case "/": fn = "div"; break;
            }
            expression.left = {
                type: "BinaryExpression",
                operator,
                fn,
                left: expression.left,
                right: child
            }
            //right side of equation
            const oppositeSideOfChild = "left" == sideOfChild ? "right" : "left";
            //deletes binary expression
            delete expression.right.type;
            delete expression.right.operator;
            delete expression.right.fn;
            //deletes number since it was moved to the other side of the equation
            delete expression.right[sideOfChild];
            //removes nested attribute from the binary expression since theres only x on this side now
            expression.right = {
                ...expression.right[oppositeSideOfChild],
                // xLocation: expression.right.xLocation
            };
        }
        function pow(child, sideOfChild){
            //left side of equation
            expression.left = {
                type: "BinaryExpression",
                operator: "^",
                fn: "pow",
                left: expression.left,
                right: {
                    type: "BinaryExpression",
                    operator: "/",
                    fn: "div",
                    left: {
                        type: "NumericLiteral",
                        value: 1
                    },
                    right: child
                }
            }

            //right side of equation
            //deletes binary expression
            delete expression.right.type;
            delete expression.right.operator;
            delete expression.right.fn;
            //deletes number since it was moved to the other side of the equation
            delete expression.right.right;
            //removes nested attribute from the binary expression since theres only x on this side now
            expression.right = expression.right.left;

        }

        // function tagBinaryExpressions(expression){
        //     switch(expression.type){
        //         case "NumericLiteral": return;
        //         case "IrrationalConstant": return;
        //         case "VariableLiteral":
        //             return "FOUND_VAR";
        //     }


        //     if (expression.left != null && tagBinaryExpressions(expression.left) == "FOUND_VAR"){
        //         expression.xLocation = "left";
        //     }else if (expression.type == "BinaryExpression"){//only binary expressions can have a xLocation attribute
        //         if (expression.left.xLocation != null){
        //             expression.xLocation = "left";
        //         }
        //     }
        //     if (expression.right != null && tagBinaryExpressions(expression.right) == "FOUND_VAR"){
        //         expression.xLocation = "right";
        //     }else if (expression.type == "BinaryExpression"){//only binary expressions can have a xLocation attribute
        //         if (expression.right.xLocation != null){
        //             expression.xLocation = "right";
        //         }
        //     }
        // }
        function sortAST(expression){

            if (expression == undefined){
                return;
            }
            
            switch(expression.type){
                case "NumericLiteral":
                case "IrrationalConstant":
                case "VariableLiteral":
                    return;
            }

            if (expression.type == "BinaryExpression"){
                if (expression.xLocation == "left"){
                    switch(expression.operator){ //opposite operations when removing number from a side
                        case "+": primitiveEqMath("-", expression.right, "right"); break;
                        case "-": primitiveEqMath("+", expression.right, "right"); break;
                        case "*": primitiveEqMath("/", expression.right, "right"); break;
                        case "/": primitiveEqMath("*", expression.right, "right"); break;
                        case "^": pow(expression.right, "left"); break;
                    }
                }else if (expression.xLocation == "right"){
                    switch(expression.operator){ //opposite operations when removing number from a side
                        case "+": primitiveEqMath("-", expression.left, "left"); break;
                        case "-": primitiveEqMath("+", expression.left, "left"); break;
                        case "*": primitiveEqMath("/", expression.left, "left"); break;
                        case "/": primitiveEqMath("*", expression.left, "left"); break;
                        case "^": throw new SyntaxError("HAVENT IMPLEMENTED LOGS AND LNS YET");
                    }
                }
            }
            sortAST(expression.left);
            sortAST(expression.right);
            // console.log(JSON.stringify(expression, null, 4));

        }
        const _this = this;
        this.tagExpressions(expression);
        sortAST(expression);
        // console.log(JSON.stringify(expression, null, 4));
    }

    eval(string){
        const ast = this.parse(string, "default");

        function traverseAST(expression){
            switch(expression.type){ //base case
                case "NumericLiteral": return Number(expression.value.toFixed(8));
                case "IrrationalConstant":
                    switch(expression.value){
                        case "e": return Number(Math.E.toFixed(8));
                        case "\\pi": return Number(Math.PI.toFixed(8));
                    }
                case "VariableLiteral":
                    return expression.value; 
            }
            let leftEval; let rightEval; let operator;
            if (expression.type == "BinaryExpression"){
                operator = expression.operator;
                leftEval = traverseAST(expression.left);
                rightEval = traverseAST(expression.right);
            }else if (expression.type == "FunctionExpression"){
                switch(expression.fn){
                    case "sqrt":{
                        const n = traverseAST(expression.expression);
                        return Number(Math.sqrt(n).toFixed(8));
                        // return Math.sqrt(n);
                    }
                    case "abs":{
                        const n = traverseAST(expression.expression);
                        return n > 0 ? Number(n.toFixed(8)) : Number(-n.toFixed(8));
                        // return n > 0 ? n : -n;
                    }
                    case "sin": case "cos": case "tan": {
                        const n = traverseAST(expression.expression);
                        const unroundedResult = Math[expression.fn](n);
                        return Number(unroundedResult.toFixed(8));
                        // return unroundedResult;
                    }
                    case "ln":{
                        const n = traverseAST(expression.expression);
                        return Number(Math.log(n).toFixed(8));
                    }
                    case "vec":{
                        const argValues = [];
                        for (let i = 0; i < expression.args.length; i++){
                            argValues.push(traverseAST(expression.args[i]));
                        }
                        return argValues;
                    }
                    case "factorial":{
                        const n = traverseAST(expression.expression);
                        if (!Number.isInteger(n)){
                            throw new Error("Only factorial operations with integers are supported");
                        }
                        let storedFactorials = [];
                        function factorial (n) {
                            if (n == 0 || n == 1)
                                return 1;
                            if (storedFactorials[n] > 0)
                                return storedFactorials[n];
                            return storedFactorials[n] = factorial(n-1) * n;
                        }
                        return factorial(n);//only returns integers
                    }
                }
            }else if (expression.type == "AssignmentExpression"){//has issues with floating point error
                leftEval = traverseAST(expression.left);
                rightEval = traverseAST(expression.right);
                // return leftEval == rightEval;
                return leftEval + " = " + rightEval;
            }

            if (Vector.isVector(leftEval) || Vector.isVector(rightEval)){ //either side can be a vector
                if (Vector.isVector(leftEval) && Vector.isVector(rightEval) && operator == "*"){ //both sides must be vectors: dot product
                    return Vector.dot(leftEval, rightEval);
                }
                switch(operator){
                    case "+": return Vector.add(leftEval, rightEval);
                    case "-": return Vector.sub(leftEval, rightEval);
                    case "*": return Vector.mul(leftEval, rightEval);
                    case "/": return Vector.div(leftEval, rightEval);
                }
            }

            switch(operator){ //primitve operations only
                case "+": return leftEval + rightEval;
                case "-": return leftEval - rightEval;
                case "*": return leftEval * rightEval;
                case "/": return leftEval / rightEval;
                case "%": return leftEval % rightEval;
                case "^": return leftEval ** rightEval;
            }
        }
        const _this = this;
        // this.sort(ast);
        console.log("new: " + JSON.stringify(ast, null, 4));
        return traverseAST(ast);
    }

    tagExpressions(expression){
        function symbolBitfield(symbol){ //3 bits: (pi)(e)(x)
            switch(symbol){ //returns binary
                case "e": return 0b010;
                case "\\pi": return 0b100;
                case "x": return 0b001;
            }
        }
        function tagger(expression){
            switch(expression.type){ //3 bits: (pi)(e)(x)
                case "NumericLiteral": return 0b000;
                case "IrrationalConstant":
                    switch(expression.value){
                        case "e": return 0b010;
                        case "\\pi": return 0b100;
                    }
                case "VariableLiteral": return 0b001;
            }
            
            let leftTagger;
            if (expression.left != null){
                leftTagger = tagger(expression.left);
                expression.tags = leftTagger;
            }

            // if (expression.type == "UnaryExpression"){ //unary expression
            //     const unaryTagger = tagger(expression.expression);
            // }

            let rightTagger;
            if (expression.right != null){
                rightTagger = tagger(expression.right);
                expression.tags = rightTagger;
            }else if (expression.left.type == "BinaryExpression"){
                expression.tags = expression.left.tags;
            }

            // if (expression.left.variable != null && expression.right.variable != null){// 3x + 2x
            //     expression.variable = {
            //         location: "both"
            //     }
            // }else if (expression.left.value == expression.right.value){
            //     expression.variable = {
            //         location: "both"
            //     }
            // }
        }
        tagger(expression);
    }

    simplify(ast){ //outer wrapper for recursive call
        let isChanged = true;
        function simplifyAST(expression){
            let functionRules;
            switch(expression.type){
                case "NumericLiteral": case "VariableLiteral": case "IrrationalConstant": return;
                case "UnaryExpression":
                    simplifyAST(expression.expression);
                    switch(expression.fn){
                        case "plus": functionRules = ruleSet.UnaryExpression.plus; break;
                        case "minus": functionRules = ruleSet.UnaryExpression.minus; break;
                    }
                    break;
                case "BinaryExpression":
                    simplifyAST(expression.left);
                    simplifyAST(expression.right);
                    switch(expression.fn){
                        case "add": functionRules = ruleSet.BinaryExpression.add; break;
                        case "sub": functionRules = ruleSet.BinaryExpression.sub; break;
                        case "mul": functionRules = ruleSet.BinaryExpression.mul; break;
                        case "div": functionRules = ruleSet.BinaryExpression.div; break;
                    }
                    break;
            }
            for (const rule of functionRules){
                if (rule.isRuleValid(expression)){
                    const replacement = rule.replacement(expression);
                    if (JSON.stringify(replacement) == JSON.stringify(expression)){ //mathematically could not simplify further: 2x+2
                        isChanged = false;
                    }else{
                        isChanged = true;
                    }

                    for (const attribute of Object.getOwnPropertyNames(expression)) {
                        delete expression[attribute];
                    }
                    expression = Object.assign(expression, replacement);
                    break;
                }
            }
        }

        console.log("old: " + JSON.stringify(ast, null, 4));
        while (isChanged == true){
            isChanged = false;
            this.tagExpressions(ast);
            simplifyAST(ast);
        }
    }

    Program(){
        return this.Statement();
    }

    Statement(){
        return this.Expression();
    }   

    Expression(){
        return this.AssignmentExpression();
    }

    AssignmentExpression(){
        let left = this.AdditiveExpression();

        if (this._lookahead != null && this._lookahead.type === "EQUALS"){
            this._eat("EQUALS");
            const right = this.AdditiveExpression();

            left = {
                type: "AssignmentExpression",
                left,
                right
            }
        }

        return left;
    }

    AdditiveExpression(){
        let left = this.MultiplicativeExpression();

        while(this._lookahead != null && this._lookahead.type === "ADDITIVE_OPERATOR"){
            const operator = this._eat("ADDITIVE_OPERATOR").value;
            const fn = operator == "+" ? "add" : "sub";
            const right = this.MultiplicativeExpression();

            left = {
                type: "BinaryExpression",
                operator,
                fn,
                left,
                right
            }
        }
        return left;
    }

    MultiplicativeExpression(){
        let left = this.DivisiveExpression();

        while(this._lookahead != null && this._lookahead.type === "MULTIPLICATIVE_OPERATOR"){
            const operator = this._eat("MULTIPLICATIVE_OPERATOR").value;
            const right = this.DivisiveExpression();

            left = {
                type: "BinaryExpression",
                operator,
                fn: "mul",
                left,
                right   
            }
        }
        return left;
    }

    DivisiveExpression(){
        let left = this.PrimaryExpression();

        while(this._lookahead != null && this._lookahead.type === "DIVISIVE_OPERATOR"){
            const operator = this._eat("DIVISIVE_OPERATOR").value;
            const right = this.PrimaryExpression();

            left = {
                type: "BinaryExpression",
                operator,
                fn: "div",
                left,
                right   
            }
        }
        return left;
    }
    
    PrimaryExpression(){
        return this.ImplicitMultiplicativeExpression();
    }

    isExtendableIME(){ //IME == ImplicitMultiplicativeExpression
        switch(this._lookahead.type){
            case "VARIABLE":
            case "NUMBER":
            case "IRRATIONAL_CONSTANT":
            case "ROOT_FUNCTION":
            case "ABS_FUNCTION":
            case "TRIG_FUNCTION":
            case "LOG_FUNCTION":
            case "(":
                return true;          
        }
        return false;
    }

    ImplicitMultiplicativeExpression(){
        let left = this.ExponentialExpression();

        if (left.type == "VariableLiteral"){
            return {
                type: "BinaryExpression",
                operator: "*",
                fn: "mul",
                left: {
                    type: "NumericLiteral",
                    value: 1
                },
                right: left
            }
        }

        while (this._lookahead != null && this.isExtendableIME()){
            let right = this.ExponentialExpression();
            left = {
                type: "BinaryExpression",
                operator: "*",
                fn: "mul",
                left,
                right
            }
        }
        return left;
    }

    ExponentialExpression(){
        function RightRecursion(left){
            if (_this._lookahead == null || _this._lookahead.type != "EXPONENTIAL_OPERATOR"){
                return left;
            }

            const operator = _this._eat("EXPONENTIAL_OPERATOR").value;
            let right = _this.PrefixExpression();

            left = {
                type: "BinaryExpression",
                operator,
                fn: "pow",
                left: left,
                right: RightRecursion(right)
            }
            return left;
        }
        const _this = this;
        return RightRecursion(this.PrefixExpression());
    }
    
    

    PrefixExpression(){
        let expression;
        switch(this._lookahead.type){
            case "ROOT_FUNCTION": expression = this.SquareRootExpression(); break;
            case "ABS_FUNCTION": expression = this.AbsoluteValueExpression(); break;
            case "TRIG_FUNCTION": expression = this.TrigExpression(); break;
            case "LOG_FUNCTION": expression = this.LogExpression(); break;
            case "[": expression = this.VectorExpression(); break;
            case "(": expression = this.ParenthesizedExpression(); break;
            case "IRRATIONAL_CONSTANT": expression = this.IrrationalConstant(); break;
            case "NUMBER": expression = this.NumericLiteral(); break;
            case "VARIABLE": expression = this.VariableLiteral(); break;
            case "ADDITIVE_OPERATOR": expression = this.UnaryExpression(); break;
        }

        while (this._lookahead != null && this._lookahead.type == "FACTORIAL_OPERATOR"){
            this._eat("FACTORIAL_OPERATOR");
            expression =  {
                type: "FunctionExpression",
                fn: "factorial",
                expression
            };
        }

        return expression;
    }

    UnaryExpression(){
        switch(this._lookahead.type){
            case "ADDITIVE_OPERATOR": return this.AdditiveUnaryExpression();
        }
    }

    AdditiveUnaryExpression(){
        const operator = this._eat("ADDITIVE_OPERATOR").value;

        const expression = this.ImplicitMultiplicativeExpression();

        return { // -(5*3)
            type: "UnaryExpression",
            operator,
            fn: operator == "+" ? "plus" : "minus",
            expression,
        }
        
    }

    SquareRootExpression(){// \sqrt()      //add support for nth root
        this._eat("ROOT_FUNCTION");
        const expression = this.AdditiveExpression();
        this._eat(")");
        return {
            type: "FunctionExpression",
            fn: "sqrt",
            expression,
        }
    }

    AbsoluteValueExpression(){ // \abs()
        this._eat("ABS_FUNCTION");
        const expression = this.AdditiveExpression();
        this._eat(")");
        return {
            type: "FunctionExpression",
            fn: "abs",
            expression,
        }
    }

    LogExpression(){
        this._eat("LOG_FUNCTION");  //    \\log()
        const expression = this.AdditiveExpression();
        this._eat(")");
        return {
            type: "FunctionExpression",
            fn: "ln",
            expression,
        }
    }

    TrigExpression(){ //sin, cos, tan
        const fn = this._eat("TRIG_FUNCTION").value.slice(1, -1); // eg: /sin( becomes sin
        const expression = this.AdditiveExpression();
        this._eat(")");
        return {
            type: "FunctionExpression",
            fn,
            expression,
        }
    }

    VectorExpression(){// [1,2,3]
        this._eat("[");
        const args = this.MultiArgExpression();
        this._eat("]");
        return {
            type: "FunctionExpression",
            fn: "vec",
            args
        }
    }

    MultiArgExpression(){
        const args = [this.PrefixExpression()];
        while (this._lookahead != null && this._lookahead.type == ","){
            this._eat(",");
            args.push(this.PrefixExpression());
        }
        return args; 
    }

    ParenthesizedExpression(){
        this._eat("(");
        const expression = this.AdditiveExpression();
        this._eat(")");
        return expression;
    }

    VariableLiteral(){
        const token = this._eat("VARIABLE");
        return {
            type: "VariableLiteral",
            value: token.value
        }
    }

    IrrationalConstant(){
        const token = this._eat("IRRATIONAL_CONSTANT");
        return {
            type: "IrrationalConstant",
            value: token.value,
        }
    }

    NumericLiteral(){
        const token = this._eat("NUMBER");
            return {
                type: "NumericLiteral",
                value: Number(token.value),
            };
    }

    _eat(tokenType){
        const token = this._lookahead;
    
        if (token == null){
            throw new SyntaxError(`Unexpected end of input, expected "${tokenType}"`);
        }

        if (token.type !== tokenType){
            throw new SyntaxError(`Unexpected token "${token.value}", expected "${tokenType}"`);
        }
        //advance to next token
        this._lookahead = this._tokenizer.getNextToken(token);

        return token;
    }
}

const parser = new Parser();

function main(){
    // const program = `\\abs(-e)`;
    // const program = `\\sqrt(2)/2 = \\sin(\\pi/4)`;
    // const program = `0 = x^2 - 1`;
    // const program = `7 = x + 4`;
    // const program = `8 = 2x + 2`;
    // const program = `10 = 5x + 5x`;
    // const program = `-(3x + 2)`;
    // const program = `2e+2e`;
    // let ast = parser.parse(program, "default");
    // console.log("math input: " + program);
    // console.log("result: " + parser.eval(program));
    // console.log("old: " + JSON.stringify(ast, null, 4));
    // parser.sort(ast.expression);
    // console.log("new: " + JSON.stringify(ast, null, 4));
    // console.log(Math.sqrt(2)/2 == Math.sin(Math.PI/4));


    const tests = [
        require("./addLikeTerms-test.js"),
    ];

    function test(program, expected){
        const ast = parser.parse(program, "default");
        // console.log(JSON.stringify(ast, null, 4));
        let functionRules;
        switch(ast.fn){
            case "add": functionRules = ruleSet.BinaryExpression.add; break;
            case "sub": functionRules = ruleSet.BinaryExpression.sub; break;
            case "mul": functionRules = ruleSet.BinaryExpression.mul; break;
            case "div": functionRules = ruleSet.BinaryExpression.div; break;
        }
        for (const rule of functionRules){
            if (rule.isRuleValid(ast)){
                const replacement = rule.replacement(ast);
                console.log("input: " + program);
                console.log("output: " + JSON.stringify(replacement, null, 4));
                assert.deepEqual(replacement, expected);
                break;
            }
        }
    }
     
    
    //run automated tests
    // tests.forEach(testRun => testRun(test));
    // console.log("All Tests Passed");

    const program = `2 + 2`;
    // const program = `-(2x - 3)`;
    // const program = `-((1/2)x + 3)`;
    // const program = `(1/6)x + (1/6)x`;
    const ast = parser.parse(program, "default");
    console.log("program: " + program);
    console.log(parser.eval(program));

    // console.log("old:" + JSON.stringify(ast, null, 4));
    // parser.simplify(ast);
    // console.log("new:" + JSON.stringify(ast, null, 4));

   parser.tagExpressions(ast);
//    console.log("new:" + JSON.stringify(ast, null, 4));
}

main();