"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { analyzeFewShotAction, AnalyzeFewShotInput, AnalysisResult } from "./page.actions";

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
