import { MastraClient } from "@mastra/client-js";

// Create Mastra client instance, connecting to local server
const client = new MastraClient({
  baseUrl: "http://localhost:4111",
});

// Function to log detailed API calls
function logApiCall(
  action: string, 
  params?: Record<string, unknown> | null, 
  result?: unknown, 
  error?: unknown
) {
  console.log(`==== API Call: ${action} ====`);
  if (params) console.log('Params:', JSON.stringify(params, null, 2));
  if (result) console.log('Result:', typeof result === 'object' ? JSON.stringify(result, null, 2) : result);
  if (error) console.error('Error:', error);
  console.log(`==== API Call End: ${action} ====`);
}

// Get all available therapists
export async function getAllTherapists() {
  try {
    // Use hardcoded URL to avoid accessing non-existent properties
    logApiCall('Get Therapist List', { url: "http://localhost:4111" });
    const agents = await client.getAgents();
    logApiCall('Get Therapist List', null, agents);
    
    // If agents is empty or not in expected object format, throw exception
    if (!agents || typeof agents !== 'object' || Object.keys(agents).length === 0) {
      throw new Error('Invalid therapist data format');
    }
    
    return agents;
  } catch (error) {
    logApiCall('Get Therapist List', null, null, error);
    throw error;
  }
}

// Get details for a specific therapist
export async function getTherapistDetails(therapistId: string) {
  try {
    logApiCall('Get Therapist Details', { therapistId });
    
    if (!therapistId) {
      throw new Error('Therapist ID cannot be empty');
    }
    
    const agent = client.getAgent(therapistId);
    const details = await agent.details();
    
    logApiCall('Get Therapist Details', { therapistId }, details);
    return details;
  } catch (error) {
    logApiCall('Get Therapist Details', { therapistId }, null, error);
    throw error;
  }
}

// Send message and get reply
export async function sendMessage(therapistId: string, message: string, threadId?: string) {
  try {
    const actualThreadId = threadId || `thread-${Date.now()}`;
    const resourceId = "default-resource"; // Ensure resourceId is provided
    logApiCall('Send Message', { therapistId, message, threadId: actualThreadId, resourceId });
    
    if (!therapistId || !message) {
      throw new Error('Therapist ID and message content cannot be empty');
    }
    
    // Ensure agent is retrieved with correct ID
    const agent = client.getAgent(therapistId);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (agent.generate as any)({
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      threadId: actualThreadId,
      resourceid: resourceId, // Use lowercase to match API requirements
    });
    
    logApiCall('Send Message', null, response);
    return response;
  } catch (error) {
    logApiCall('Send Message', { therapistId, message, threadId }, null, error);
    throw error;
  }
}

// Stream reply
export async function streamMessage(therapistId: string, message: string, threadId?: string) {
  try {
    const actualThreadId = threadId || `thread-${Date.now()}`;
    const resourceId = "default-resource"; // Ensure resourceId is provided
    logApiCall('Stream Message', { therapistId, message, threadId: actualThreadId, resourceId });
    
    if (!therapistId || !message) {
      throw new Error('Therapist ID and message content cannot be empty');
    }
    
    // Ensure agent is retrieved with correct ID
    const agent = client.getAgent(therapistId);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (agent.stream as any)({
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      threadId: actualThreadId,
      resourceid: resourceId, // Use lowercase to match API requirements
    });
    
    if (!response || !response.body) {
      throw new Error('Invalid stream response format');
    }
    
    logApiCall('Stream Message', null, { status: response.status, ok: response.ok });
    return response;
  } catch (error) {
    logApiCall('Stream Message', { therapistId, message, threadId }, null, error);
    throw error;
  }
}

// Get conversation history
export async function getConversationHistory(threadId: string) {
  try {
    logApiCall('Get Conversation History', { threadId });
    
    if (!threadId) {
      throw new Error('Conversation thread ID cannot be empty');
    }
    
    let thread;
    try {
      // Use type assertion to handle unknown API, which is safe as external library types may change
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      thread = await (client as any).getMemoryThread({
        threadId: threadId,
        resourceid: "default-resource" // Use lowercase to match API requirements
      });
    } catch (firstError) {
      console.warn('Failed to get conversation history using object parameters:', firstError);
      // Try using positional parameters
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      thread = await (client as any).getMemoryThread(threadId, "default-resource");
    }
    
    logApiCall('Get Conversation History', null, thread);
    return thread;
  } catch (error) {
    logApiCall('Get Conversation History', { threadId }, null, error);
    throw error;
  }
}

// Create new conversation thread
export async function createConversationThread(therapistId: string) {
  const threadId = `thread-${Date.now()}`;
  const resourceId = "default-resource"; // Consistent variable name

  try {
    logApiCall('Create Conversation Thread', { threadId, therapistId, resourceId });
    
    if (!therapistId) {
      throw new Error('Therapist ID cannot be empty');
    }
    
    // Directly attempt to create memory thread
    try {
      // Use type assertion to handle unknown API, which is safe as external library types may change
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (client as any).createMemoryThread({
        threadId: threadId,
        resourceid: resourceId, // Use lowercase name to match API requirements
        agentId: therapistId
      });
      
      logApiCall('Create Conversation Thread', null, { threadId, therapistId, resourceId, success: true });
    } catch (createError) {
      console.error('Failed to create memory thread:', createError);
      // If failed, try using simpler parameter structure with correct parameter names
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (client as any).createMemoryThread(threadId, resourceId, therapistId);
      logApiCall('Create Conversation Thread (Alternative Method)', null, { threadId, therapistId, resourceId, success: true });
    }
    
    return threadId;
  } catch (error) {
    logApiCall('Create Conversation Thread', { therapistId, resourceId }, null, error);
    throw error;
  }
}

// Check memory system status
export async function checkMemoryStatus(agentId: string) {
  try {
    logApiCall('Check Memory Status', { agentId });
    
    if (!agentId) {
      throw new Error('Agent ID cannot be empty');
    }
    
    const status = await client.getMemoryStatus(agentId);
    
    logApiCall('Check Memory Status', null, status);
    return status;
  } catch (error) {
    logApiCall('Check Memory Status', { agentId }, null, error);
    throw error;
  }
}

export default client; 