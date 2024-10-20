document.addEventListener('DOMContentLoaded', async () => {
    const textInput = document.getElementById('text-input');
    const generateBtn = document.getElementById('generate-btn');
    const diagramContainer = document.getElementById('diagram-container');

    // Initialize Mermaid
    await mermaid.initialize({ startOnLoad: false });

    generateBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter some text to generate a diagram.');
            return;
        }

        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';

            console.log('Sending text for analysis:', text);
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Received analysis:', result);

            if (!result.success || !result.data) {
                throw new Error('Invalid response from server');
            }

            const analysis = result.data;
            const mermaidCode = generateMermaidCode(analysis);
            console.log('Generated Mermaid code:', mermaidCode);

            // Clear previous content
            diagramContainer.innerHTML = '';

            // Render the Mermaid diagram
            const { svg } = await mermaid.render('mermaid-diagram', mermaidCode);
            diagramContainer.innerHTML = svg;

            console.log('Mermaid diagram rendered successfully');

        } catch (error) {
            console.error('Error generating diagram:', error);
            diagramContainer.textContent = 'Error generating diagram. Please try again.';
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Diagram';
        }
    });

    function generateMermaidCode(analysis) {
        const { diagramType, themes } = analysis;
        
        switch (diagramType.toLowerCase()) {
            case 'comparison':
                return generateComparison(themes);
            case 'mind map':
                return generateMindMap(themes);
            case 'flowchart':
                return generateFlowchart(themes);
            case 'hierarchy':
                return generateHierarchy(themes);
            case 'timeline':
                return generateTimeline(themes);
            default:
                return generateGenericDiagram(themes);
        }
    }

    function generateComparison(themes) {
        let code = 'graph LR\n';
        code += `    main["Comparison"]\n`;
        themes.forEach((theme, index) => {
            code += `    theme${index}["${theme}"]\n`;
            code += `    main --- theme${index}\n`;
        });
        return code;
    }

    function generateMindMap(themes) {
        let code = 'mindmap\n';
        themes.forEach((theme, index) => {
            const indent = '  '.repeat(index);
            code += `${indent}${index === 0 ? 'root' : '-'} ${theme}\n`;
        });
        return code;
    }

    function generateFlowchart(themes) {
        let code = 'graph TD\n';
        themes.forEach((theme, index) => {
            code += `    A${index}["${theme}"]\n`;
        });
        for (let i = 0; i < themes.length - 1; i++) {
            code += `    A${i} --> A${i+1}\n`;
        }
        return code;
    }

    function generateHierarchy(themes) {
        let code = 'graph TD\n';
        themes.forEach((theme, index) => {
            code += `    A${index}["${theme}"]\n`;
            if (index > 0) {
                code += `    A0 --> A${index}\n`;
            }
        });
        return code;
    }

    function generateTimeline(themes) {
        let code = 'timeline\n';
        themes.forEach(theme => {
            code += `    ${theme}\n`;
        });
        return code;
    }

    function generateGenericDiagram(themes) {
        let code = 'graph TD\n';
        themes.forEach((theme, index) => {
            code += `    A${index}["${theme}"]\n`;
        });
        for (let i = 0; i < themes.length - 1; i++) {
            code += `    A${i} --> A${i+1}\n`;
        }
        return code;
    }
});
