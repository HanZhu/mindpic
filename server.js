const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set. Please set this environment variable.');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to disable caching
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Expires', '-1');
    res.set('Pragma', 'no-cache');
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

app.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, error: 'No text provided' });
        }

        console.log('Received text for analysis:', text);

        const prompt = `Analyze the following text and provide a summary suitable for diagram generation. Format the output as JSON:

{
  "diagramType": "One of: Mind Map, Flowchart, Hierarchy, Comparison, Timeline, or Generic Diagram",
  "themes": [
    "Main theme or central concept",
    "Subtheme or related concept 1",
    "Subtheme or related concept 2"
  ]
}

Rules:
1. Limit the number of themes to a maximum of 7.
2. Each theme should be a short phrase or single word, suitable for display in a diagram.
3. The first theme should be the main or central concept.
4. For Flowcharts, list the steps in order.
5. For Timelines, list events in chronological order.
6. For Comparisons, list the items being compared.

Input text:
${text}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {"role": "system", "content": "You are a helpful assistant that analyzes text and suggests appropriate diagram types and themes for visualization. Output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature: 0.7,
            max_tokens: 250
        });

        const aiResponse = completion.choices[0].message.content;
        console.log('AI Response:', aiResponse);

        // Parse the AI response as JSON
        const analysis = JSON.parse(aiResponse);
        
        console.log('Sending response:', { success: true, data: analysis });
        res.json({ success: true, data: analysis });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
