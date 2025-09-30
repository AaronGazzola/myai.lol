import { TechniqueType } from './workflowStore';

export type ErrorType =
  | 'api_error'
  | 'network_error'
  | 'validation_error'
  | 'file_upload_error'
  | 'rate_limit_error'
  | 'configuration_error'
  | 'unknown_error';

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  techniqueContext?: TechniqueType;
  recoverable: boolean;
  retryable: boolean;
  details?: any;
}

export class ErrorHandler {
  static handleApiError(error: any, technique?: TechniqueType): AppError {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      return {
        type: 'api_error',
        message: 'API authentication failed',
        userMessage: 'Your API key is invalid or expired. Please update it in settings.',
        techniqueContext: technique,
        recoverable: true,
        retryable: false
      };
    }

    if (status === 429) {
      return {
        type: 'rate_limit_error',
        message: 'Rate limit exceeded',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        techniqueContext: technique,
        recoverable: true,
        retryable: true
      };
    }

    if (status === 400) {
      const techniqueGuidance = this.getTechniqueGuidance(technique, message);
      return {
        type: 'api_error',
        message: message,
        userMessage: techniqueGuidance || 'Invalid request. Please check your configuration.',
        techniqueContext: technique,
        recoverable: true,
        retryable: false
      };
    }

    if (status >= 500) {
      return {
        type: 'api_error',
        message: 'Server error',
        userMessage: 'The AI service is experiencing issues. Please try again later.',
        techniqueContext: technique,
        recoverable: true,
        retryable: true
      };
    }

    return {
      type: 'api_error',
      message: message || 'Unknown API error',
      userMessage: 'An error occurred while processing your request. Please try again.',
      techniqueContext: technique,
      recoverable: true,
      retryable: true
    };
  }

  static handleNetworkError(): AppError {
    return {
      type: 'network_error',
      message: 'Network connection failed',
      userMessage: 'Unable to connect to the AI service. Please check your internet connection.',
      recoverable: true,
      retryable: true
    };
  }

  static validateFileUpload(file: File): AppError | null {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return {
        type: 'file_upload_error',
        message: `Invalid file type: ${file.type}`,
        userMessage: `File type not supported. Please upload JPG, PNG, WebP, or GIF images.`,
        recoverable: false,
        retryable: false,
        details: { fileName: file.name, fileType: file.type }
      };
    }

    if (file.size > maxSize) {
      return {
        type: 'file_upload_error',
        message: `File too large: ${file.size} bytes`,
        userMessage: `File is too large (max 10MB). Please compress or resize the image.`,
        recoverable: false,
        retryable: false,
        details: { fileName: file.name, fileSize: file.size }
      };
    }

    return null;
  }

  static validateTechniqueConfig(technique: TechniqueType, config: any): AppError | null {
    switch (technique) {
      case 'few-shot':
        if (!config.examples || config.examples.length < 2) {
          return {
            type: 'validation_error',
            message: 'Insufficient examples for few-shot learning',
            userMessage: 'Few-shot learning requires at least 2 examples. Please add more examples.',
            techniqueContext: technique,
            recoverable: true,
            retryable: false
          };
        }
        if (!config.target) {
          return {
            type: 'validation_error',
            message: 'No target image specified',
            userMessage: 'Please select a target image to analyze.',
            techniqueContext: technique,
            recoverable: true,
            retryable: false
          };
        }
        break;

      case 'multi-step':
        if (!config.steps || config.steps.length === 0) {
          return {
            type: 'validation_error',
            message: 'No steps defined',
            userMessage: 'Please add at least one analysis step.',
            techniqueContext: technique,
            recoverable: true,
            retryable: false
          };
        }
        break;

      case 'visual-pointing':
        if (!config.image) {
          return {
            type: 'validation_error',
            message: 'No image specified',
            userMessage: 'Please select an image to mark up.',
            techniqueContext: technique,
            recoverable: true,
            retryable: false
          };
        }
        if (!config.markup || config.markup.length === 0) {
          return {
            type: 'validation_error',
            message: 'No markup added',
            userMessage: 'Please add markup to the image to highlight areas of interest.',
            techniqueContext: technique,
            recoverable: true,
            retryable: false
          };
        }
        break;

      case 'multi-image':
        if (!config.references || config.references.length === 0) {
          return {
            type: 'validation_error',
            message: 'No reference images',
            userMessage: 'Please add at least one reference image.',
            techniqueContext: technique,
            recoverable: true,
            retryable: false
          };
        }
        if (!config.target) {
          return {
            type: 'validation_error',
            message: 'No target image',
            userMessage: 'Please select a target image to analyze.',
            techniqueContext: technique,
            recoverable: true,
            retryable: false
          };
        }
        break;
    }

    return null;
  }

  static getTechniqueGuidance(technique?: TechniqueType, errorMessage?: string): string | null {
    if (!technique) return null;

    const lowerMessage = errorMessage?.toLowerCase() || '';

    if (lowerMessage.includes('image') || lowerMessage.includes('vision')) {
      const guidanceMap: Record<TechniqueType, string> = {
        'standard': 'Make sure you have uploaded an image and selected a vision-capable model.',
        'few-shot': 'Ensure all example images and the target image are properly uploaded and visible.',
        'multi-step': 'Verify that your image is uploaded and the model supports vision capabilities.',
        'visual-pointing': 'Check that your marked image is properly processed and exported.',
        'multi-image': 'Ensure all reference images and the target image are uploaded correctly.'
      };
      return guidanceMap[technique];
    }

    if (lowerMessage.includes('token') || lowerMessage.includes('length')) {
      return 'Your prompt or images may be too large. Try reducing the number of steps or images.';
    }

    return null;
  }

  static recoverFromError(error: AppError): { action: string; message: string } | null {
    if (!error.recoverable) return null;

    if (error.type === 'api_error' && error.retryable) {
      return {
        action: 'retry',
        message: 'Click to retry your request'
      };
    }

    if (error.type === 'network_error') {
      return {
        action: 'retry',
        message: 'Check your connection and retry'
      };
    }

    if (error.type === 'rate_limit_error') {
      return {
        action: 'wait',
        message: 'Please wait a moment before retrying'
      };
    }

    if (error.type === 'validation_error') {
      return {
        action: 'fix_config',
        message: 'Update your configuration and try again'
      };
    }

    return null;
  }

  static showUserFriendlyError(error: unknown): AppError {
    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return this.handleNetworkError();
      }

      return {
        type: 'unknown_error',
        message: error.message,
        userMessage: 'An unexpected error occurred. Please try again.',
        recoverable: true,
        retryable: true,
        details: { stack: error.stack }
      };
    }

    return {
      type: 'unknown_error',
      message: 'Unknown error',
      userMessage: 'Something went wrong. Please refresh and try again.',
      recoverable: true,
      retryable: true,
      details: error
    };
  }
}