/**

Lambda Calculus through JavaScript
"Lambda CalculuJS"
Siver K. Volle
2014

Includes a couple of modules, control panel, visualizer
and other unimportant pieces. For the converter by itself
try 'lambda-simple.js', or create it yourself from the
function λ and the following five definitions.

**/

function λ(calculus){
    var nextLambda = calculus.search(λ.lambdaDelim)
    if(nextLambda == 0){
        var delim = calculus.search(λ.bodyDelim);
        if(!~delim) throw Error("Missing body delimiter in lambda");
        var head = calculus.slice(1,delim).split(λ.argumentDelim);
        var body = λ(calculus.slice(delim+1))
        return λ.deliciousWrap(head,body);
    } else if(nextLambda > 0){
        var left = 1;
        var i = nextLambda;
        while(left>0&&++i<calculus.length){
            if(calculus[i] == "(") left++;
            else if(calculus[i] == ")") left--;
        }
        return calculus.slice(0,nextLambda)
             + λ(calculus.slice(nextLambda,i))
             + λ(calculus.slice(i));
    }
    return calculus
}
λ.eval = function(calculus){ return eval("("+this(calculus)+")"); }
λ.createNumeral = function(n){ return "(λf x."+Array(n+1).join("f(")+"x"+Array(n+1).join(")")+")"; }
λ.argumentDelim = /[^a-zA-Z0-9]+[0-9]*/; λ.lambdaDelim = /[#λ\\]/; λ.bodyDelim = /[.:]/;
λ.functionWrapper = "function anonymous(#1#){ return #2#; }";
λ.deliciousWrap = function(head,body){
    if(head.length>1)
        return this.functionWrapper.replace("#1#",head[0]).replace("#2#",λ.deliciousWrap(head.slice(1),body))
    else return this.functionWrapper.replace("#1#",head.length?head[0]:"").replace("#2#",body);
}
λ.visualize = function(calculus,symbol,where){
    function depth(array,c){
        if(array.length != 2) return c;
        return Math.max(depth(array[0],c+1),depth(array[1],c+1))
    }
    if(!symbol) symbol = function(x){ return x; }
    if(typeof calculus == "string")
        var array = λ.toArray(calculus);
    else var array = calculus;
    var svgNS = "http://www.w3.org/2000/svg"
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttributeNS(null,"viewBox","-50 -50 1200 1200")
    svg.setAttributeNS(null,"width","500")
    svg.setAttributeNS(null,"height","500")
    if(where) where.appendChild(svg);
    else document.body.appendChild(svg);
    array.position = [0,0];
    console.log(array.position)
    array.lineLength = depth(array,0)*10
    array.angle = 0;
    function draw(array,i){
        var path = document.createElementNS(svgNS,"path");
        path.setAttributeNS(null,"stroke","black")
        path.setAttributeNS(null,"stroke-width","1")
        var d = "";
        var x = array.position[0];
        var y = array.position[1];
        if(!array.length){
            var text = document.createElementNS(svgNS,"text");
            var fs = array.lineLength;
            text.setAttributeNS(null,"style","font-size:"+array.lineLength)
            text.setAttributeNS(null,"text-anchor","middle");
            var cos = Math.cos(array.angle)
            var sin = Math.sin(array.angle)
            text.innerHTML = symbol(array.symbol);
            text.setAttributeNS(null,"x",x+cos*(array.lineLength+5))
            text.setAttributeNS(null,"y",y+sin*(array.lineLength+5)+fs/3)
            d += "M"+[x,y]
            d += "l"+[cos*array.lineLength,sin*array.lineLength]
            svg.appendChild(text)
        } else {
            var mirror = i&1?1:-1//(Math.random()>0.5?1:-1);
            if(typeof array[0] == "string") array[0] = {symbol:array[0]}
            if(typeof array[1] == "string") array[1] = {symbol:array[1]}
            array[1].angle = array.angle;
            array[0].angle = array.angle - (Math.PI/2*mirror)// + (Math.random()-0.5)/4) * mirror
            array[0].lineLength = (depth(array[0],0)+1)*10
            array[1].lineLength = (depth(array[1],0)+1)*10
            //array[0].lineLength = array.lineLength/2;
            //array[1].lineLength = array.lineLength/2;
            var m = [x+Math.cos(array.angle)*array.lineLength
                    ,y+Math.sin(array.angle)*array.lineLength]
            var a = [m[0]+Math.cos(array[1].angle)*0
                    ,m[1]+Math.sin(array[1].angle)*0]
            var o = [m[0]+Math.cos(array[0].angle)*0
                    ,m[1]+Math.sin(array[0].angle)*0]
            d += "M"+[x,y]
            d += "L"+m
            d += "L"+a
            d += "M"+m
            d += "L"+o
            array[1].position = a
            array[0].position = o
            draw(array[0],i+1)
            draw(array[1],i)
        }
        path.setAttributeNS(null,"d",d);
        svg.appendChild(path)
    }
    draw(array,0)
}



//λ.visualizeA(fac)
var l = λ

λ.import = function(module,code){
    if(module.length){
        var newmod = {}
        for(var i = 0; i < module.length; i++){
            for(var key in module[i]){
                newmod[key] = module[i][key]
            }
        }
        module = newmod;
    }
    var symRe = /\#([^\.^\)^\(^\ ^\#^\@^\%]+)/;
    var sym;
    var mod = "@";
    for(var key in module){
        var part = module[key];
        part = part.replace(/\%/,key)
        mod = mod.replace(/\@/,part)
    }
    return mod.replace(/\@/,code)
}
λ.stdSymbols = function(name){
    return λ.dictionary[name] || name;
}
λ.dictionary = {
    True:"T",
    False:"F",
    And:"∧",
    Or:"∨",
    Succ:"S",
    Pred:"P",
    Rec:"⟲",
    Not:"¬",
    Xor:"⊗",
    Add:"+",
    Sub:"-",
    Mult:"∙",
    Pow:"∙∙",
}
λ.module = {}
λ.module.stdlib = {
    Id: "(λ%.@)(λx.x)",
    Rec: "(λ%.@)(λx.x(x))",
    True: "(λ%.@)(λx y.x)",
    False: "(λ%.@)(λx y.y)",
    If: "(λ%.@)(λc a b.c(a)(b))", /* somewhat pointless, except for readability */
}
λ.module.boolean = {
    True : "(λ%.@)(λx y.x)",
    False : "(λ%.@)(λx y.y)",
    Not : "(λ%.@)(λa x y.a(y)(x))",
    And : "(λ%.@)(λa b x y.a(b(x)(y))(y))",
    Or : "(λ%.@)(λa b x y.a(x)(b(x)(y)))",
    Xor : "(λ%.@)(λa b x y.a(b(y)(x))(b(x)(y)))",
}
λ.module.natural = {
    Zero : "(λ%.@)(λf x.x)", /* alias for false */
    Succ : "(λ%.@)(λn f x.n(f)(f(x)))",
    Pred : "(λ%.@)(λn f x.n(λg h.h(g(f)))(λu.x)(λu.u))",
    Add : "(λ%.@)(λn m f x.n(f)(m(f)(x)))",
    Sub : "(λ%.@)(λn m f x.n(Pred)(m)(f)(x))",
    Mult : "(λ%.@)(λn m f x.n(m(f))(x))",
    Pow : "(λ%.@)(λn m f x.n(m)(f)(x))",
    Zerop: "(λ%.@)(λn.n(λx a b.b)(λa b.a))",
}
λ.module.numerals = function(ns){
    var mod = {};
    for(var i in ns) mod["n"+ns[i]] = "(λ%.@)("+λ.createNumeral(ns[i])+")";
    return mod;
}
function evalAsBoolean(a){ return (!!a(true)(false)); }
function evalAsInteger(a){ return a(increment)(0); }
function increment(a){ return (a-0||0) + 1; }
λ.evaluateAs = {
    function: function(x){return x},
    boolean: evalAsBoolean,
    integer: evalAsInteger,
}
λ.beautify = function(calculus){
    var code = λ.toArray(calculus);
    var i = 0;
    function hack(slash,type){
        if(typeof slash == "string"){
            return "<span class='syntax-"+type+"' symbol='"+slash+"'>"+slash+"</span>"
        } else if(typeof slash[0] != "string" && slash[0][0] == "λ"){
            var out = ""
            if(type == "head"){
                out += hack(slash[0][1],"defarg");
            } else {
                var u = i++;
                out += "<span class='syntax-defun'>"
                out += "<span class='syntax-par syntax-lpar' id='lpar"+u+"'>(</span>"
                out += "<span class='syntax-head'>"
                out += "<span class='syntax-lambda'>λ</span>"
                out +="<span class='syntax-arglist'>"
                out += hack(slash[0][1],"defarg");
            }
            if(slash[1]&&typeof slash[1][0] != "string"&&slash[1][0][0] == "λ"){
                out += hack(slash[1],"head");
            } else if(slash[1]){
                out += "</span arglist>"
                out += "<span class='syntax-dot'>.</span>";
                out += "</span head>"
                out += "<span class='syntax-body'>";
                out += hack(slash[1],"arg");
            } else {}
            if(type != "head"){
                out += "</span body>"
                out += "<span class='syntax-par syntax-rpar' id='rpar"+u+"'>)</span>"
                out += "</span defun>"
            }
            return out
        } else if(slash.length == 2){
            var out = "<span class='syntax-composition'>"
            out += "<span class='syntax-function'>"
            out += hack(slash[0],"func")
            out += "</span>"
            var u = i++;
            if(!(slash[1]&&typeof slash[1][0] != "string"&&slash[1][0][0] == "λ"))
                out += "<span class='syntax-par syntax-lpar' id='lpar"+(u)+"'>(</span>"
            out += "<span class='syntax-argument'>"
            out += hack(slash[1],"arg")
            out += "</span>";
            if(!(slash[1]&&typeof slash[1][0] != "string"&&slash[1][0][0] == "λ"))
                out += "<span class='syntax-par syntax-rpar' id='rpar"+(u)+"'>)</span>"
            out += "</span>";
            return out
        } else {return hack(slash[0])}
    }
    var el = document.createElement("pre")
    el.innerHTML = hack([code]);
    var par = el.querySelectorAll(".syntax-par")
    for(var i in par){
        if(i=="length")break;
        par[i].onmouseover = function(){
            el.querySelector("#r"+this.id.slice(1)).className += " hover"
            el.querySelector("#l"+this.id.slice(1)).className += " hover"
        }
        par[i].onmouseout = function(){
            var e = el.querySelector("#r"+this.id.slice(1))
            e.className = e.className.replace(/ +hover */g," ")
            var e = el.querySelector("#l"+this.id.slice(1))
            e.className = e.className.replace(/ +hover */g," ")
        }
    }
    var elist = el.querySelectorAll(".syntax-lambda")
    for(var i in elist){
        if(i=="length")break;
        elist[i].onmouseover = function(){
            this.parentElement.parentElement.className += " hover"
        }
        elist[i].onmouseout = function(){
            this.parentElement.parentElement.className
                 = this.parentElement.parentElement
                 .className.replace(/ +hover */g," ")
        }
    }
    var elist = el.querySelectorAll(".syntax-defarg")
    for(var i in elist){
        if(i=="length")break;
        elist[i].onmouseover = function(){
            var l = this.parentElement.parentElement.parentElement
                .querySelectorAll('[symbol="'+this.getAttribute("symbol")+'"]');
            for(var q in l){
                if(q=="length")break;
                l[q].className += " hover"
            }
        }
        elist[i].onmouseout = function(){
            var l = this.parentElement.parentElement.parentElement
                .querySelectorAll('[symbol="'+this.getAttribute("symbol")+'"]');
            for(var q in l){
                if(q=="length")break;
                l[q].className = 
                    l[q].className.replace(/ +hover */g," ")
            }
        }
    }
    var elist = el.querySelectorAll("[symbol]:not(.syntax-defarg)")
    for(var i in elist){
        if(i=="length")break;
        elist[i].onmouseover = function(){
            var q = this;
            this.className += " hover"
            var sel = '.syntax-defarg[symbol="'+this.getAttribute("symbol")+'"]';
            while(q = q.parentElement){
                if(q.querySelector(sel)){
                    this.defarg = q.querySelector(sel)
                    this.defarg.className += " hover"
                    return;
                }
            }
        }
        elist[i].onmouseout = function(){
            if(this.defarg){
                this.defarg.className = this.defarg.className
                    .replace(/ +hover */g," ")
                this.className = this.className
                    .replace(/ +hover */g," ")
            }
        }
    }
    return el;
}

λ.toArray = function(calculus){
    da = λ(calculus)
        .replace(/anonymous/g,"")
        .replace(/function \((.*?)\)\{ return /g,"λ($1)(")
        .replace(/; }/g,")");i=0
    var reA = /([λa-zA-Z0-9]+)\(([λa-zA-Z0-9]+)\)/
    var reC = /\(([λa-zA-Z0-9]+)\)\(([λa-zA-Z0-9]+)\)/
    var reB = /\(([λa-zA-Z0-9]+)\)([λa-zA-Z0-9]+)/
    var reD = /\(([λa-zA-Z0-9]+)\)(\([λa-zA-Z0-9]+)/
    var par = (/\(\(([λa-zA-Z0-9]+)\)\)/g)
    var reKey = (/METAKEY[0-9]+/g)
    var obj = {}
    while(((zA=da.match(reA))||(zB=da.match(reB))||(zC=da.match(reC))) && i < 1e6){
        re = zA?reA:zB?reB:reC;
        m = zA || zB || zC;
        var key = "METAKEY"+i++;
        if(q=m[1].match(reKey)) m[1] = obj[q[0]];
        if(q=m[2].match(reKey)) m[2] = obj[q[0]];
        obj[key] = [m[1],m[2]];
        da = da.replace(re,"("+key+")")
        da = da.replace(par,"($1)")
    }
    return obj[key]
}
λ.example = {}
λ.example.xortf = {
    name: "Xor of True and False",
    code: "Xor(True)(False)",
    dep: ["boolean"],
    eval: "boolean",
}
λ.example.factorial = {
    name: "Factorial of 5",
    code: "(λfac.(fac(λf x.f(f(f(f(f(x))))))))(Rec(λself n.If(Zerop(n))(λblank.Succ(Zero))(λblank.Mult(n)(Rec(self)(Pred(n))))(False)))",
    dep: ["stdlib","natural"],
    eval: "integer",
}
λ.createInputElement = function(){
    var input = document.createElement("div");
    input.main = document.createElement("div");
    input.main.className = "main-area"
    input.appendChild(input.main);
    input.head = document.createElement("h3");
    input.head.innerHTML = "Lambda Calculus Control Panel"
    input.main.appendChild(input.head);
    input.className = "lambda-input";
    input.textarea = document.createElement("textarea");
    input.main.appendChild(input.textarea);
    input.modules = document.createElement("details");
    input.modules.appendChild(input.modules.summary = document.createElement("summary"));
    input.modules.summary.innerHTML = "Modules"
    for(var m in λ.module){
        if(typeof λ.module[m] == "function") continue;
        var el = document.createElement("input");
        el.setAttribute("type","checkbox");
        el.setAttribute("name",m);
        el.setAttribute("id","lambda-module-"+m);
        input.modules.appendChild(el);
        el = document.createElement("label");
        el.innerHTML = m;
        el.setAttribute("for","lambda-module-"+m)
        input.modules.appendChild(el);
    }
    input.main.appendChild(input.modules)
    input.examples = document.createElement("details");
    input.examples.appendChild(input.examples.summary = document.createElement("summary"));
    input.examples.summary.innerHTML = "Examples"
    for(var m in λ.example){
        var el = document.createElement("button");
        el.setAttribute("name",m);
        el.setAttribute("id","lambda-example-"+m);
        el.innerHTML = λ.example[m].name;
        el.example = λ.example[m];
        el.onclick = function(){
            var checkbox = input.modules.querySelectorAll("input");
            var modules = [];
            for(var m in checkbox){
                checkbox[m].checked = ~this.example.dep.indexOf(checkbox[m].name);
            }
            for(var m in input.evalas.options){
                if(this.example.eval == input.evalas.options[m].innerHTML){
                    input.evalas.selectedIndex = m;
                    break;
                }
            }
            input.textarea.value = this.example.code;
        }
        input.examples.appendChild(el);
    }
    input.main.appendChild(input.examples)
    input.evalas = document.createElement("select");
    for(var m in λ.evaluateAs){
        var el = document.createElement("option");
        el.innerHTML = m;
        input.evalas.appendChild(el);
    }
    var el = document.createElement("label");
    el.setAttribute("for","lambda-select-evalas")
    el.innerHTML = "Evaluate output as: "
    input.evalas.id = "lambda-select-evalas";
    input.main.appendChild(el)
    input.main.appendChild(input.evalas)
    input.run = document.createElement("button")
    input.run.innerHTML = "evaluate"
    input.run.className = "lambda-run"
    input.main.appendChild(input.run);
    //input.draw = document.createElement("button")
    //input.draw.innerHTML = "draw"
    //input.draw.className = "lambda-draw"
    //input.main.appendChild(input.draw);
    input.lambda = document.createElement("output")
    input.lambda.className = "raw"
    input.output = document.createElement("output")
    input.output.className = "evald"
    input.syntax = document.createElement("output")
    input.syntax.className = "syntax"
    input.appendChild(input.output);
    input.appendChild(input.lambda);
    input.appendChild(input.syntax);
    function extractLambda(){
        var checkbox = input.modules.querySelectorAll("input");
        var modules = [];
        for(var m in checkbox){
            if(checkbox[m].checked){
                modules.push(λ.module[checkbox[m].name])
            }
        }
        var code = input.textarea.value;
        return λ.import(modules,code)
    }
    input.run.onclick = function(){
        var lambda = extractLambda();
        var evalas = input.evalas.options[input.evalas.selectedIndex].value
        evalas = λ.evaluateAs[evalas];
        input.lambda.innerHTML = lambda;
        input.output.innerHTML = evalas(λ.eval(lambda))
        input.syntax.innerHTML = "";
        input.syntax.appendChild((λ.beautify(lambda)))
    }
    //input.draw.onclick = function(){
    //    var lambda = extractLambda();
    //    λ.visualize(lambda,null,input);
    //}
    return input;
}
λ.displayControls = function(){
    document.body.appendChild(λ.createInputElement());
}
