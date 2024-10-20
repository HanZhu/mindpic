function generateDiagram(mermaidCode) {
  const container = document.getElementById('diagram-container');
  container.innerHTML = ''; // Clear previous content

  const pre = document.createElement('pre');
  pre.className = 'mermaid';
  pre.textContent = mermaidCode;
  container.appendChild(pre);

  // Set the flag to indicate Mermaid is used on this page
  document.body.setAttribute('data-has-mermaid', 'true');

  // Run Mermaid
  mermaid.run();
}
