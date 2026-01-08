// lib/ama-chat.ts
import apiClient from "./client";
import { Constants } from "./constants";

export interface AMAChatRequest {
  message: string;
  conversationId?: string;
  userId?: string;
}

export interface AMAChatResponse {
  response: string;
  conversationId?: string;
  isError?: boolean;
  errorMessage?: string;
}

/**
 * Send a message to the Streamlit AMA chat API
 * @param request - Chat request containing message and optional conversation ID
 * @returns Promise with chat response
 */
export async function sendAMAChatMessage(request: AMAChatRequest): Promise<AMAChatResponse> {
  try {
    const response = await apiClient.post<AMAChatResponse>(
      Constants.API_POST_AMAChat,
      {
        message: request.message,
        conversation_id: request.conversationId,
        user_id: request.userId,
      }
    );

    return {
      response: response.data.response || response.data.message || "",
      conversationId: response.data.conversationId || response.data.conversation_id,
      isError: response.data.isError || false,
      errorMessage: response.data.errorMessage || response.data.error_message,
    };
  } catch (error: any) {
    console.error("AMA Chat API Error:", error);
    
    // Check if it's an error message from the API
    if (error.response?.data?.isError) {
      return {
        response: error.response.data.errorMessage || "An error occurred while processing your request.",
        isError: true,
        errorMessage: error.response.data.errorMessage,
      };
    }

    // Fallback error handling
    return {
      response: "Sorry, I'm having trouble connecting to the service. Please try again later.",
      isError: true,
      errorMessage: error.message || "Network error",
    };
  }
}

