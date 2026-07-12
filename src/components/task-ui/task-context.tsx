import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Task,
  TaskStep,
  TaskContext,
  TaskExecutionState,
  StepStatus,
  StepData
} from './types';

interface TaskContextType {
  
  task: Task;
  taskContext: TaskContext;
  executionState: TaskExecutionState;
  
  
  updateStepData: (stepId: string, data: any) => void;
  completeStep: (stepId: string) => Promise<boolean>;
  resetTask: () => void;
  goToStep: (stepId: string) => boolean;
  
  
  isStepEnabled: (stepId: string) => boolean;
  isStepCompleted: (stepId: string) => boolean;
  getStepStatus: (stepId: string) => StepStatus | undefined;
  getStepData: (stepId: string) => any;
  getCurrentStep: () => TaskStep | undefined;
  getNextStep: () => TaskStep | undefined;
  
  
  setStepError: (stepId: string, error: string) => void;
  clearStepError: (stepId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
  task: Task;
  initialContext?: TaskContext;
  onTaskComplete?: (data: StepData) => void;
  onStepChange?: (stepId: string, data: any) => void;
}


const checkStepEnabled = (
  step: TaskStep,
  executionState: TaskExecutionState,
  taskContext: TaskContext
): boolean => {
  if (!step.conditions) return true;
  
  const { dependsOn, customCondition } = step.conditions;
  
  
  if (dependsOn && dependsOn.length > 0) {
    const allDependsCompleted = dependsOn.every((depId: string) =>
      executionState.stepStatuses[depId]?.isCompleted
    );
    if (!allDependsCompleted) return false;
  }
  
  
  if (customCondition) {
    const contextWithStepData = {
      ...taskContext,
      stepData: executionState.stepData
    };
    return customCondition(contextWithStepData);
  }
  
  return true;
};

export const TaskProvider = ({ 
  children, 
  task, 
  initialContext = {},
  onTaskComplete,
  onStepChange
}: TaskProviderProps) => {
  const [taskContext] = useState<TaskContext>(initialContext);
  const [executionState, setExecutionState] = useState<TaskExecutionState>({
    currentStepIndex: 0,
    stepStatuses: {},
    stepData: {},
    isCompleted: false,
    errors: {}
  });

  
  useEffect(() => {
    const initialStatuses: Record<string, StepStatus> = {};
    task.forEach(step => {
      const isEnabled = checkStepEnabled(step, executionState, taskContext);
      initialStatuses[step.id] = {
        isCompleted: false,
        isEnabled,
        data: undefined,
        error: undefined,
        isLoading: false
      };
    });
    
    setExecutionState(prev => ({
      ...prev,
      stepStatuses: initialStatuses
    }));
  }, [task]);

  
  const updateStepData = useCallback((stepId: string, data: any) => {
    setExecutionState(prev => ({
      ...prev,
      stepData: {
        ...prev.stepData,
        [stepId]: data
      }
    }));
  }, []);

  
  const completeStep = useCallback(async (stepId: string): Promise<boolean> => {
    const step = task.find(s => s.id === stepId);
    if (!step) return false;

    const currentData = executionState.stepData[stepId];
    
    setExecutionState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[stepId];
      return {
        ...prev,
        errors: newErrors
      };
    });

    
    setExecutionState(prev => ({
      ...prev,
      stepStatuses: {
        ...prev.stepStatuses,
        [stepId]: {
          ...prev.stepStatuses[stepId],
          isLoading: true
        }
      }
    }));

    try {
      
      if (step.config?.api) {
        const { api } = step.config;
        
        
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      
      setExecutionState(prev => {
        const newStepStatuses = {
          ...prev.stepStatuses,
          [stepId]: {
            ...prev.stepStatuses[stepId],
            isCompleted: true,
            isLoading: false
          }
        };

        
        const allCompleted = task.every(s => newStepStatuses[s.id]?.isCompleted);

        
        const updatedStatuses = { ...newStepStatuses };
        task.forEach(s => {
          if (!updatedStatuses[s.id]?.isCompleted) {
            updatedStatuses[s.id] = {
              ...updatedStatuses[s.id],
              isEnabled: checkStepEnabled(s, { ...prev, stepStatuses: updatedStatuses, stepData: prev.stepData }, taskContext)
            };
          }
        });

        const newState = {
          ...prev,
          stepStatuses: updatedStatuses,
          isCompleted: allCompleted
        };

        
        if (allCompleted && onTaskComplete) {
          setTimeout(() => {
            onTaskComplete(prev.stepData);
          }, 0);
        }

        return newState;
      });

      
      if (onStepChange) {
        onStepChange(stepId, currentData);
      }

      return true;
    } catch (error) {
      
      setExecutionState(prev => ({
        ...prev,
        stepStatuses: {
          ...prev.stepStatuses,
          [stepId]: {
            ...prev.stepStatuses[stepId],
            isLoading: false,
            error: error instanceof Error ? error.message : '未知错误'
          }
        },
        errors: {
          ...prev.errors,
          [stepId]: error instanceof Error ? error.message : '未知错误'
        }
      }));
      return false;
    }
  }, [task, executionState.stepData, executionState.stepStatuses, taskContext, onStepChange, onTaskComplete]);

  
  const resetTask = useCallback(() => {
    setExecutionState({
      currentStepIndex: 0,
      stepStatuses: {},
      stepData: {},
      isCompleted: false,
      errors: {}
    });
  }, []);

  
  const goToStep = useCallback((stepId: string): boolean => {
    const stepIndex = task.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return false;

    const step = task[stepIndex];
    const isEnabled = checkStepEnabled(step, executionState, taskContext);
    
    if (!isEnabled) return false;

    setExecutionState(prev => ({
      ...prev,
      currentStepIndex: stepIndex
    }));

    return true;
  }, [task, executionState, taskContext]);

  
  const isStepEnabled = useCallback((stepId: string): boolean => {
    const step = task.find(s => s.id === stepId);
    if (!step) return false;
    return checkStepEnabled(step, executionState, taskContext);
  }, [task, executionState, taskContext]);

  const isStepCompleted = useCallback((stepId: string): boolean => {
    return executionState.stepStatuses[stepId]?.isCompleted || false;
  }, [executionState.stepStatuses]);

  const getStepStatus = useCallback((stepId: string): StepStatus | undefined => {
    return executionState.stepStatuses[stepId];
  }, [executionState.stepStatuses]);

  const getStepData = useCallback((stepId: string): any => {
    return executionState.stepData[stepId];
  }, [executionState.stepData]);

  const getCurrentStep = useCallback((): TaskStep | undefined => {
    return task[executionState.currentStepIndex];
  }, [task, executionState.currentStepIndex]);

  const getNextStep = useCallback((): TaskStep | undefined => {
    return task[executionState.currentStepIndex + 1];
  }, [task, executionState.currentStepIndex]);

  const setStepError = useCallback((stepId: string, error: string) => {
    setExecutionState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [stepId]: error
      }
    }));
  }, []);

  const clearStepError = useCallback((stepId: string) => {
    setExecutionState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[stepId];
      return {
        ...prev,
        errors: newErrors
      };
    });
  }, []);

  return (
    <TaskContext.Provider value={{
      task,
      taskContext,
      executionState,
      updateStepData,
      completeStep,
      resetTask,
      goToStep,
      isStepEnabled,
      isStepCompleted,
      getStepStatus,
      getStepData,
      getCurrentStep,
      getNextStep,
      setStepError,
      clearStepError
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within an TaskProvider');
  }
  return context;
};