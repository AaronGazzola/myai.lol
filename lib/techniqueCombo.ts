type TechniqueType = 'fewShot' | 'multiStep' | 'visualPointing' | 'multiImage' | 'standard';

interface TechniqueConfig {
  type: TechniqueType;
  config: Record<string, unknown>;
}

interface CombinationResult {
  compatible: boolean;
  conflicts: string[];
  warnings: string[];
}

const COMPATIBLE_COMBINATIONS: Record<TechniqueType, TechniqueType[]> = {
  fewShot: ['multiStep', 'standard'],
  multiStep: ['fewShot', 'visualPointing', 'multiImage', 'standard'],
  visualPointing: ['multiStep', 'standard'],
  multiImage: ['fewShot', 'multiStep', 'standard'],
  standard: ['fewShot', 'multiStep', 'visualPointing', 'multiImage']
};

export const validateTechniqueCombination = (techniques: TechniqueConfig[]): CombinationResult => {
  const conflicts: string[] = [];
  const warnings: string[] = [];

  if (techniques.length === 0) {
    conflicts.push('At least one technique is required');
    return { compatible: false, conflicts, warnings };
  }

  if (techniques.length === 1) {
    return { compatible: true, conflicts: [], warnings: [] };
  }

  if (techniques.length > 3) {
    warnings.push('Combining more than 3 techniques may reduce effectiveness');
  }

  const types = techniques.map(t => t.type);
  const uniqueTypes = new Set(types);

  if (uniqueTypes.size !== types.length) {
    conflicts.push('Cannot use the same technique type multiple times');
  }

  for (let i = 0; i < techniques.length; i++) {
    for (let j = i + 1; j < techniques.length; j++) {
      const type1 = techniques[i].type;
      const type2 = techniques[j].type;

      if (!COMPATIBLE_COMBINATIONS[type1]?.includes(type2)) {
        conflicts.push(`${type1} and ${type2} are not compatible`);
      }
    }
  }

  const hasFewShot = types.includes('fewShot');
  const hasVisualPointing = types.includes('visualPointing');

  if (hasFewShot && hasVisualPointing) {
    warnings.push('Combining few-shot with visual pointing may be complex; ensure examples also use markups');
  }

  return {
    compatible: conflicts.length === 0,
    conflicts,
    warnings
  };
};

export const orderTechniqueApplication = (techniques: TechniqueConfig[]): TechniqueConfig[] => {
  const priority: Record<TechniqueType, number> = {
    fewShot: 1,
    multiImage: 2,
    visualPointing: 3,
    multiStep: 4,
    standard: 5
  };

  return [...techniques].sort((a, b) => priority[a.type] - priority[b.type]);
};

export const mergeTechniqueConfigs = (techniques: TechniqueConfig[]): Record<string, unknown> => {
  const configs: Record<string, Record<string, unknown>> = {};

  techniques.forEach(technique => {
    configs[technique.type] = technique.config;
  });

  return {
    techniques: techniques.map(t => t.type),
    configs
  };
};

export const resolveTechniqueConflicts = (techniques: TechniqueConfig[]): TechniqueConfig[] => {
  const validation = validateTechniqueCombination(techniques);

  if (validation.compatible) {
    return techniques;
  }

  const filtered = techniques.filter((technique, index) => {
    return index === techniques.findIndex(t => t.type === technique.type);
  });

  return filtered;
};

export const generateCombinedPrompt = (techniques: TechniqueConfig[]): string => {
  const validation = validateTechniqueCombination(techniques);

  if (!validation.compatible) {
    throw new Error(`Incompatible technique combination: ${validation.conflicts.join(', ')}`);
  }

  const orderedTechniques = orderTechniqueApplication(techniques);

  const prompts: string[] = orderedTechniques.map(technique => {
    return `[${technique.type} technique applied]`;
  });

  if (validation.warnings.length > 0) {
    return `${prompts.join('\n\n')}\n\nNote: ${validation.warnings.join(' ')}`;
  }

  return prompts.join('\n\n');
};