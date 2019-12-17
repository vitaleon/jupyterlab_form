"use strict";

import * as CodeMirror from 'codemirror';

CodeMirror.defineMode("form", (config: CodeMirror.EditorConfiguration, parserConf: any) => {
    function wordObj(words:string[]) {
      var o : { [key:string]:boolean; } = {};
      for (var i = 0, e = words.length; i < e; ++i) o[words[i]] = true;
      return o;
    }
    var statements = wordObj([
      "a","ab","abr","abra","abrac","abrack","abracke","abracket","abrackets","al","als","also","an","ant","anti","antib",
      "antibr","antibra","antibrac","antibrack","antibracke","antibracket","antibrackets","antis","antisy","antisym","antisymm",
      "antisymme","antisymmet","antisymmetr","antisymmetri","antisymmetriz","antisymmetrize","apply","argexplode","argimplode",
      "argument","auto","autodeclare","b","br","bra","brac","brack","bracke","bracket","c","cf","cfu","cfun","cfunc","cfunct",
      "cfuncti","cfunctio","cfunction","cfunctions","chainin","chainout","chisholm","cleartable","co","collect","com","comm",
      "commu","commut","commuti","commutin","commuting","comp","compr","compre","compres","compress","contract","ct","ctable",
      "cte","cten","ctens","ctenso","ctensor","ctensors","cy","cyc","cycl","cycle","cycles","cyclesy","cyclesym","cyclesymm",
      "cyclesymme","cyclesymmet","cyclesymmetr","cyclesymmetri","cyclesymmetriz","cyclesymmetrize","deallocatetable","d",
      "delete","denominators","di","dim","dime","dimen","dimens","dimensi","dimensio","dimension","dis","disc","disca","discar",
      "discard","disorder","drop","dropcoefficient","else","elseif","endargument","endif","endinexpression","endinside",
      "endrepeat","endterm","endwhile","exit","factarg","fi","fill","fillexpression","fix","fixi","fixin","fixind","fixinde",
      "fixindex","fo","for","form","forma","format","f","fu","fun","func","funct","functi","functio","function","functions",
      "funpowers","g","gl","glo","glob","globa","global","go","got","goto","hide","i","id","ide","iden","ident","identi",
      "identif","identify","idn","idne","idnew","ido","idol","idold","if","ifmatch","ifnomatch","in","ind","inde","index",
      "indi","indic","indice","indices","inexpression","inparallel","inside","insidefirst","intohide","keep","l","la","lab",
      "labe","label","lo","loa","load","loc","loca","local","m","makeinteger","many","merge","metric","mo","mod","modu","modul",
      "moduleoption","modulu","modulus","mu","mul","mult","multi","multip","multipl","multiply","n","ndrop","nf","nfu","nfun",
      "nfunc","nfunct","nfuncti","nfunctio","nfunction","nfunctions","nhide","normalize","notinparallel","np","npr","npri",
      "nprin","nprint","nskip","nt","ntable","nte","nten","ntens","ntenso","ntensor","ntensors","nunhide","nw","nwr","nwri",
      "nwrit","nwrite","off","on","once","only","polyfun","polyratfun","pophide","print","printtable","propercount","pushhide",
      "r","ratio","rc","rcy","rcyc","rcycl","rcycle","rcycles","rcyclesy","rcyclesym","rcyclesymm","rcyclesymme","rcyclesymmet",
      "rcyclesymmetr","rcyclesymmetri","rcyclesymmetriz","rcyclesymmetrize","re","read","red","rede","redef","redefi","redefin",
      "redefine","ren","renu","renum","renumb","renumbe","renumber","repeat","replaceloop","s","sa","sav","save","select","set",
      "setexitflag","shuffle","skip","slavepatchsize","sort","splitarg","splitfirstarg","splitlastarg","stuffle","sum","sy",
      "sym","symb","symbo","symbol","symbols","symm","symme","symmet","symmetr","symmetri","symmetriz","symmetrize","t",
      "tablebase","te","ten","tens","tenso","tensor","tensors","term","testuse","threadbucketsize","totensor","tovector",
      "trace4","tracen","transform","tryreplace","u","unhide","uni","unit","unitt","unittr","unittra","unittrac","unittrace",
      "v","ve","vec","vect","vecto","vector","vectors","w","while","wr","wri","writ","write"
    ]);
    // var formatOptions = wordObj([
    //   "float", "rational", "nospaces", "spaces", "fortran", "doublefortran", "fortran90", "C", "maple", "mathematica", "reduce"
    // ]);
    var preprocessors = wordObj([
      "#append", "#break", "#call", "#case", "#close", "#commentchar", "#create", "#default", "#define", "#do", "#else",
      "#elseif", "#enddo", "#endif", "#endprocedure", "#endswitch", "#exchange", "#if", "#ifdef", "#ifndef", "#include",
      "#message", "#pipe", "#preout", "#procedure", "#redefine", "#remove", "#show", "#switch", "#system", "#terminate",
      "#undefine", "#write", "#external", "#toexternal", "#fromexternal", "#prompt", "#setexternal", "#rmexternal",
      "#setexternalattr"
    ]);
    var moduleInstructions = wordObj([
      ".clear", ".store", ".end", ".sort"
    ]);
    var indentWords = wordObj(["#do", "#if"]);
    var dedentWords = wordObj(["#enddo", "#else", "#elseif"]);
    var matching:{[key:string]:string} = {"[": "]", "{": "}", "(": ")"};
    var curPunc;
  
    function chain(newtok:any, stream:any, state:any) {
      state.tokenize.push(newtok);
      return newtok(stream, state);
    }
  
    function tokenBase(stream:any, state:any) {
      if (stream.sol()) {
        var start = stream.pos;
        if (stream.eatSpace()) {
          var ch = stream.next();
          if (ch == "*") {
            stream.skipToEnd();
            return "error";
          }
        } else {
          var ch = stream.next();
          if (ch == "*") {
            stream.skipToEnd();
            return "comment";
          }
        }
        stream.backUp(stream.pos-start);
      }
      if (stream.eatSpace()) return null;
      var ch = stream.next();
      if (ch == "[") {
        return chain(readQuoted("]", "string", ch == "[", false), stream, state);
      } else if (ch == '"') {
        return chain(readQuoted(ch, "string", ch == '"', false), stream, state);
      } else if (ch == '`') {
        return chain(readQuoted("'", "string-2", ch == '`', false), stream, state);
      } else if (ch == "'") {
        return chain(readQuoted(ch, "string-2", ch == "'", false), stream, state);
      } else if (ch == ".") {
        stream.eatWhile(/\w/);
        var word = stream.current();
        if (contains(moduleInstructions, word)) {
          return "header";
        }
      } else if (ch == "#") {
        stream.eatWhile(/\w/);
        var word = stream.current().toLowerCase();
        if (contains(preprocessors, word)) {
          return "keyword";
        }
      } else if (ch == "0") {
        if (stream.eat("x")) stream.eatWhile(/[\da-fA-F]/);
        else if (stream.eat("b")) stream.eatWhile(/[01]/);
        else stream.eatWhile(/[0-7]/);
        return "number";
      } else if (/\d/.test(ch)) {
        stream.match(/^[\d_]*(?:\.[\d_]+)?(?:[eE][+\-]?[\d_]+)?/);
        return "number";
      } else if (ch == "?") {
        return "qualifier";
      } else  if (/[A-Za-z]/.test(ch)) {
        stream.eatWhile(/[a-zA-Z0-9]/);
        var cur = stream.current().toLowerCase();
        if (contains(statements, cur) && stream.peek()==" ") {
          return "def";
        } else {
          return "variable";
        }
      } else if (ch == "|" && (state.varList || state.lastTok == "{" || state.lastTok == "do")) {
        curPunc = "|";
        return null;
      } else if (/[\(\)\[\]{}\\;]/.test(ch)) {
        curPunc = ch;
        return null;
      } else if (ch == "-" && stream.eat(">")) {
        return "arrow";
      } else if (/[=+\-\/*:\.^%<>~|]/.test(ch)) {
        var more = stream.eatWhile(/[=+\-\/*:\.^%<>~|]/);
        if (ch == "." && !more) curPunc = ".";
        return "operator";
      } else {
        return null;
      }
    }
  
    function contains(words:any, word:any) {
      // if (typeof words === "function") {
      //   return words(word);
      // } else {
        return words.propertyIsEnumerable(word);
      // }
    }
    function tokenBaseUntilBrace(depth:number) {
      if (!depth) depth = 1;
      return function(stream:any, state:any) {
        if (stream.peek() == "}") {
          if (depth == 1) {
            state.tokenize.pop();
            return state.tokenize[state.tokenize.length-1](stream, state);
          } else {
            state.tokenize[state.tokenize.length - 1] = tokenBaseUntilBrace(depth - 1);
          }
        } else if (stream.peek() == "{") {
          state.tokenize[state.tokenize.length - 1] = tokenBaseUntilBrace(depth + 1);
        }
        return tokenBase(stream, state);
      };
    }
    function tokenBaseOnce() {
      var alreadyCalled = false;
      return function(stream:any, state:any) {
        if (alreadyCalled) {
          state.tokenize.pop();
          return state.tokenize[state.tokenize.length-1](stream, state);
        }
        alreadyCalled = true;
        return tokenBase(stream, state);
      };
    }
    function readQuoted(quote:any, style:any, embed:any, unescaped:any) {
      return function(stream:any, state:any) {
        var escaped = false, ch;
  
        if (state.context.type === 'read-quoted-paused') {
          state.context = state.context.prev;
          stream.eat("}");
        }
  
        while ((ch = stream.next()) != null) {
          if (ch == quote && (unescaped || !escaped)) {
            state.tokenize.pop();
            break;
          }
          if (embed && ch == "#" && !escaped) {
            if (stream.eat("{")) {
              if (quote == "}") {
                state.context = {prev: state.context, type: 'read-quoted-paused'};
              }
              state.tokenize.push(tokenBaseUntilBrace(1));
              break;
            } else if (/[@\$]/.test(stream.peek())) {
              state.tokenize.push(tokenBaseOnce());
              break;
            }
          }
          escaped = !escaped && ch == "\\";
        }
        return style;
      };
    };
  
    return {
      startState: function() {
        return {tokenize: [tokenBase],
                indented: 0,
                context: {type: "top", indented: -config.indentUnit},
                continuedLine: false,
                lastTok: null,
                varList: false};
      },
  
      token: function(stream, state) {
        curPunc = null;
        if (stream.sol()) state.indented = stream.indentation();
        var style = state.tokenize[state.tokenize.length-1](stream, state), kwtype;
        var thisTok:any = curPunc;
        if (style == "keyword") {
          var word = stream.current();
          thisTok = word;
          if (indentWords.propertyIsEnumerable(word)) kwtype = "indent";
          else if (dedentWords.propertyIsEnumerable(word)) kwtype = "dedent";
          else if ((word == "#if" || word == "#else") && stream.column() == stream.indentation())
            kwtype = "indent";
          else if (word == "#procedure" && state.context.indented < state.indented)
            kwtype = "indent";
        }
        if (curPunc || (style && style != "comment")) state.lastTok = thisTok;
        if (curPunc == "|") state.varList = !state.varList;
  
        if (kwtype == "indent" || /[\(\[\{]/.test(curPunc))
          state.context = {prev: state.context, type: curPunc || style, indented: state.indented};
        else if ((kwtype == "dedent" || /[\)\]\}]/.test(curPunc)) && state.context.prev)
          state.context = state.context.prev;
  
        if (stream.eol())
          state.continuedLine = (curPunc == "\\" || style == "operator");
        return style;
      },
  
      indent: function(state, textAfter) {
        if (state.tokenize[state.tokenize.length-1] != tokenBase) return 0;
        var firstChar = textAfter && textAfter.charAt(0);
        var ct = state.context;
        var closing:boolean = ct.type == matching[firstChar] ||
          ct.type == "keyword" && /^(?:#enddo|#elseif|#else)\b/.test(textAfter);
        return ct.indented + (closing ? 0 : 2) +
          (state.continuedLine ? 2 : 0);
      },
  
      electricInput: /^\s*(?:#enddo|#elseif|#else)$/,
      lineComment: "*",
      fold: "indent"
    };
}, 'form');
// CodeMirror.registerHelper("hintWords", "form", form_keywords);
CodeMirror.defineMIME('text/x-form', "form");
CodeMirror.modeInfo.push({
    ext: ["frm"],
    mime: 'text/x-form',
    mode: 'form',
    name: 'FORM'
    });
console.log('Codemirror mode added');
