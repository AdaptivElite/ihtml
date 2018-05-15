const { GenerateCompiler } = require( "./ihtmlCompiler.js" );
const { CompileHtml } = require( "./htmlCompiler.js" );

function _ConvertBodyElement( element ){
  let output = [];

  output.push( { method : "Node", args : [ element.scan ] } );

  element.bodyElements.filter( x => x.type !== "block" ).map( ( x ) => {
    if( x.type === "typeChange" ){
      switch( x.value.changeApplication ){
        case "set":
          output.push( { method : "TypeSet", args : [ x.value.element ] } );
          break;
      }
    }
    else if( x.type === "attributeChange" ){
      output.push( { method : "Attr", args : [ x.value.attributeName ] } );
      switch( x.value.changeApplication ){
        case "set":
          output.push( { method : "Set", args : [ x.value.attributeValue ] } );
          break;
      }
      output.push( { method : "Apply" } );
    }
    else if( x.type === "bindingChange" ){
      output.push( { method : "BindMerge", args : [ x.value.bindingAttribute, x.value.boundValue, x.value.mergeStrategy ] } );
    }
  } );

  let additionalOutputs = [];

  element.bodyElements.filter( x => x.type === "block" ).map( x => additionalOutputs = additionalOutputs.concat( _ConvertBodyElement( x.value ) ) );

  output = output.concat( additionalOutputs );

  output.push( { method : "Apply" } );
  return output;
}

module.exports = {
  IHtmlParser( source ){
    let parserSavedData = {
      rootBlocks : []
    };

    let compiler = GenerateCompiler();
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