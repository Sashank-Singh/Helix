// server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const authRoutes = require('./routes/auth');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
let port = process.env.PORT || 5500;

// Use CORS middleware with specified origins and methods
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Initialize OpenAI with the provided API key.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create HTTP server and attach Socket.IO for live updates.
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
  }
});

// When a new client connects via websockets.
io.on('connection', (socket) => {
  console.log('A client connected. Socket id:', socket.id);
});

// Function to build sequence prompts (editing, adding, or creating new sequence)
function buildSequencePrompts(message, currentSequence) {
  const msgLC = message.toLowerCase();
  // Edit step branch has highest priority
  if (msgLC.includes('edit step') || msgLC.includes('change step')) {
    const stepNumberMatch = message.match(/(?:edit|change) step (\d+)/i);
    if (!stepNumberMatch) {
      return { error: "Please specify the step number to edit in your request." };
    }
    const stepNumber = stepNumberMatch[1];
    if (!currentSequence) {
      return { error: "No existing sequence to edit." };
    }
    // Compare using string conversion to avoid type mismatch.
    const stepToEdit = currentSequence.steps.find(s => s.id.toString() === stepNumber.toString());
    if (!stepToEdit) {
      return { error: `I couldn't find step ${stepNumber} in your sequence. Please check the step number.` };
    }
    const systemPrompt = `You are Helix, an AI recruiting assistant. EDIT an existing step in a recruiting sequence.
The edited step should be returned as JSON in the following format:
{
  "steps": [
    {
      "id": "${stepNumber}",
      "title": "Updated Step Title Here",
      "description": "Updated detailed step description here (2-3 sentences)"
    }
  ]
}
Current step to edit:
Step ${stepNumber}: ${stepToEdit.title}
Description: ${stepToEdit.description}
ONLY return the JSON for the edited step, nothing else.`;

    const userPrompt = `Edit step ${stepNumber} based on this request: ${message}. Make sure to incorporate the changes requested while preserving the overall purpose of the step.`;
    return { systemPrompt, userPrompt, command: "edit", stepNumber };
  }
  // Add step branch
  else if (msgLC.includes('add step')) {
    const stepNumberMatch = message.match(/add step (\d+)/i);
    let nextStepNumber;
    if (currentSequence && currentSequence.steps.length > 0) {
      nextStepNumber = Math.max(...currentSequence.steps.map(s => parseInt(s.id))) + 1;
    } else {
      nextStepNumber = 1;
    }
    // If the user specified a step number, use it; otherwise, use auto-assignment.
    const stepNumber = stepNumberMatch ? stepNumberMatch[1] : nextStepNumber.toString();

    const systemPrompt = `You are Helix, an AI recruiting assistant. Create a NEW STEP for an existing recruiting sequence.
The step should be formatted as follows:
{
  "steps": [
    {
      "id": "${stepNumber}",
      "title": "Step Title Here",
      "description": "Detailed step description here (2-3 sentences)"
    }
  ]
}
Current sequence steps:
${currentSequence && currentSequence.steps.length > 0 ? currentSequence.steps.map(s => `${s.id}. ${s.title}`).join('\n') : 'No existing steps'}
ONLY return the JSON for the new step, nothing else.`;

    const userPrompt = `Create a new step (step ${stepNumber}) for the sequence based on this request: ${message}. Be detailed and specific.`;
    return { systemPrompt, userPrompt, command: "add", stepNumber };
  }
  // Modification request that implies adding a step (e.g. "update sequence", "modify sequence", "add to sequence")
  else if ((msgLC.includes('update sequence') || msgLC.includes('modify sequence') || msgLC.includes('add to sequence')) && currentSequence) {
    const nextStepNumber = Math.max(...currentSequence.steps.map(s => parseInt(s.id))) + 1;
    const systemPrompt = `You are Helix, an AI recruiting assistant. Add a new step to the existing recruiting sequence while preserving its structure.
Return only the new step in JSON format following this structure:
{
  "steps": [
    {
      "id": "${nextStepNumber}",
      "title": "New Step Title",
      "description": "Detailed description of what needs to be done in this step (2-3 sentences)"
    }
  ]
}
Current sequence steps:
${currentSequence.steps.map(s => `${s.id}. ${s.title}`).join('\n')}
ONLY return the JSON for the new step. Make the content detailed and specific.`;

    const userPrompt = `Please add a new step to the sequence based on this request: ${message}. Return ONLY the JSON for the new step.`;
    return { systemPrompt, userPrompt, command: "add", stepNumber: nextStepNumber.toString() };
  }
  // If the message mentions sequence but no existing sequence provided or no specific command, assume new sequence creation
  else if (msgLC.includes('sequence') || msgLC.includes('recruiting steps') || msgLC.includes('recruitment process')) {
    const systemPrompt = `You are Helix, an AI recruiting assistant. Generate a detailed recruiting sequence in JSON format following this exact structure:
{
  "title": "Recruiting Sequence Title",
  "description": "A detailed description of the overall recruiting process",
  "steps": [
    {
      "id": "1",
      "title": "Step Title",
      "description": "Detailed description of what needs to be done in this step (2-3 sentences)"
    }
  ]
}
Make the content detailed and specific to the requested role. Include at least 5-7 steps covering the entire recruitment process from job posting to offer letter.`;
    const userPrompt = `Create a detailed recruiting sequence for: ${message}. Ensure the steps include specific requirements, interview questions, and evaluation criteria.`;
    return { systemPrompt, userPrompt, command: "new" };
  }
  // Otherwise, treat the request as a general chat message.
  return {
    systemPrompt: "You are Helix, an AI recruiting assistant. You help with recruiting tasks and provide detailed responses.",
    userPrompt: message,
    command: "chat"
  };
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    // Destructure message and currentSequence from the request body.
    const { message, currentSequence } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log("Received message:", message);
    console.log("Current sequence:", currentSequence);

    // Determine the proper prompts and command based on the request.
    const prompts = buildSequencePrompts(message, currentSequence);

    // If there was an error while building prompts, return it directly.
    if (prompts.error) {
      return res.json({
        response: prompts.error,
        isSequence: false
      });
    }

    const { systemPrompt, userPrompt, command, stepNumber } = prompts;
    console.log("System prompt:", systemPrompt);
    console.log("User prompt:", userPrompt);

    // Call the OpenAI API with the constructed system and user prompts.
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini" || "gpt-4o" || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Extract the response from the API.
    const aiResponse = completion.choices[0].message.content;
    console.log("AI response:", aiResponse);

    // For sequence-related requests, process JSON modifications.
    if (command !== "chat") {
      try {
        let jsonStr = aiResponse.trim();

        // If the response does not start with '{', extract the JSON portion using a regex.
        if (!jsonStr.startsWith('{')) {
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
        }

        console.log("Attempting to parse JSON:", jsonStr);
        const sequenceData = JSON.parse(jsonStr);
        console.log("Parsed sequence data:", sequenceData);

        // For edit or add commands on an existing sequence.
        if (currentSequence && (command === "edit" || command === "add")) {
          let updatedSequence;
          // For the edit branch, ensure the returned step gets the proper id.
          if (command === "edit") {
            sequenceData.steps[0].id = stepNumber;
            updatedSequence = {
              ...currentSequence,
              steps: currentSequence.steps.map(step =>
                step.id.toString() === stepNumber.toString() ? sequenceData.steps[0] : step
              )
            };

            // Emit the updated sequence to connected clients.
            io.emit('sequenceUpdate', updatedSequence);

            return res.json({
              response: `I've updated step ${stepNumber} of your sequence.`,
              sequence: updatedSequence,
              isSequence: true
            });
          } else {
            // For add step: ensure the new step gets the proper id.
            const newSteps = sequenceData.steps.map(step => ({
              ...step,
              id: step.id ? step.id : stepNumber
            }));

            updatedSequence = {
              ...currentSequence,
              steps: [...currentSequence.steps, ...newSteps]
            };

            // Emit the updated sequence to connected clients.
            io.emit('sequenceUpdate', updatedSequence);

            return res.json({
              response: "I've added the new step to your sequence.",
              sequence: updatedSequence,
              isSequence: true
            });
          }
        } else {
          // For creating a new sequence; ensure step IDs are sequential strings.
          if (sequenceData.steps && Array.isArray(sequenceData.steps)) {
            sequenceData.steps = sequenceData.steps.map((step, index) => ({
              ...step,
              id: (index + 1).toString()
            }));
          }
          // Emit the new sequence to connected clients.
          io.emit('sequenceUpdate', sequenceData);

          return res.json({
            response: "I've created a sequence based on your request. You can view it in the sequence section.",
            sequence: sequenceData,
            isSequence: true
          });
        }
      } catch (error) {
        console.error('Error processing sequence:', error);
        return res.json({
          response: "I tried to process the sequence modification but encountered an error. The response format wasn't as expected. Here's what I got: " + aiResponse,
          isSequence: false
        });
      }
    } else {
      // Regular chat response
      return res.json({
        response: aiResponse,
        isSequence: false
      });
    }
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Dedicated endpoint to generate a new recruiting sequence
app.post('/api/sequences/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini" || "gpt-4o" || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Helix, an AI recruiting assistant. Generate a detailed recruiting sequence in JSON format. Include a title, description, and an array of steps. Each step should have an id, title, and description."
        },
        {
          role: "user",
          content: prompt || "Create a recruiting sequence"
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const sequenceJson = completion.choices[0].message.content;
    const sequence = JSON.parse(sequenceJson);

    io.emit('sequenceUpdate', sequence);

    res.json(sequence);
  } catch (error) {
    console.error('Error generating sequence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sequence update endpoint (PUT) for manual updates (if needed)
app.put('/api/sequences/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sequence = req.body;
  
    // Here you would typically update the sequence in a database.
    // For now, simply send back the updated sequence as confirmation.
    io.emit('sequenceUpdate', sequence);
    res.json(sequence);
  } catch (error) {
    console.error('Error updating sequence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Function to start the server with retry logic for busy ports.
const startServer = (retryCount = 0) => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying port ${port + 1}`);
      port += 1;
      if (retryCount < 3) {
        startServer(retryCount + 1);
      } else {
        console.error('Could not find an available port. Please free up port 5500 or specify a different port in .env');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

// Start the server with retry logic.
startServer();