console.log('app.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');

    const textInput = document.getElementById('text-input');
    const submitBtn = document.getElementById('submit-btn');
    const diagramContainer = document.getElementById('diagram-container');
    const loadingIndicator = document.getElementById('loading');

    if (!textInput || !submitBtn || !diagramContainer) {
        console.error('Required elements not found');
        return;
    }

    console.log('All required elements found');

    submitBtn.addEventListener('click', async () => {
        console.log('Generate button clicked');
        const text = textInput.value;
        if (text) {
            try {
                submitBtn.disabled = true;
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'block';
                }
                diagramContainer.innerHTML = '';
                
                console.log('Sending text for analysis:', text);
                const analysis = await analyzeText(text);
                console.log('Received analysis:', analysis);
                await generateDiagram(analysis);
            } catch (error) {
                console.error('Error:', error);
                diagramContainer.innerHTML = `<p>Error: ${error.message}. Please try again later.</p>`;
            } finally {
                submitBtn.disabled = false;
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            }
        }
    });

    async function analyzeText(text) {
        console.log('Analyzing text...');
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        console.log('Response received:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Parsed response data:', data);

        if (!data.success) {
            throw new Error(data.error || 'Failed to analyze text');
        }
        return data.data;
    }

    async function generateDiagram(analysis) {
        console.log('Generating diagram with:', analysis);
        const { diagramType, themes } = analysis;

        if (!themes || themes.length === 0) {
            throw new Error('No themes provided for diagram generation');
        }

        let mermaidCode;
        switch (diagramType) {
            case 'Comparison':
                mermaidCode = generateComparisonDiagram(themes);
                break;
            case 'Hierarchy':
                mermaidCode = generateHierarchyDiagram(themes);
                break;
            default:
                mermaidCode = generateGenericDiagram(themes);
        }

        console.log('Generated Mermaid code:', mermaidCode);

        diagramContainer.innerHTML = '<div class="mermaid">' + mermaidCode + '</div>';

        console.log('Mermaid div added to container');

        try {
            console.log('Attempting to run Mermaid');
            await mermaid.run();
            console.log('Diagram generation completed');
        } catch (error) {
            console.error('Error rendering Mermaid diagram:', error);
            diagramContainer.innerHTML = `<p>Error rendering diagram: ${error.message}. Please try again later.</p>`;
        }
    }

    function generateComparisonDiagram(themes) {
        const emojiList = ['🔍', '⚖️', '🔀', '🆚', '📊'];
        return `%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'Comic Sans MS, cursive' }}}%%
            graph LR
                ${themes.map((theme, index) => `A${index}["${emojiList[index % emojiList.length]} ${theme.replace(/"/g, "'")}"]`).join('\n')}
                ${themes.slice(1).map((_, index) => `A0 <--> A${index + 1}`).join('\n')}
                classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
                classDef compare fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
                class A0 compare;
                class ${themes.slice(1).map((_, index) => `A${index + 1}`).join(',')} default;
                
                %% Add decorative elements
                style A0 stroke-dasharray: 5 5
                ${themes.slice(1).map((_, index) => `style A${index + 1} stroke-dasharray: 5 5`).join('\n')}`;
    }

    function generateHierarchyDiagram(themes) {
        const emojiList = ['👑', '🏆', '🎖️', '🥇', '🥈', '🥉', '🏅'];
        return `%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'Comic Sans MS, cursive' }}}%%
            graph TD
                ${themes.map((theme, index) => `A${index}["${emojiList[index % emojiList.length]} ${theme.replace(/"/g, "'")}"]`).join('\n')}
                ${themes.slice(0, -1).map((_, index) => `A${index} ==> A${index + 1}`).join('\n')}
                classDef default fill:#f0f4c3,stroke:#33691e,stroke-width:2px;
                classDef root fill:#c8e6c9,stroke:#1b5e20,stroke-width:3px;
                class A0 root;
                class ${themes.slice(1).map((_, index) => `A${index + 1}`).join(',')} default;
                
                %% Add decorative elements
                style A0 stroke-dasharray: 10 5
                ${themes.slice(1).map((_, index) => `style A${index + 1} stroke-dasharray: 5 5`).join('\n')}`;
    }

    function generateGenericDiagram(themes) {
        const emojiList = ['💡', '🔗', '🔄', '📌', '🎯', '🧩', '🔑'];
        return `%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'Comic Sans MS, cursive' }}}%%
            graph TB
                ${themes.map((theme, index) => `A${index}["${emojiList[index % emojiList.length]} ${theme.replace(/"/g, "'")}"]`).join('\n')}
                ${themes.slice(0, -1).map((_, index) => `A${index} -.-> A${index + 1}`).join('\n')}
                classDef default fill:#fff,stroke:#333,stroke-width:2px;
                classDef main fill:#ffe0b2,stroke:#e65100,stroke-width:3px;
                class A0 main;
                class ${themes.slice(1).map((_, index) => `A${index + 1}`).join(',')} default;
                
                %% Add decorative elements
                style A0 stroke-dasharray: 7 7
                ${themes.slice(1).map((_, index) => `style A${index + 1} stroke-dasharray: 3 3`).join('\n')}`;
    }
});
