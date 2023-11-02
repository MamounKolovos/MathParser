module.exports = test => {
    test(`3 + 5`, {type: "NumericLiteral", value: 8});
    test(`-5 + 2`, {type: "NumericLiteral", value: -3});
    test(`3 - 5`, {type: "NumericLiteral", value: -2});
    test(`3 * 5`, {type: "NumericLiteral", value: 15});

    test(`8 / 2`, {type: "NumericLiteral", value: 4});
    test(`0 / 2`, {type: "NumericLiteral", value: 0});
    test(`9 / 4`, {
        type: "BinaryExpression",
        operator: "/",
        fn: "div",
        left: {
            type: "NumericLiteral",
            value: 9
        },
        right : {
            type: "NumericLiteral",
            value: 4
        }
    })
    test(`5.5 / 2`, {type: "NumericLiteral", value: 2.75});
    test(`5 / 0.2`, {type: "NumericLiteral", value: 25});

    test(`2e + 2e`,{
        "type": "BinaryExpression",
        "operator": "*",
        "fn": "mul",
        left: {
            type: "NumericLiteral",
            value: 4
        },
        right: {
            type: "IrrationalConstant",
            value: "e"
        }
    })
    test(`2\\pi + 2\\pi`,{
        "type": "BinaryExpression",
        "operator": "*",
        "fn": "mul",
        left: {
            type: "NumericLiteral",
            value: 4
        },
        right: {
            type: "IrrationalConstant",
            value: "\\pi"
        }
    })

    test(`2x + 2x`,{
        "type": "BinaryExpression",
        "operator": "*",
        "fn": "mul",
        left: {
            type: "NumericLiteral",
            value: 4
        },
        right: {
            type: "VariableLiteral",
            value: "x"
        }
    })
    test(`2x - 2x`,0)

    test(`2x + 2e`,{
        "type": "BinaryExpression",
        "operator": "+",
        "fn": "add",
        "left": {
            "type": "BinaryExpression",
            "operator": "*",
            "fn": "mul",
            "left": {
                "type": "NumericLiteral",
                "value": 2
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
                "value": 2
            },
            "right": {
                "type": "IrrationalConstant",
                "value": "e"
            }
        }
    })

    test(`2/3 + 5/2`,{
        type: "BinaryExpression",
        operator: "/",
        fn: "div",
        left: {
            type: "NumericLiteral",
            value: 19
        },
        right: {
            type: "NumericLiteral",
            value: 6
        }
    })

    test(`10/3 - 2/5`,{
        type: "BinaryExpression",
        operator: "/",
        fn: "div",
        left: {
            type: "NumericLiteral",
            value: 44
        },
        right: {
            type: "NumericLiteral",
            value: 15
        }
    })

    test(`7/8 + 13/20`,{
        type: "BinaryExpression",
        operator: "/",
        fn: "div",
        left: {
            type: "NumericLiteral",
            value: 61
        },
        right: {
            type: "NumericLiteral",
            value: 40
        }
    })

    test(`1/2 + 5/2`,{
        type: "NumericLiteral",
        value: 3
    })

    test(`1/2 * 10/9`,{
        type: "BinaryExpression",
        operator: "/",
        fn: "div",
        left: {
            type: "NumericLiteral",
            value: 10
        },
        right: {
            type: "NumericLiteral",
            value: 18
        }
    })

    test(`8/10`,{
        type: "BinaryExpression",
        operator: "/",
        fn: "div",
        left: {
            type: "NumericLiteral",
            value: 4
        },
        right: {
            type: "NumericLiteral",
            value: 5
        }
    })
}