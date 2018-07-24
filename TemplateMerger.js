let innerContext = 0;

class Attr{

  constructor( attributeName, node, jqueryContext ){
    this.$ = jqueryContext;
    this._node = node;
    this._attributeName = this._NormalizeAttrName( attributeName );
  }

  _NormalizeAttrName( attr ){
    if( attr.startsWith( "@" ) ){
      attr = "v-on:" + attr.substring( 1 );
    }

    return attr;
  }

  Apply(){
    return this._node;
  }

  Set( val ){
    if( val instanceof Function ){
      this._node.element.each( ( index, element ) => {
        this.$( element ).attr( this._attributeName, val( this.$( element ).attr( this._attributeName ) || "" ) );
      });
    }
    else{
      this._node.element.each( ( index, element ) => {
        this.$( element ).attr( this._attributeName, val );
      });
    }

    return this;
  }

  Append( val, includeSpace = true ){
    if( includeSpace ){
      val = " " + val;
    }
    this._node.element.each( ( index, element ) => {
      this.$( element ).attr( this._attributeName, ( this.$( element ).attr( this._attributeName ) || "" ) + val );
    });

    return this;
  }

  Prepend( val, includeSpace = true ){
    if( includeSpace ){
      val = val + " ";
    }
    this._node.element.each( ( index, element ) => {
      this.$( element ).attr( this._attributeName, val + ( this.$( element ).attr( this._attributeName ) || "" ) );
    });

    return this;
  }

  Replace( search, replace ){
    this._node.element.each( ( index, element ) => {
      this.$( element ).attr( this._attributeName, ( this.$( element ).attr( this._attributeName ) || "" ).replace( search, replace ) );
    } );

    return this;
  }
}

class Node{
  constructor( element, templateMerge, jqueryContext, parentNode = null ){
    this.$ = jqueryContext;
    this._templateMerge = templateMerge;
    this.element = element;
    this._parentNode = parentNode;
  }

  Set( val ){
    if( val instanceof Function ){
      this.element.each( ( index, element ) => {
        this.$( element ).html( val( this.$( element ).html() || "" ) );
      });
    }
    else{
      this.element.each( ( index, element ) => {
        this.$( element ).html( val );
      } );
    }

    return this;
  }

  Append( val ){
    this.element.each( ( index, element ) => {
      this.$( element ).html( ( this.$( element ).html() || "" ) + val );
    });

    return this;
  }

  Prepend( val ){
    this.element.each( ( index, element ) => {
      this.$( element ).html( val + ( this.$( element ).html() || "" ) );
    });

    return this;
  }

  Replace( search, replace ){
    this.element.each( ( index, element ) => {
      this.$( element ).html( ( this.$( element ).html() || "" ).replace( search, replace ) );
    } );

    return this;
  }

  AddElement( newElement ){
    let wrapContext = innerContext++;
    this.element.each( ( index, element ) => {
      let newNode = this.$( "<" + newElement + ">" );
      newNode.attr( "__IHTML_HOOK__", wrapContext );
      this.$(element).append( newNode );
    } );

    return new Node( this.$( "[__IHTML_HOOK__='" + wrapContext + "']", this.element ), this, this.$, this );
  }

  RemoveElement( removeQuery ){
    this.element.each( ( index, element ) => {
      this.$(removeQuery, element ).remove();
    } );

    return this;
  }

  WrapElement( newParent ){

    let wrapContext = innerContext++;
    let wrapParent = this.element.parent();
    this.element.each( ( index, element ) => {
      let parentNode = this.$( "<" + newParent + ">" );
      parentNode.attr( "__IHTML_HOOK__", wrapContext );
      this.$(element).after( parentNode );
      parentNode.append( element );
    } );
    
    return new Node( this.$( "[__IHTML_HOOK__='" + wrapContext + "']", wrapParent ), this, this.$, this );

  }

  BindMerge( bindingAttribute, mergeObject, mergeStrategy ){
    this.element.each( ( index, element ) => {
      if( !this.$( element ).attr( ":" + bindingAttribute ) ){
        this.$( element ).attr( ":" + bindingAttribute, mergeObject );
      }
    });

    return this;
  }

  Attr( attributeName ){
    return new Attr( attributeName, this, this.$ );
  }

  Apply(){
    this.element.each( ( index, element ) => {
      this.$( element ).removeAttr( "__IHTML_HOOK__" );
    } );
    return this._parentNode || this._templateMerge;
  }

  Node( nodePath ){
    return new Node( this.$( nodePath, this.element ), this, this.$, this );
  }

  TypeSet( elementType ){
    this.element.each( ( index, element ) => {
      let outerHtml = element.outerHTML;
      
      let match = outerHtml.match( /<([_A-z][A-z/d_\-]*)/ );
      outerHtml = "<" + elementType + " " + outerHtml.substring( match[1].length + 2, outerHtml.length - 1 - match[1].length ) + elementType + ">";

      let copy = this.$( outerHtml );
      copy.attr( "__IHTML_HOOK__", "typeset" );

      this.$( element ).after( copy );
      this.$( element ).remove();
    } );

    if( this.parentNode === null ){
      this.element = this.$( "*[__IHTML_HOOK__='typeset']", this._templateMerge.templateElement );
    }
    else{
      this.element = this.$( "*[__IHTML_HOOK__='typeset']", this._parentNode.element );
    }

    this.element.each( ( index, element ) => {
      this.$( element ).removeAttr( "__IHTML_HOOK__" );
    } );

    return this;
  }
}

exports.TemplateMerger = class TemplateMerger{
  constructor( templateElement, jqueryContext ){
    this.templateElement = templateElement;
    this.$ = jqueryContext;
    this._NormalizeAttrs();
  }

  _NormalizeAttrs(){
    this.$( this.templateElement ).each( ( index, element ) => {
      this._NormalizeAttr( element );
    });
  }

  _NormalizeAttr( node ){
    if( node.attributes ){

      this.$.each( node.attributes, ( index, attribute ) => {
        if( attribute.name.startsWith( "@" ) ){
          this.$( node ).attr( "v-on:" + attribute.name.substring( 1 ), attribute.value );
          this.$( node ).attr( attribute.name, null );
        }
      });
    }
  }

  Node( nodePath ){
    if( !nodePath ){
      return new Node( this.templateElement, this, this.$ );
    }
    else{
      return new Node( this.$( nodePath, this.templateElement ), this, this.$ );
    }
  }

  Compile(){
    //console.log( "TEMPLATE DEBUG", this.templateElement[0].outerHTML );
    return this.templateElement.html();
  }

}