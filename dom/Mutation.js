/**
 * 
 *  Lightweight wrapper around MutationObserver that provides methods to watch DOM changes.
 *  Uses a single observer instance internally to improve performance.
 *  
 *  // Watch for any DOM changes (additions, removals, attribute changes)
 *  Mutation.onAnyChange({ debounce: 200 }, changes => {
 *    changes.forEach(change => {
 *      if (change.type === 'add') {
 *        console.log('Added:', change.element);
 *        console.log('To parent:', change.parent);
 *        console.log('Between:', change.previousSibling, change.nextSibling);
 *      }
 *      if (change.type === 'remove') {
 *        console.log('Removed:', change.element);
 *        console.log('From parent:', change.parent);
 *      }
 *      if (change.type === 'attribute') {
 *        console.log('Changed:', change.attribute);
 *        console.log('From:', change.oldValue, 'to:', change.newValue);
 *      }
 *    });
 *  });
 *  
 *  // Watch for element additions or removals
 *  Mutation.onAddOrRemove({ debounce: 200 }, changes => {
 *    changes.forEach(change => {
 *      const action = change.type === 'add' ? 'added to' : 'removed from';
 *      console.log(`${change.element.tagName} ${action} ${change.parent.tagName}`);
 *    });
 *  });
 *  
 *  // Watch for element additions
 *  Mutation.onAddElement({ debounce: 200 }, changes => {
 *    changes.forEach(({ element, parent }) => {
 *      console.log(`${element.tagName} added to ${parent.tagName}`);
 *    });
 *  });
 *  
 *  // Watch for element removals with location info
 *  Mutation.onRemoveElement({ debounce: 200 }, changes => {
 *    changes.forEach(({ element, parent, previousSibling, nextSibling }) => {
 *      console.log(`${element.tagName} removed from ${parent.tagName}`);
 *      console.log('Was between:', previousSibling?.tagName, nextSibling?.tagName);
 *    });
 *  });
 *  
 *  // Watch for attribute changes
 *  Mutation.onAttribute({ debounce: 200 }, changes => {
 *    // Debounce collects multiple changes into an array
 *    changes.forEach(({ element, attribute, oldValue, newValue: newValue }) => {
 *      console.log(`${element.tagName} ${attribute} changed from ${oldValue} to ${newValue}`);
 *    });
 *  });
 *  
 */

const dummyElem = document.createElement("div");

const Mutation = {
  _callbacks: {
    anyChange: [],
    addOrRemove: [],
    addElement: [],
    removeElement: [],
    attribute: []
  },

  _observing: false,
  debug: false,

  _log(message, data = null, type = 'log') {
    if (!this.debug) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[Mutation ${timestamp}]`;
    
    if (data) {
      console[type](prefix, message, data);
    } else {
      console[type](prefix, message);
    }
  },

  _notify(type, changes) {
    this._log(`Notifying ${this._callbacks[type].length} callbacks of type "${type}"`, { changes });

    for (const callback of this._callbacks[type]) {
      const { fn, debounce = 0, selectorFilter, omitChangeDetails } = callback;

      // Apply filtering if there's a selector filter
      let filteredChanges = changes;
      if (selectorFilter) {
        this._log('Applying selector filter', { selectorFilter });
        filteredChanges = changes.filter(change => {
          if (typeof selectorFilter === 'string') {
            const matches = change.element.matches?.(selectorFilter) || false;
            this._log(`Selector "${selectorFilter}" match:`, { element: change.element, matches });
            return matches;
          }
          if (typeof selectorFilter === 'function') {
            const matches = selectorFilter(change.element);
            this._log('Custom filter match:', { element: change.element, matches });
            return matches;
          }
          return false;
        });
        this._log('Changes after filtering:', { filteredChanges });
      }

      // Skip if we have a selector filter and no matching changes
      if (selectorFilter && !filteredChanges.length) {
        this._log('No changes passed the filter, skipping callback');
        continue;
      }

      // Handle debouncing and callback execution
      if (debounce === 0) {
        // No debounce, execute immediately
        try {
          if (omitChangeDetails) {
            fn();
          } else {
            fn(filteredChanges);
          }
        } catch (e) {
          this._log('Error in callback execution:', e, 'error');
          console.error('Error in Mutation callback:', e);
        }
      } else {
        // Clear any existing timeout
        if (callback.timeout) {
          clearTimeout(callback.timeout);
          callback.timeout = null;
        }
        
        if (omitChangeDetails) {
          // For omitChangeDetails, just reset the timer
          callback.timeout = setTimeout(() => {
            callback.timeout = null;
            try {
              this._log('Executing debounced callback (no details)');
              fn();
            } catch (e) {
              this._log('Error in callback execution:', e, 'error');
              console.error('Error in Mutation callback:', e);
            }
          }, debounce);
        } else {
          // For callbacks with change details, accumulate changes
          if (!callback.pendingChanges) {
            callback.pendingChanges = [];
          }
          callback.pendingChanges.push(...filteredChanges);
          
          // Reset the timer
          callback.timeout = setTimeout(() => {
            const changes = callback.pendingChanges;
            callback.pendingChanges = null; // Reset to null, not empty array
            callback.timeout = null; // Clear the timeout reference
            try {
              this._log('Executing debounced callback with changes:', { changes });
              if (changes && changes.length > 0) {
                fn(changes);
              }
            } catch (e) {
              this._log('Error in callback execution:', e, 'error');
              console.error('Error in Mutation callback:', e);
            }
          }, debounce);
        }
      }
    }
  },

  _shouldIgnore(element) {
    while (element && element.nodeType === 1) {
      if (element.hasAttribute?.('mutations-ignore') || element.hasAttribute?.('save-ignore')) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  },

  _handleMutations(mutations) {
    this._log(`Processing ${mutations.length} mutations`, { mutations });
    
    const changes = [];
    const changesByType = {
      add: [],
      remove: [],
      attribute: [],
      characterData: []
    };

    for (const mutation of mutations) {
      // Check if the target or any parent has mutations-ignore attribute
      if (this._shouldIgnore(mutation.target)) {
        this._log('Ignoring mutation due to mutations-ignore attribute', { mutation });
        continue;
      }

      if (mutation.type === 'characterData') {
          this._log('Processing characterData mutation', { 
            element: mutation.target.parentElement,
            oldValue: mutation.oldValue,
            newValue: mutation.target.textContent
          });

          const change = {
            type: 'characterData',
            element: mutation.target.parentElement ?? dummyElem, // hacky, but ensures we always pass an element in the callback
            oldValue: mutation.oldValue,
            newValue: mutation.target.textContent
          };
          changes.push(change);
          changesByType.characterData.push(change);
      }

      if (mutation.type === 'childList') {
        this._log('Processing childList mutation', { 
          addedNodes: mutation.addedNodes,
          removedNodes: mutation.removedNodes
        });

        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && !this._shouldIgnore(node)) {
            const addedNodes = [node, ...node.querySelectorAll('*')];
            this._log(`Processing ${addedNodes.length} added nodes`, { addedNodes });
            
            for (const element of addedNodes) {
              const change = {
                type: 'add',
                element,
                parent: mutation.target,
                previousSibling: mutation.previousSibling,
                nextSibling: mutation.nextSibling
              };
              changes.push(change);
              changesByType.add.push(change);
            }
          }
        }
        
        for (const node of mutation.removedNodes) {
          if (node.nodeType === 1 && !node.hasAttribute?.('save-ignore') && !node.hasAttribute?.('mutations-ignore')) {
            const removedNodes = [node, ...node.querySelectorAll('*')];
            this._log(`Processing ${removedNodes.length} removed nodes`, { removedNodes });
            
            for (const element of removedNodes) {
              const change = {
                type: 'remove',
                element,
                parent: mutation.target,
                previousSibling: mutation.previousSibling,
                nextSibling: mutation.nextSibling
              };
              changes.push(change);
              changesByType.remove.push(change);
            }
          }
        }
      }
      
      if (mutation.type === 'attributes') {
        this._log('Processing attribute mutation', { 
          element: mutation.target,
          attribute: mutation.attributeName,
          oldValue: mutation.oldValue,
          newValue: mutation.target.getAttribute(mutation.attributeName)
        });

        const change = {
          type: 'attribute',
          element: mutation.target,
          attribute: mutation.attributeName,
          oldValue: mutation.oldValue,
          newValue: mutation.target.getAttribute(mutation.attributeName)
        };
        changes.push(change);
        changesByType.attribute.push(change);
      }
    }

    if (changes.length) {
      this._log('Processing collected changes', {
        total: changes.length,
        byType: {
          add: changesByType.add.length,
          remove: changesByType.remove.length,
          attribute: changesByType.attribute.length
        }
      });

      this._notify('anyChange', changes);

      const addOrRemove = [...changesByType.add, ...changesByType.remove];
      if (addOrRemove.length) {
        this._notify('addOrRemove', addOrRemove);
      }

      if (changesByType.add.length) {
        this._notify('addElement', changesByType.add);
      }
      if (changesByType.remove.length) {
        this._notify('removeElement', changesByType.remove);
      }
      if (changesByType.attribute.length) {
        this._notify('attribute', changesByType.attribute);
      }
    } else {
      this._log('No changes to process after filtering');
    }
  },

  _observer: null,

  _initializeObserver() {
    if (!this._observer) {
      this._log('Initializing MutationObserver');
      this._observer = new MutationObserver(this._handleMutations.bind(this));
    }
  },

  _addCallback(type, options = {}, callback) {
    this._log('Adding callback', { type, options });
    
    if (options.debug) {
      this.debug = true;
    }

    const cb = {
      fn: callback,
      debounce: options.debounce || 0,
      selectorFilter: options.selectorFilter,
      omitChangeDetails: options.omitChangeDetails,
      timeout: null,
      pendingChanges: null
    };
    
    this._callbacks[type].push(cb);
    this._log(`Added callback to ${type}. Total callbacks:`, {
      [type]: this._callbacks[type].length
    });
    
    this._startObserving();
    
    return () => {
      this._log('Removing callback', { type });
      const index = this._callbacks[type].indexOf(cb);
      if (index !== -1) {
        clearTimeout(cb.timeout);
        cb.pendingChanges = null;
        this._callbacks[type].splice(index, 1);
        this._log(`Removed callback from ${type}. Remaining callbacks:`, {
          [type]: this._callbacks[type].length
        });
      }
    };
  },

  _startObserving() {
    if (this._observing) {
      this._log('Already observing, skipping initialization');
      return;
    }
    
    this._log('Starting observation');
    this._initializeObserver();
    this._observer.observe(document.body, {
      childList: true,
      attributes: true,
      subtree: true,
      characterData: true,
      attributeOldValue: true
    });
    this._observing = true;
    this._log('Observation started');
  },

  onAnyChange(options = {}, callback) {
    return this._addCallback('anyChange', options, callback);
  },

  onAddOrRemove(options = {}, callback) {
    return this._addCallback('addOrRemove', options, callback);
  },

  onAddElement(options = {}, callback) {
    return this._addCallback('addElement', options, callback);
  },

  onRemoveElement(options = {}, callback) {
    return this._addCallback('removeElement', options, callback);
  },

  onAttribute(options = {}, callback) {
    return this._addCallback('attribute', options, callback);
  }
};

export default Mutation;