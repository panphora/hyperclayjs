function emmet(strings, ...values) {
    // Extract the Emmet syntax from the first string
    let emmetSyntax = strings[0];

    // Reconstruct the content from the rest of the strings and values
    let content = '';
    for (let i = 1; i < strings.length; i++) {
        content += values[i - 1];
        content += strings[i];
    }

    // Parse the tag name
    let tagMatch = emmetSyntax.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
    let tagName = tagMatch ? tagMatch[1] : 'div'; // Default to 'div' if no tag name is provided

    // Parse class names
    let classRegex = /\.([a-zA-Z0-9_-]+)/g;
    let classNames = [];
    let classMatch;
    while ((classMatch = classRegex.exec(emmetSyntax)) !== null) {
        classNames.push(classMatch[1]);
    }

    // Parse attributes
    let attrRegex = /\[([^\]=]+)=([^\]]+)\]/g;
    let attributes = {};
    let attrMatch;
    while ((attrMatch = attrRegex.exec(emmetSyntax)) !== null) {
        attributes[attrMatch[1]] = attrMatch[2];
    }

    // Build the opening tag
    let html = `<${tagName}`;

    // Add classes if any
    if (classNames.length > 0) {
        html += ` class="${classNames.join(' ')}"`;
    }

    // Add attributes if any
    for (let attr in attributes) {
        html += ` ${attr}="${attributes[attr]}"`;
    }

    html += '>';

    // Add the content
    html += content;

    // Close the tag
    html += `</${tagName}>`;

    return html;
}

// Self-export to hyperclay only
window.hyperclay = window.hyperclay || {};
window.hyperclay.emmet = emmet;

export default emmet;