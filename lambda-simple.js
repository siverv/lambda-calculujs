/**

Lambda Calculus to JavaScript
"Lambda CalculuJS"
Siver K. Volle
2014

Simple version: just the converter.

**/


function λCalculus(calculus){
    var nextLambda = calculus.search(/[#λ\\]/)
    if(nextLambda == 0){
        var delim = calculus.search(/[.:]/);
        if(!~delim) throw Error("Missing body delimiter");
        var head = calculus.slice(1,delim)  
                           .split(/[^a-zA-Z0-9]+[0-9]*/);
        var body = λCalculus(calculus.slice(delim+1))
        var func = "#2#"
        for(var i in head){
            func = func.replace(/#2#/,
                   "function anonymous(#1#){ return #2#; }"
                   .replace(/#1#/,head[i]));
        }
        return func.replace(/#2#/,body);
    } else if(nextLambda > 0){
        var left = 1;
        var i = nextLambda;
        while(left>0&&++i<calculus.length){
            if(calculus[i] == "(") left++;
            else if(calculus[i] == ")") left--;
        }
        return calculus.slice(0,nextLambda)
             + λCalculus(calculus.slice(nextLambda,i))
             + λCalculus(calculus.slice(i));
    }
    return calculus
}
λCalculus.eval = function(calculus){ return eval("("+this(calculus)+")"); }