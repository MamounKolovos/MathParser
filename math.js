function GCD(a, b){ //greatest common denominator/divisor
    function gcd(a, b){
        if (b == 0){
            return a;
        }

        return gcd(b, a % b);
    }

    return gcd(a, b);
}

function LCM(a, b){ //least commmon multiple
    return (a * b) / GCD(a, b);
}

module.exports = {
    GCD,
    LCM,
};