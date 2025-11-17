/**
* 
*  Automatically show/hide elements with "option" attributes based on ancestors' attributes.
*  
*  # Usage:
*  optionVisibilityRuleGenerator.debug = true;
*  optionVisibilityRuleGenerator.start();
*  
*  # HTML Example:
*  <div editmode="true">                  <!-- Parent element with matching attribute -->
*    <div option:editmode="true"></div>   <!-- This will be visible -->
*    <div option:editmode="false"></div>  <!-- This will be hidden -->
*  </div>
*  
*  Elements with `option:` attributes will be:
*  - Visible if any ancestor has matching attribute
*  - Hidden if no ancestor has matching attribute
* 
*/
import Mutation from "../utilities/mutation.js";

const optionVisibilityRuleGenerator = {
  debug: false,
  styleElement: null,

  HIDDEN_STYLES: `
    visibility: hidden;
    pointer-events: none;
    width: 0;
    height: 0;
    overflow: hidden;
  `,
  VISIBLE_STYLES: `
    visibility: visible;
    pointer-events: auto;
    width: auto;
    height: auto;
    overflow: visible;
  `,

  STYLE_CLASS: 'option-visibility-styles',

  log(message, ...args) {
    if (this.debug) {
      console.log(`[OptionVisibilityRuleGenerator] ${message}`, ...args);
    }
  },

  findOptionAttributes() {
    const html = document.documentElement.outerHTML;
    const optionAttributes = new Set(); // Using Set for unique combinations
    const optionRegex = /option:([^\s"']+)=["']([^"']+)["']/g; // regex: "option:" + (anything but space and quote) + equal + quote + (anything but quote) + quote
    
    let match;
    while ((match = optionRegex.exec(html)) !== null) {
      // Create a unique key for each name-value pair
      const key = JSON.stringify({name: match[1], value: match[2]});
      optionAttributes.add(key);
    }
    
    // Convert back to objects
    return Array.from(optionAttributes).map(key => JSON.parse(key));
  },

  minifyCSS(css) {
    return css
      .replace(/\s+/g, ' ')
      .replace(/{\s+/g, '{')
      .replace(/\s+}/g, '}')
      .replace(/;\s+/g, ';')
      .replace(/:\s+/g, ':')
      .trim();
  },

  generateCSSRules(optionAttributes) {
    const rules = [];
    
    optionAttributes.forEach(({name, value}) => {
      const escapedValue = value.replace(/["\\]/g, '\\$&');
      
      rules.push(`
        [option\\:${name}="${escapedValue}"] {
          ${this.HIDDEN_STYLES}
        }
      `);
      
      rules.push(`
        [${name}="${escapedValue}"] [option\\:${name}="${escapedValue}"] {
          ${this.VISIBLE_STYLES}
        }
      `);
    });
    
    return this.minifyCSS(rules.join('\n'));
  },

  generateRules() {
   try {
     this.log('Starting rule generation');
     
     const optionAttributes = this.findOptionAttributes();
     this.log('Found option attributes:', optionAttributes);
     
     // Early return if no option attributes found
     if (optionAttributes.length === 0) {
       this.log('No option attributes found, skipping style creation');
       return;
     }
     
     const cssRules = this.generateCSSRules(optionAttributes);
     this.log('Generated CSS rules:', cssRules);
     
     // Check if we already have these exact rules
     const existingStyleElement = document.head.querySelector(`.${this.STYLE_CLASS}`);
     if (existingStyleElement && existingStyleElement.textContent.trim() === cssRules) {
       this.log('Rules unchanged, skipping update');
       return;
     }
     
     // Create new style element
     const newStyleElement = document.createElement('style');
     newStyleElement.className = this.STYLE_CLASS;
     newStyleElement.textContent = cssRules;
     document.head.appendChild(newStyleElement);
     
     // Remove all previous style elements
     document.head
       .querySelectorAll(`.${this.STYLE_CLASS}`)
       .forEach(el => {
         if (el !== newStyleElement) {
           el.remove();
         }
       });
     
     this.styleElement = newStyleElement;
     
     this.log('Rule generation complete');
   } catch (error) {
     console.error('Error generating visibility rules:', error);
   }
  },

  start() {
    Mutation.onAnyChange({
      selectorFilter: el => [...el.attributes].some(attr => attr.name.startsWith('option:')),
      debounce: 200
    }, () => {
      this.generateRules();
    });
    this.generateRules();
    this.log('Started observing DOM mutations');
  },
};

export default optionVisibilityRuleGenerator;

// Auto-initialize
export function init() {
  optionVisibilityRuleGenerator.start();
}