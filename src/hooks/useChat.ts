import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getAllTherapists, 
  streamMessage,
  createConversationThread
} from '../services/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Therapist {
  id: string;
  name: string;
  description: string;
  avatar?: {
    text: string;
    bgColor: string;
  };
}

// Define Agent type returned by API
interface ApiAgent {
  name: string;
  instructions: string;
  tools: Record<string, unknown>; // Using unknown instead of any
  provider: string;
  modelId: string;
}

export function useChat() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  // Add a new state to record which message is being loaded
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  
  // Use ref to track which therapists have been attempted to connect
  const attemptedTherapistsRef = useRef<Set<string>>(new Set());
  
  // Initialize: Get all therapists
  useEffect(() => {
    // Only get therapist list once when component is first mounted, no retries
    let isMounted = true;
    
    async function fetchTherapists() {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Start fetching therapist list...");
        
        const response = await getAllTherapists();
        
        // Ensure component is still mounted
        if (!isMounted) return;
        
        console.log("Successfully fetched therapist list");
        
        // Store original therapist data
        const fetchedTherapists: Therapist[] = [];
        
        // Check if response is an object and has key-value pairs
        if (response && typeof response === 'object') {
          // Print basic information of each therapist, for debugging
          Object.entries(response).forEach(([agentKey, agentData]) => {
            console.log(`Processing therapist data: ID=${agentKey}, data type=${typeof agentData}`);
            
            if (agentData && typeof agentData === 'object') {
              const agent = agentData as ApiAgent;
              
              // Ensure agent has at least a name attribute
              if (agent.name) {
                const therapist: Therapist = {
                  id: agentKey, // Use key as ID
                  name: agent.name,
                  description: agent.instructions?.slice(0, 100) || 'No description available',
                  avatar: {
                    text: agent.name.charAt(0),
                    bgColor: getRandomColor(agentKey),
                  }
                };
                
                console.log(`Adding therapist: ${therapist.name} (ID: ${therapist.id})`);
                fetchedTherapists.push(therapist);
              }
            }
          });
        } else {
          console.warn("API returned data is not the expected object format:", response);
        }
        
        console.log(`Processing complete, found ${fetchedTherapists.length} therapists in total`);
        setTherapists(fetchedTherapists);
        
        // If there are therapists, default to the first one
        if (fetchedTherapists.length > 0) {
          const defaultTherapist = fetchedTherapists[0].id;
          console.log(`Default therapist selected: ${fetchedTherapists[0].name} (ID: ${defaultTherapist})`);
          setSelectedTherapist(defaultTherapist);
        } else {
          console.warn("No therapists found");
          setError('No available therapists found');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to fetch therapist list:', err);
        setError('Unable to get therapist list');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchTherapists();
    
    // Cleanup function to prevent setting state after component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array, ensure it runs only once
  
  // When therapist is selected, initialize conversation but ensure no automatic retries
  useEffect(() => {
    // Avoid repeated initialization
    if (isInitializing) return;
    
    // If no therapist is selected, return immediately
    if (!selectedTherapist) return;
    
    // If the therapist has already been attempted to connect, do not attempt again
    if (attemptedTherapistsRef.current.has(selectedTherapist)) {
      console.log(`Therapist ${selectedTherapist} has already been attempted to connect, no retry`);
      return;
    }
    
    async function initConversation() {
      if (!selectedTherapist || therapists.length === 0) {
        console.log("No therapist selected or therapist list is empty, skip initialization");
        return;
      }
      
      try {
        // Record the therapist that has attempted to connect
        attemptedTherapistsRef.current.add(selectedTherapist);
        
        setIsInitializing(true);
        console.log(`Start initializing conversation with therapist ${selectedTherapist}`);
        
        // Create new conversation thread
        const newThreadId = await createConversationThread(selectedTherapist);
        console.log(`Conversation thread created successfully: ${newThreadId}`);
        setThreadId(newThreadId);
        
        // Find selected therapist information
        const therapistInfo = therapists.find(t => t.id === selectedTherapist);
        console.log("Found therapist information:", therapistInfo);
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: therapistInfo 
            ? `Hello! I'm ${therapistInfo.name}. How are you feeling today?` 
            : `Hello! I'm your psychological consultant. How are you feeling today?`,
          timestamp: Date.now()
        };
        
        console.log("Adding welcome message:", welcomeMessage.content);
        setMessages([welcomeMessage]);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize conversation:', err);
        setError('Unable to establish connection with therapist');
      } finally {
        setIsInitializing(false);
      }
    }
    
    // Initialize with the current selected therapist
    initConversation();
    
  }, [selectedTherapist, therapists]); // Only depend on therapist selection change
  
  // Send message
  const sendUserMessage = useCallback(async (content: string) => {
    if (!content.trim()) {
      console.warn("Message content is empty, not sending");
      return;
    }
    
    if (!selectedTherapist) {
      console.warn("No therapist selected, cannot send message");
      setError('Please select a therapist first');
      return;
    }
    
    if (!threadId) {
      console.warn("Conversation thread does not exist, cannot send message");
      setError('Conversation is not ready yet');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to list
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now()
      };
      
      console.log(`Sending user message: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`);
      setMessages(prev => [...prev, userMessage]);
      
      // Create an empty reply message as Loading status
      const assistantMessageId = `msg-${Date.now() + 1}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now() + 1
      };
      
      // Add empty reply message to list and set as loading status
      setMessages(prev => [...prev, assistantMessage]);
      setLoadingMessageId(assistantMessageId);
      
      // Send message to server and get reply (using stream response)
      console.log(`Calling stream API: therapistId=${selectedTherapist}, threadId=${threadId}`);
      const response = await streamMessage(selectedTherapist, content, threadId);
      
      if (!response || !response.body) {
        throw new Error('Server response is invalid');
      }
      
      // Process stream response
      let fullResponse = '';
      const reader = response.body.getReader();
      
      try {
        // Set timeout protection
        const timeoutPromise = new Promise<{ done: true, value: undefined }>((_, reject) => {
          setTimeout(() => reject(new Error('Stream response timeout')), 30000);
        });
        
        // Record full original response for debugging
        let rawResponse = '';
        
        while (true) {
          // Use Promise.race to add timeout protection
          const readResult = await Promise.race([
            reader.read(),
            timeoutPromise
          ]);
          
          const { done, value } = readResult;
          if (done) break;
          
          // Decode received data
          const chunk = new TextDecoder().decode(value);
          console.log(`Received stream data: ${chunk.length} bytes`);
          
          // Save original response for debugging
          rawResponse += chunk;
          
          if (chunk) {
            // Process Mastra AI stream response format
            // Extract content part (0:"Text")
            const contentMatches = chunk.match(/0:"([^"]*)"/g);
            if (contentMatches) {
              for (const match of contentMatches) {
                // Extract content from quotes
                const content = match.slice(3, -1);
                fullResponse += content;
              }
            } else {
              // Split into lines, filter out empty lines
              const lines = chunk.split('\n').filter(line => line.trim());
              
              for (const line of lines) {
                try {
                  // Extract content part (0:"Text")
                  if (line.match(/^0:"/)) {
                    // Extract content from quotes, handle possible multi-line cases
                    const content = line.slice(3).replace(/"$/, '');
                    fullResponse += content;
                  }
                  // Handle possible format without quotes
                  else if (line.startsWith('0:')) {
                    const content = line.slice(2);
                    fullResponse += content;
                  }
                  // Handle error information (3:"Error information")
                  else if (line.match(/^3:"/)) {
                    const errorContent = line.slice(3).replace(/"$/, '');
                    console.error('Server returned error:', errorContent);
                    
                    // Check if it contains network connection error related keywords
                    if (errorContent.includes('ECONNRESET') || 
                        errorContent.includes('Cannot connect') || 
                        errorContent.includes('timeout') ||
                        errorContent.includes('Failed after')) {
                      setError('Network connection failed, please check your network and try again');
                      fullResponse = 'Sorry, there was a network connection problem. Unable to get a response. Please check your network connection and try again.';
                    } else {
                      setError('Service temporarily unavailable, please try again later');
                      fullResponse = 'Sorry, the service is temporarily unavailable. ' + errorContent;
                    }
                  }
                  // Handle other format markers, do not add to response
                  else if (line.startsWith('f:') || line.startsWith('e:') || line.startsWith('d:')) {
                    console.log('Metadata:', line);
                  }
                  // Other cases, possibly direct text content
                  else if (!line.includes(':')) {
                    fullResponse += line;
                  }
                } catch (parseError) {
                  console.error('Failed to parse stream data line:', parseError, line);
                }
              }
            }
            
            // If no error occurred, keep Markdown format, only perform basic cleanup
            if (!error) {
              // Clean up response, but keep Markdown format
              fullResponse = fullResponse
                .replace(/\\n/g, '\n') // Keep newline
                .replace(/\\t/g, '\t') // Keep tab
                .replace(/\\\\/g, '\\') // Convert escaped backslash
                .replace(/\\"/g, '"'); // Convert escaped quotes
                
              // No need to convert Markdown to HTML, as we'll use React-Markdown to render
              console.log('Processed Markdown content:', fullResponse);
            }
            
            // Update message content (stream update)
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: fullResponse } 
                  : msg
              )
            );
          }
        }
        
        console.log(`Stream response completed, total length: ${fullResponse.length} characters`);
      } catch (streamError) {
        console.error('Stream read error:', streamError);
        
        // If there's already partial response, continue using it, otherwise set error message
        if (!fullResponse) {
          fullResponse = "Error occurred while reading the response";
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: fullResponse } 
                : msg
            )
          );
          setError('Problem occurred while receiving the message');
        }
      } finally {
        // Release reader resources
        reader.releaseLock();
        // Clear loading status
        setLoadingMessageId(null);
      }
      
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      // Clear loading status
      setLoadingMessageId(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTherapist, threadId]);
  
  // Select therapist
  const selectTherapist = useCallback((therapistId: string) => {
    if (therapistId !== selectedTherapist) {
      console.log(`Switching therapist: ${therapistId}`);
      
      // Manual therapist selection allows re-attempting connection
      attemptedTherapistsRef.current.delete(therapistId);
      
      setSelectedTherapist(therapistId);
      setMessages([]);
      setThreadId(null);
    }
  }, [selectedTherapist]);
  
  // Start a new consultation with the currently selected therapist
  const startNewConsultation = useCallback(async () => {
    if (!selectedTherapist) {
      console.warn("No therapist selected, cannot start new consultation");
      setError('Please select a therapist first');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setMessages([]);
      
      console.log(`Starting new consultation with therapist: ${selectedTherapist}`);
      
      // Create new conversation thread
      const newThreadId = await createConversationThread(selectedTherapist);
      console.log(`New conversation thread created: ${newThreadId}`);
      setThreadId(newThreadId);
      
      // Find selected therapist information
      const therapistInfo = therapists.find(t => t.id === selectedTherapist);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: therapistInfo 
          ? `Hello! I'm ${therapistInfo.name}. How are you feeling today?` 
          : `Hello! I'm your psychological consultant. How are you feeling today?`,
        timestamp: Date.now()
      };
      
      console.log("Adding welcome message for new consultation:", welcomeMessage.content);
      setMessages([welcomeMessage]);
    } catch (err) {
      console.error('Failed to start new consultation:', err);
      setError('Unable to start new consultation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTherapist, therapists]);
  
  // Helper function: Generate random color based on ID
  function getRandomColor(id: string): string {
    // Select a color from a predefined set of colors, based on ID's hash value
    const colors = [
      '#6366f1', // Blue
      '#8b5cf6', // Purple
      '#ec4899', // Pink
      '#f97316', // Orange
      '#10b981', // Green
      '#06b6d4', // Cyan
    ];
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use hash value to select color
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
  
  return {
    therapists,
    selectedTherapist,
    messages,
    isLoading,
    error,
    sendMessage: sendUserMessage,
    selectTherapist,
    isInitializing,
    loadingMessageId, // Export loading message ID
    startNewConsultation // Export the new function
  };
} 