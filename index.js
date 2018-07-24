const { GenerateCompiler } = require( "./ihtmlCompiler.js" );
const { CompileHtml } = require( "./htmlCompiler.js" );

const compiler = GenerateCompiler();

function _ApplyBodyElement( output, element ){
  if( element.type === "typeChange" ){
    switch( element.value.changeApplication ){
      case "set":
        output.push( { method : "TypeSet", args : [ element.value.element ] } );
        break;
    }
  }
  else if( element.type === "attributeChange" ){
    output.push( { method : "Attr", args : [ element.value.attributeName ] } );
    switch( element.value.changeApplication ){
      case "set":
        output.push( { method : "Set", args : [ element.value.attributeValue ] } );
        break;
    }
    output.push( { method : "Apply" } );
  }
  else if( element.type === "bindingChange" ){
    output.push( { method : "BindMerge", args : [ element.value.bindingAttribute, element.value.boundValue, element.value.mergeStrategy ] } );
  }
  else if( element.type === "wrapElement" ){
    output.push( { method : "WrapElement", args : [ element.value.element ] } );
    element.value.bodyElements.filter( x => x.type !== "block" ).forEach( x => _ApplyBodyElement( output, x ) );
    element.value.bodyElements.filter( x => x.type === "block" ).forEach( x => _ConvertBodyElement( x.value, output ) );
    output.push( { method : "Apply" } );
  }
  else if( element.type === "removeElement" ){
    output.push( { method : "RemoveElement", args : [ element.value.element ] } );
  }
  else if( element.type === "addElement" ){
    output.push( { method : "AddElement", args : [ element.value.element ] } );
    element.value.bodyElements.filter( x => x.type !== "block" ).forEach( x => _ApplyBodyElement( output, x ) );
    element.value.bodyElements.filter( x => x.type === "block" ).forEach( x => _ConvertBodyElement( x.value, output ) );
    output.push( { method : "Apply" } );
  }
}

function _ConvertBodyElement( element, output = [] ){

  output.push( { method : "Node", args : [ element.scan ] } );

  element.bodyElements.filter( x => x.type !== "block" ).forEach( x =>  _ApplyBodyElement( output, x ) );

  element.bodyElements.filter( x => x.type === "block" ).forEach( x => _ConvertBodyElement( x.value, output ) );

  output.push( { method : "Apply" } );
  return output;
}

module.exports = {
  IHtmlParser( source ){
    let parserSavedData = {
      rootBlocks : []
    };

    
    compiler.ParseScript( source.trim(), parserSavedData );

    let buildProcess = [];
    parserSavedData.rootBlocks.map( x => buildProcess = buildProcess.concat( _ConvertBodyElement( x ) ) );
    return {
      from : parserSavedData.from,
      buildProcess : buildProcess
    }
  },

  CompileHtml
};