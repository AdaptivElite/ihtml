const html = `
	<template>
	  <section>
		<label v-if="label && !labelPosition" :for="id || autoId">{{ label }}</label>
		<input v-if="!area" @keydown="KeyEvent( 'keydown', $event )" ref="input" :id="id || autoId" :value="value" @input="Changed()" :type="type"
		  @keyup="KeyEvent( 'keyup', $event )" @blur="Blur( $event )" :placeholder="placeholder"
		  @keypress="KeyEvent( 'keypress', $event )" />
		<textarea v-if="area" @keydown="KeyEvent( 'keydown', $event )" ref="input" :id="id || autoId" :value="value" @input="Changed()" :type="type"
		  @keyup="KeyEvent( 'keyup', $event )" @blur="Blur( $event )" :placeholder="placeholder"
		  @keypress="KeyEvent( 'keypress', $event )"></textarea>
		<label v-if="label && labelPosition" :for="id || autoId">{{ label }}</label>
		<div class="valid" v-if="hasValidation && validMessage !== null">
		  {{ validMessage }}
		</div>
		<div v-if="hasValidation && invalidMessage !== null" class="invalid">
		  {{ invalidMessage }}
		</div>
		<div v-if="about" class="about"> {{ about }}</div>
	  </section>
	</template>
`;
const ihtmlSource = `
  from 'vuejs-core/components/textbox.vue'

  section{
    style = 'margin-bottom: 15px;'
    *[ref='input']{
      class = 'form-control'
      :class = \`{
        'is-valid' : hasValidation && initialBlur && isValid,
        'is-invalid' : hasValidation && initialBlur && !isValid
      }\`
    }
    div.invalid{
      class = 'invalid-feedback'
    }
    div.valid{
      class = 'valid-feedback'
    }
    div.about{
      &:type = small
      class = 'form-text text-muted'
    }
  }
`;


let { IHtmlParser, CompileHtml } = require( "./" );

let ihtml = IHtmlParser( ihtmlSource );

console.log( ihtml );

let compiledContent = CompileHtml( ihtml, html, "jsdom-template" );

console.log( compiledContent );