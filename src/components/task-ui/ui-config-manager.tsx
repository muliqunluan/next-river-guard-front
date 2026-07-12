import type { TaskStep } from './types';
import { taskConfigs } from './task-define';

export class UIConfigManager {
  static getStepUIConfig(taskKey: string, stepId: string) {
    const config = taskConfigs[taskKey as keyof typeof taskConfigs];
    if (!config || !config.ui) {
      return {};
    }
    return (config.ui as Record<string, any>)[stepId] || {};
  }

  
  static applyUIConfig(taskKey: string, steps: TaskStep[]): TaskStep[] {
    return steps.map(step => {
      const uiConfig = this.getStepUIConfig(taskKey, step.id);
      
      return {
        ...step,
        ui: {
          ...step.ui,
          ...uiConfig
        }
      };
    });
  }

  
  static getTaskWithUI(taskKey: string) {
    const config = taskConfigs[taskKey as keyof typeof taskConfigs];
    if (!config) {
      throw new Error(`Task configuration not found for key: ${taskKey}`);
    }

    return {
      task: this.applyUIConfig(taskKey, config.task),
      ui: config.ui
    };
  }

  
  static createStepWithUI(
    baseStep: TaskStep,
    uiConfig: Partial<TaskStep['ui']>
  ): TaskStep {
    return {
      ...baseStep,
      ui: {
        ...baseStep.ui,
        ...uiConfig
      }
    };
  }
}


export const getTaskWithUI = (taskKey: string) => {
  return UIConfigManager.getTaskWithUI(taskKey);
};


export const getStepUIConfig = (taskKey: string, stepId: string) => {
  return UIConfigManager.getStepUIConfig(taskKey, stepId);
};
