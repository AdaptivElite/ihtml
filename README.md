# iHtml
HTML inheritance parser and compiler.

## Syntax
* Comments can be added via '#'
* Each script has one from line at the top of the file to inhert the html.
* Each script must have at-least one block.
```
  from "fileWithHtml"

  block{

  }

  block{
    
  }
```

## CSS Queries
CSS queries use jQuery syntax to identify elements that are to be modified in the html.

## Block
Blocks are operations performed on elements from a CSS query. A element can be selected via [#] syntax the end of the block.

## Assignment Operations
* Append : =+
* Prepend : +=
* Set : =
* Replace : &needle
* Merge : ^= (only supported in binding attributes to merge JavaScript)

## Attributes
* string : Any normal attibute is passed in via a string
* :string : Binding attributes have a prepended ':'
* @string : Event attributes have a prepended '@'

## Element Operations
`&:operation = element-string`
* &:type : Changes the type for the selected elements.
* &:remove : Deletes the selected elements. Does not require element-string.
* &:wrap : Wraps the element inside a new element.
* &:add : Adds a new element inside the current elements. Can use prepend assignment.
* &:content : Sets the value of the html inside the element, must be a string literal.

## Anatomy of blocks
```
cssQuery {
  attribute = "value"
  :boundAttribute = "{ value : true }"
  @eventAttribute = "CallMethod()"
  &:type = type-change
  &:remove
  &:wrap = element-wrap
  &:add = element-append
  &:content = "html of component"
  cssQuery {
    attribute = "value"
  }[0] 
}
```

## Current missing features from syntax
* Operation remove
* Operation wrap
* Operation add
* Operation content
* Multipal blocks in root of script
* Event attributes
* Comments