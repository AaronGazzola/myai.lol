"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  analyzeFewShotAction,
  AnalyzeFewShotInput,
  AnalysisResult,
  submitStandardPromptAction,
  submitFewShotPromptAction,
  submitVisualPointingAction,
  submitMultiImageAction,
  submitSequenceAction,
  StandardPromptInput,
  FewShotPromptInput,
  VisualPointingInput,
  MultiImageInput,
  SequenceInput,
} from "./page.actions";

export const useAnalyzeFewShot = () => {
  return useMutation({
    mutationFn: async (input: AnalyzeFewShotInput) => {
      const { data, error } = await analyzeFewShotAction(input);
      if (error) throw new Error(error);
      if (!data) throw new Error("No data returned from analysis");
      return data;
    },
    onSuccess: (data: AnalysisResult) => {
      toast.success("Analysis Complete", {
        description: `Analyzed successfully using ${data.model}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Analysis Failed", {
        description: error.message || "An error occurred during analysis",
      });
    },
  });
};

export const useSubmitStandardPrompt = () => {
  return useMutation({
    mutationFn: async (input: StandardPromptInput) => {
      const { data, error } = await submitStandardPromptAction(input);
      if (error) throw new Error(error);
      if (!data) throw new Error("No data returned from submission");
      return data;
    },
    onSuccess: (data: AnalysisResult) => {
      toast.success("Prompt Submitted", {
        description: `Analyzed successfully using ${data.model}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Submission Failed", {
        description: error.message || "An error occurred during submission",
      });
    },
  });
};

export const useSubmitFewShotPrompt = () => {
  return useMutation({
    mutationFn: async (input: FewShotPromptInput) => {
      const { data, error } = await submitFewShotPromptAction(input);
      if (error) throw new Error(error);
      if (!data) throw new Error("No data returned from submission");
      return data;
    },
    onSuccess: (data: AnalysisResult) => {
      toast.success("Few-Shot Prompt Submitted", {
        description: `Analyzed successfully using ${data.model}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Submission Failed", {
        description: error.message || "An error occurred during submission",
      });
    },
  });
};

export const useSubmitVisualPointing = () => {
  return useMutation({
    mutationFn: async (input: VisualPointingInput) => {
      const { data, error } = await submitVisualPointingAction(input);
      if (error) throw new Error(error);
      if (!data) throw new Error("No data returned from submission");
      return data;
    },
    onSuccess: (data: AnalysisResult) => {
      toast.success("Visual Pointing Submitted", {
        description: `Analyzed successfully using ${data.model}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Submission Failed", {
        description: error.message || "An error occurred during submission",
      });
    },
  });
};

export const useSubmitMultiImage = () => {
  return useMutation({
    mutationFn: async (input: MultiImageInput) => {
      const { data, error } = await submitMultiImageAction(input);
      if (error) throw new Error(error);
      if (!data) throw new Error("No data returned from submission");
      return data;
    },
    onSuccess: (data: AnalysisResult) => {
      toast.success("Multi-Image Prompt Submitted", {
        description: `Analyzed successfully using ${data.model}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Submission Failed", {
        description: error.message || "An error occurred during submission",
      });
    },
  });
};

export const useSubmitSequence = () => {
  return useMutation({
    mutationFn: async (input: SequenceInput) => {
      const { data, error } = await submitSequenceAction(input);
      if (error) throw new Error(error);
      if (!data) throw new Error("No data returned from sequence");
      return data;
    },
    onSuccess: (data: AnalysisResult[]) => {
      toast.success("Sequence Complete", {
        description: `Successfully executed ${data.length} card${data.length !== 1 ? 's' : ''}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Sequence Failed", {
        description: error.message || "An error occurred during sequence execution",
      });
    },
  });
};
