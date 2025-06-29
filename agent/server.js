
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const axios = require('axios');

// const app = express();
// const PORT = 3001;

// app.use(cors());
// app.use(bodyParser.json({ limit: '10mb' })); // Increase payload size limit

// // POST /api/ask-llm
// app.post('/api/ask-llm', async (req, res) => {
//   const { prompt } = req.body;

//   if (!prompt) {
//     return res.status(400).json({ error: 'Prompt is required' });
//   }

//   // Validate prompt size (e.g., limit to 100k characters to avoid overwhelming Ollama)
//   if (prompt.length > 100000) {
//     return res.status(400).json({ error: 'Prompt is too large. Please reduce the input size.' });
//   }

//   try {
//     const ollamaRes = await axios.post(
//       'http://localhost:11434/api/generate',
//       {
//         model: 'llama3.2',
//         prompt: prompt,
//         stream: false,
//         options: {
//           num_ctx: 8192, // Set context window size
//           temperature: 0.7, // Adjust for coherent summaries
//         },
//       },
//       { timeout: 600000 } // 60-second timeout
//     );

//     const reply = ollamaRes.data.response;
//     if (!reply) {
//       return res.status(500).json({ error: 'Empty response from AI model' });
//     }

//     return res.json({ response: reply });
//   } catch (err) {
//     console.error('Ollama request failed:', err.message);
//     return res.status(500).json({ error: `Failed to generate response: ${err.message}` });
//   }
// });

// // Root route for health check
// app.get('/', (req, res) => {
//   res.send('AI Agent Backend Running ✅');
// });

// app.listen(PORT, () => {
//   console.log(`🧠 LLM agent server running at http://localhost:${PORT}`);
// });







const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json({ limit: '10mb' }));

// Health check route
app.get('/', (req, res) => {
  res.send('AI Agent Backend Running ✅');
});

// AI agent route
app.post('/api/ask-llm', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (prompt.length > 100000) {
    return res.status(400).json({ error: 'Prompt is too large.' });
  }

  try {
    console.log('Sending request to Ollama with prompt length:', prompt.length);

    const ollamaRes = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'llama3.2',
        prompt: prompt,
        stream: false,
        options: {
          num_ctx: 8192,
          temperature: 0.7,
        },
      },
      {
        timeout: 120000,
        validateStatus: status => status >= 200 && status < 500,
      }
    );

    console.log('Ollama response status:', ollamaRes.status);
    console.log('Ollama response headers:', ollamaRes.headers);

    // Check if Content-Type starts with 'application/json'
    const contentType = ollamaRes.headers['content-type'] || '';
    if (!contentType.startsWith('application/json')) {
      console.error('Unexpected Content-Type:', contentType);
      return res.status(500).json({ error: 'Invalid response format from AI server', details: contentType });
    }

    const reply = ollamaRes.data.response;
    if (!reply) {
      return res.status(500).json({ error: 'Empty response from AI model' });
    }

    return res.json({ response: reply });
  } catch (err) {
    console.error('Ollama request failed:', err.message, err.response?.data);
    return res.status(500).json({
      error: `Failed to generate response: ${err.message}`,
      details: err.response?.data || 'No additional details',
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🧠 LLM agent server running at http://localhost:${PORT}`);
});