//Import BNF compiler//
const { Compiler } = require( "bnf" );

//Complex js, this might be a bit much....
const javaScriptBnf = `
  <SYNTAX> ::= <jsObject> | <jsArray>
    <jsObject> ::= "{" <ANYWSP> [ <jsProperty> <ANYWSP> *( "," <ANYWSP> <jsProperty> <ANYWSP> ) ] <ANYWSP> "}"
      <jsProperty> ::= <jsPropertyName> <ANYWSP> ":" <ANYWSP> <jsType>
        <jsPropertyName> ::= <LITERAL> | "[" <jsInline> "]" | <jsIdentifier>
    <jsArray> ::= "[" <ANYWSP> [ <jsType> <ANYWSP> *( "," <ANYWSP> <jsType> <ANYWSP> ) ] <ANYWSP> "]"
    <jsType> ::= <jsObject> | <jsArray> | <NUMBER> | <QLITERAL> | <jsInline>
    <jsIdentifier> ::= ( <ALPHA> | "_" ) *( <ALPHA> | <DIGITS> | "_" )
    ;<jsField> ::= <jsFieldName> <ANYWSP> [ "(" <ANYWSP> <jsArgs> <ANYWSP> ")" ]
    ;<jsInline> ::= <jsField> | <jsType>
`;

const ihtmlBnf = `
  <SYNTAX> ::= <from> 1*( <CRLF> <ANYWSP> <block> )
    <from> ::= "from" <WSP> <fromPath>
      <fromPath> ::= <LITERAL>
      <block> ::= "@" <OWSP> <cssQuery> <OWSP> "{" <CRLF> *( <WSP> <bodyElement> <CRLF> ) <OWSP> "}"
        <cssQuery> ::= 1*<cssQueryChar>
        ; This can be improved to make sure css syntax is accurate, or not.
        <cssQueryChar> ::= ( %x20-3e | %x41-7a | %x7c | %x7e ) ; Basicly anything except for '?', '@', '{', and '}'.
        <bodyElement> ::= <typeChange> | <attributeChange> | <bindingChange> | <wrapper> | <block>
          <typeChange> ::= "type" <OWSP> <changeApplication> <OWSP> <elementString>
          <attributeChange> ::= "@@" <elementString> <OWSP> <changeApplication> <OWSP> <changeValue>
          <bindingChange> ::= "@:" <elementString> <OWSP> "{{" <jsString> "}}" <mergeStrategy>
            <mergeStrategy> ::= "." ( "set" | "new" | "ex" )
            <jsString> ::= *( %x09-0a | %x0d | %x20-7c | %x7e | !"}}." %x7d )
          <wrapper> ::= "todo"
        <changeApplication> ::= <set> | <append> | <prepend> | <replace>
        <changeValue> ::= <LITERAL>
          <set> ::= "="
          <append> ::= "=+"
          <prepend> ::= "+="
          <replace> ::= "todo"
        <elementString> ::= <ALPHA> *( <ALPHA> | <DIGIT> | "-" | "_" )
`;

module.exports = {
  GenerateCompiler(){
    //Instance a BNF compiler//
    let compiler = new Compiler();

    //Add new language for the bnf//
    compiler.AddLanguage( ihtmlBnf, "ihtml" );
    compiler.AddLanguage( javaScriptBnf, "javaScriptObject" );

    //Set the execute rules
    compiler.SetRuleEvents({
      fromPath( token, dataObject ){
        dataObject.from = token.value.substring( 1, token.value.length - 1 );
      },
      block( token, dataObject ){
        let bodyElement = token.Parent("bodyElement");
        token.scan = token.Child( "cssQuery" ).value;
        if( bodyElement === null ){
          dataObject.rootBlocks.push( {
            scan : token.scan,
            bodyElements : token.bodyElements
          });
        }
      },
      bodyElement( token ){

        let generateChangeApplication = function( token ){
          let applicationType = token.tokens[0].name;

          if( applicationType !== "replace" ){
            return applicationType;
          }
          else {
            return "TODO";
          }
        };

        let block = token.Parent( "block" );
        block.bodyElements = block.bodyElements || [];
        let bodyData = {
          type : token.tokens[0].name,
          value : token.value
        };
        switch( bodyData.type ){
          case "bindingChange":
            bodyData.value = {
              bindingAttribute : token.Child( "elementString" ).value,
              mergeStrategy : token.Child( "mergeStrategy" ).value.substring( 1 ),
              boundValue : token.Child( "jsString" ).value.replace( /[\n\t\r]/g, "" ).trim()
            };
            break;
          case "typeChange":
            bodyData.value = {
              changeApplication : generateChangeApplication( token.Child( "changeApplication" ) ),
              element : token.Child( "elementString" ).value
            };
            break;
          case "attributeChange":
            let changeValue = token.Child( "changeValue" ).value;
            bodyData.value = {
              changeApplication : generateChangeApplication( token.Child( "changeApplication" ) ),
              attributeName : token.Child( "elementString" ).value,
              attributeValue : changeValue.substring( 1, changeValue.length - 1 )
            };
            break;
          case "block":
            bodyData.value = {
              scan : token.tokens[0].scan,
              bodyElements : token.tokens[0].bodyElements
            };
            break;
        }
        block.bodyElements.push( bodyData );
      }
    });

    return compiler;
  }
}

