const math = require("./math.js");


class CRule{

    constructor(isRuleValid, replacement){
        this.isRuleValid = isRuleValid;
        this.replacement = replacement;
    }

}


//may or may not need extra operator check because the evaluator/reducer will handle it
// 2/3 + 5/2
const addFractionConstantFolding = new CRule( 
    (expression) => {
        const leftFraction = expression.left;
        const rightFraction = expression.right;
        const L = leftFraction.fn == "div" && leftFraction.left.type == "NumericLiteral" && leftFraction.right.type == "NumericLiteral";
        const R = rightFraction.fn == "div" && rightFraction.left.type == "NumericLiteral" && rightFraction.right.type == "NumericLiteral";
        return L && R;
    },
    (expression) => {
        const leftFraction = expression.left;
        const leftDenominator = leftFraction.right.value;
        const rightFraction = expression.right;
        const rightDenominator = rightFraction.right.value;

        const denominator = math.LCM(leftDenominator, rightDenominator);
        const numerator = leftFraction.left.value*(denominator/leftDenominator) + rightFraction.left.value*(denominator/rightDenominator);
        if (Number.isInteger(numerator/denominator)){
            return {
                type: "NumericLiteral",
                value: numerator/denominator
            }
        }
        return {
            type: "BinaryExpression",
            operator: "/",
            fn: "div",
            left: {
                type: "NumericLiteral",
                value: numerator
            },
            right: {
                type: "NumericLiteral",
                value: denominator
            }
        }
    }
)
const subFractionConstantFolding = new CRule( 
    (expression) => {
        const leftFraction = expression.left;
        const rightFraction = expression.right;
        const L = leftFraction.fn == "div" && leftFraction.left.type == "NumericLiteral" && leftFraction.right.type == "NumericLiteral";
        const R = rightFraction.fn == "div" && rightFraction.left.type == "NumericLiteral" && rightFraction.right.type == "NumericLiteral";
        return L && R;
    },
    (expression) => {
        const leftFraction = expression.left;
        const leftDenominator = leftFraction.right.value;
        const rightFraction = expression.right;
        const rightDenominator = rightFraction.right.value;

        const denominator = math.LCM(leftDenominator, rightDenominator);
        const numerator = leftFraction.left.value*(denominator/leftDenominator) - rightFraction.left.value*(denominator/rightDenominator);
        if (Number.isInteger(numerator/denominator)){
            return {
                type: "NumericLiteral",
                value: numerator/denominator
            }
        }
        return {
            type: "BinaryExpression",
            operator: "/",
            fn: "div",
            left: {
                type: "NumericLiteral",
                value: numerator
            },
            right: {
                type: "NumericLiteral",
                value: denominator
            }
        }
    }
)

const mulFractionConstantFolding = new CRule(
    (expression) => {
        const leftFraction = expression.left;
        const rightFraction = expression.right;
        const L = leftFraction.fn == "div" && leftFraction.left.type == "NumericLiteral" && leftFraction.right.type == "NumericLiteral";
        const R = rightFraction.fn == "div" && rightFraction.left.type == "NumericLiteral" && rightFraction.right.type == "NumericLiteral";
        return L && R;
    },
    (expression) => {
        const leftFraction = expression.left;
        const leftNumerator = leftFraction.left.value;
        const leftDenominator = leftFraction.right.value;

        const rightFraction = expression.right;
        const rightNumerator = rightFraction.left.value;
        const rightDenominator = rightFraction.right.value;

        const numerator = leftNumerator * rightNumerator;
        const denominator = leftDenominator * rightDenominator;

        if (Number.isInteger(numerator/denominator)){
            return {
                type: "NumericLiteral",
                value: numerator/denominator
            }
        }
        return {
            type: "BinaryExpression",
            operator: "/",
            fn: "div",
            left: {
                type: "NumericLiteral",
                value: numerator
            },
            right: {
                type: "NumericLiteral",
                value: denominator
            }
        }
    }
  );


const addConstantFolding = new CRule(
    (expression) => {
       return expression.left.type == "NumericLiteral" && expression.right.type == "NumericLiteral";
    },
    (expression) => {
        return {
            type: "NumericLiteral",
            value: expression.left.value + expression.right.value
        }
    }
  );

const subConstantFolding = new CRule(
    (expression) => {
       return expression.left.type == "NumericLiteral" && expression.right.type == "NumericLiteral";
    },
    (expression) => {
        return {
            type: "NumericLiteral",
            value: expression.left.value - expression.right.value
        }
    }
  );

const mulConstantFolding = new CRule(
    (expression) => {
       return expression.left.type == "NumericLiteral" && expression.right.type == "NumericLiteral";
    },
    (expression) => {
        return {
            type: "NumericLiteral",
            value: expression.left.value * expression.right.value
        }
    }
  );

// const unaryConstantFolding = new CRule(
//     (expression) => {
//        return expression.left.type == "NumericLiteral" && expression.right.type == "NumericLiteral";
//     },
//     (expression) => {
//         return expression.left.value * expression.right.value;
//     }
//   );

const divConstantFolding = new CRule(
    (expression) => {
       return expression.left.type == "NumericLiteral" && expression.right.type == "NumericLiteral";
    },
    (expression) => {
        const numerator = expression.left.value;
        const denominator = expression.right.value;
        if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || Number.isInteger(numerator/denominator)){// 5.5 || 4/2
            return {
                type: "NumericLiteral",
                value: numerator / denominator
            }
        }else{
            const gcd = math.GCD(numerator, denominator);
            return {
                type: "BinaryExpression",
                operator: "/",
                fn: "div",
                left: {
                    type: "NumericLiteral",
                    value: numerator/gcd
                },
                right: {
                    type: "NumericLiteral",
                    value: denominator/gcd
                }
            }
        }
    }
  );



// const addLikeTerms = new CRule(
//     (expression) => {
//         const leftVar = expression.left.right.value;
//         const rightVar = expression.right.right.value; 
//         return leftVar == rightVar && expression.left.operator == "*" && expression.right.operator == "*";

//     },
//     (expression) => {
//         const variable = expression.left.right.value; //could be pi, e, x, etc
//         const variableType = variable == "x" ? "VariableLiteral" : "IrrationalConstant";
//         const result = expression.left.left.value + expression.right.left.value;
//         if (result == 0){
//             return {
//                 type: "NumericLiteral",
//                 value: 0
//             }
//         }
//         return {
//             type: "BinaryExpression",
//             operator: "*",
//             fn: "mul",
//             left: {
//                 type: "NumericLiteral",
//                 value: result
//             },
//             right: {
//                 type: variableType,
//                 value: variable
//             }
//         }
//     }
// );

const addCommonFactorExtraction = new CRule( //2x + 2x = (2 + 2)x
    (expression) => {
        const leftVar = expression.left.right.value;
        const rightVar = expression.right.right.value; 
        return leftVar == rightVar && expression.left.operator == "*" && expression.right.operator == "*";

    },
    (expression) => {
        const leftCoefficient = expression.left.left;
        const rightCoefficient = expression.right.left;
        const variable = expression.left.right; //coudl be pi, e, x, etc
        return {
            type: "BinaryExpression",
            operator: "*",
            fn: "mul",
            left: {
                type: "BinaryExpression",
                operator: "+",
                fn: "add",
                left: leftCoefficient,
                right: rightCoefficient
            },
            right: variable
        }
    }
);
const subCommonFactorExtraction = new CRule( //2x + 2x = (2 + 2)x
    (expression) => {
        const leftVar = expression.left.right.value;
        const rightVar = expression.right.right.value; 
        return leftVar == rightVar && expression.left.operator == "*" && expression.right.operator == "*";

    },
    (expression) => {
        const leftCoefficient = expression.left.left;
        const rightCoefficient = expression.right.left;
        const variable = expression.left.right; //coudl be pi, e, x, etc
        return {
            type: "BinaryExpression",
            operator: "*",
            fn: "mul",
            left: {
                type: "BinaryExpression",
                operator: "-",
                fn: "sub",
                left: leftCoefficient,
                right: rightCoefficient
            },
            right: variable
        }
    }
);


const plusAllCases = new CRule(
    (expression) => {
        return true;
    },
    (expression) => {
        return expression.expression;
    }
)

const minusConstantFolding = new CRule(//-3
    (expression) => {
        return expression.expression.type == "NumericLiteral";
    },
    (expression) => {
        return {
            type: "NumericLiteral",
            value: -expression.expression.value
        }
    }
)

const minusIntegerCoefficientVariableFolding = new CRule( // -2x
    (expression) => {
        return expression.variable.location != null && expression.expression.left.type != "BinaryExpression";
    },
    (expression) => {
        expression.expression.left.value *= -1;
        return expression.expression; //removes unary expression wrapper
    }
)
const minusFractionCoefficientVariableFolding = new CRule( // -(1/2)x = (-1/2)x
    (expression) => {
        return expression.variable.location != null && expression.expression.left.fn == "div"; //div guarantees a fraction of sorts
    },
    (expression) => {
        expression.expression.left.left.value *= -1; //numerator
        return expression.expression; //removes unary expression wrapper
    }
)

const addVariableAndConstant = new CRule(
    (expression) => {
        // return expression.variable.location != "both"; //2x + 2 || 2 + 2x
        if (expression.left.type == "NumericLiteral"){ //2 + 2x
            if (expression.right.type == "BinaryExpression" && expression.right.fn == "mul"){
                return expression.right.right.type == "VariableLiteral";
            }
        }else if (expression.right.type == "NumericLiteral"){//2x + 2
            if (expression.left.type == "BinaryExpression" && expression.left.fn == "mul"){
                return expression.left.right.type == "VariableLiteral";
            }
        }else{
            return false;
        }
    },
    (expression) => {
        return Object.assign({}, expression);
    }
)
const subVariableAndConstant = new CRule(
    (expression) => {
        return expression.variable.location != "both"; //2x - 2 || 2 - 2x

    },
    (expression) => {
        return Object.assign({}, expression);
    }
)

const minusDistribution = new CRule(
    (expression) => {
        return expression.expression.fn == "add" || expression.expression.fn == "sub"; // -(2x + 3), -((1/2)x - 3)

    },
    (expression) => {
        //reverse operator and function when distributing a negative
        const operator = expression.expression.operator == "+" ? "-" : "+";
        const fn = expression.expression.fn == "add" ? "sub" : "add";

        const createUnaryExpression = (expression) => {
            return {
                type: "UnaryExpression",
                operator: "-",
                fn: "minus",
                expression
            }
        }

        return {
            type: "BinaryExpression",
            operator,
            fn,
            left: createUnaryExpression(expression.expression.left),
            right: expression.expression.right,
        }
    }
)

let ruleSet = {
    UnaryExpression : {
        plus: [
            plusAllCases,
        ],
        minus: [
            minusConstantFolding,
            minusIntegerCoefficientVariableFolding,
            minusFractionCoefficientVariableFolding,
            minusDistribution,
        ]
    },
    BinaryExpression: {
        add: [
            addConstantFolding,
            addFractionConstantFolding,
            addVariableAndConstant,
            addCommonFactorExtraction,
        ],
        sub: [
            subConstantFolding,
            subFractionConstantFolding,
            subVariableAndConstant,
            subCommonFactorExtraction,
        ],
        mul: [
            mulConstantFolding,
            mulFractionConstantFolding,
        ],
        div: [
            divConstantFolding,
        ]
    },
    FunctionExpression: {
        sqrt: [
            
        ],
        abs: [

        ]
    }
};   



// let expression = {
//     "type": "BinaryExpression",
//     "operator": "/",
//     "fn": "add",
//     "left": {
//         "type": "NumericLiteral",
//         "value": 20
//     },
//     "right": {
//         "type": "NumericLiteral",
//         "value": 4
//     }
// }
// console.log(JSON.stringify(ruleSet.BinaryExpression.div[0].replacement(expression), null, 4));



let expression = {
    "type": "BinaryExpression",
    "operator": "+",
    "fn": "add",
    "left": {
        "type": "BinaryExpression",
        "operator": "*",
        "fn": "mul",
        "left": {
            "type": "NumericLiteral",
            "value": 5
        },
        "right": {
            "type": "VariableLiteral",
            "value": "x"
        }
    },
    "right": {
        "type": "BinaryExpression",
        "operator": "*",
        "fn": "mul",
        "left": {
            "type": "NumericLiteral",
            "value": 5
        },
        "right": {
            "type": "VariableLiteral",
            "value": "x"
        }
    }
}

function hash(expression){
    function strHash(string){
        let h = 0; //hash
    
        let g = 31; //constant multiple (usually prime)
        for(let i = 0; i < string.length; i++){
            h = g * h + string.charCodeAt(0);
        }
    
        return h;
    }
    for (const attribute of Object.getOwnPropertyNames(expression)) {
        console.log(strHash(attribute));
    }
}

// hash(expression);

// console.log(JSON.stringify(expression, null, 3));

// let expression = {
//     "type": "BinaryExpression",
//     "operator": "+",
//     "fn": "add",
//     "left": {
//         "type": "BinaryExpression",
//         "operator": "*",
//         "fn": "mul",
//         "left": {
//             "type": "NumericLiteral",
//             "value": 2
//         },
//         "right": {
//             "type": "IrrationalConstant",
//             "value": "e"
//         }
//     },
//     "right": {
//         "type": "BinaryExpression",
//         "operator": "*",
//         "fn": "mul",
//         "left": {
//             "type": "NumericLiteral",
//             "value": 2
//         },
//         "right": {
//             "type": "IrrationalConstant",
//             "value": "e"
//         }
//     }
// }

// for (const rule of ruleSet.BinaryExpression.add) {
//     if (rule.isRuleValid(expression)){
//         console.log(rule.replacement(expression));
//     }else{
//         console.log("rule does not apply");
//     }
// }


module.exports = ruleSet;