document.addEventListener('DOMContentLoaded', () => {
  // ... other initialization code ...

  const generateButton = document.getElementById('generate-diagram');
  generateButton.addEventListener('click', async () => {
    // ... your existing code to get the text input ...

    try {
      const response = await fetch('/analyze', { /* your fetch options */ });
      const data = await response.json();
      
      if (data.diagramType === 'mermaid') {
        generateDiagram(data.mermaidCode);
      } else {
        // Handle other diagram types or display an error
      }
    } catch (error) {
      console.error('Error generating diagram:', error);
      // Display error to user
    }
  });
});
