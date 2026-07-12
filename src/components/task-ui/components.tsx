import { useState, useCallback } from 'react';
import { useTask } from './task-context';
import type { TaskStep } from './types';


export const Input = ({ step }: { step: TaskStep }) => {
  const {
    updateStepData,
    getStepData,
    getStepStatus,
    clearStepError,
    completeStep
  } = useTask();
  
  const [value, setValue] = useState(getStepData(step.id) || '');
  const stepStatus = getStepStatus(step.id);
  const isEnabled = stepStatus?.isEnabled ?? false;
  const isLoading = stepStatus?.isLoading ?? false;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEnabled) return;
    
    const newValue = e.target.value;
    setValue(newValue);
    updateStepData(step.id, newValue);
    
    
    if (stepStatus?.error) {
      clearStepError(step.id);
    }
  }, [isEnabled, step.id, updateStepData, stepStatus?.error, clearStepError]);

  const handleBlur = useCallback(async () => {
    if (!isEnabled || isLoading || !value.trim()) return;
    
    // 当输入框失去焦点且有内容时，自动完成步骤
    await completeStep(step.id);
  }, [isEnabled, isLoading, value, step.id, completeStep]);

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={step.config?.placeholder}
        disabled={!isEnabled || isLoading}
        className={`w-full px-3 py-2 border rounded-md ${
          !isEnabled || isLoading
            ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
            : stepStatus?.error
            ? 'border-red-300 focus:border-red-500'
            : 'bg-white border-gray-300 focus:border-blue-500 focus:outline-none'
        }`}
      />
      {step.ui?.helpText && (
        <p className="text-xs text-gray-500">{step.ui.helpText}</p>
      )}
      {stepStatus?.error && (
        <p className="text-xs text-red-500">{stepStatus.error}</p>
      )}
      {isLoading && (
        <p className="text-xs text-blue-500">处理中...</p>
      )}
    </div>
  );
};


export const Button = ({ step }: { step: TaskStep }) => {
  const { completeStep, getStepStatus } = useTask();
  const stepStatus = getStepStatus(step.id);
  const isEnabled = stepStatus?.isEnabled ?? false;
  const isLoading = stepStatus?.isLoading ?? false;

  const handleClick = useCallback(async () => {
    if (!isEnabled || isLoading) return;
    
    await completeStep(step.id);
  }, [isEnabled, isLoading, step.id, completeStep]);

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={!isEnabled || isLoading}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          !isEnabled || isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } ${step.ui?.className || ''}`}
      >
        {isLoading ? '处理中...' : step.title}
      </button>
      {step.ui?.helpText && (
        <p className="text-xs text-gray-500">{step.ui.helpText}</p>
      )}
      {stepStatus?.error && (
        <p className="text-xs text-red-500">{stepStatus.error}</p>
      )}
    </div>
  );
};


export const StepRenderer = ({ step }: { step: TaskStep }) => {
  
  if (step.ui?.customComponent) {
    const CustomComponent = step.ui.customComponent;
    return <CustomComponent step={step} />;
  }

  
  switch (step.type) {
    case 'input':
      return <Input step={step} />;
    case 'button':
      return <Button step={step} />;
    case 'upload':
      
      return <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
        <p className="text-gray-500">文件上传功能待实现</p>
      </div>;
    case 'custom':
    default:
      return <div className="p-4 border border-gray-200 rounded-md">
        <p className="text-gray-500">自定义步骤类型: {step.type}</p>
      </div>;
  }
};


export const StepContainer = ({ step }: { step: TaskStep }) => {
  const { getStepStatus } = useTask();
  const stepStatus = getStepStatus(step.id);
  const isEnabled = stepStatus?.isEnabled ?? false;

  return (
    <div className={`mb-6 p-4 border rounded-lg ${
      isEnabled 
        ? 'border-gray-200 bg-white' 
        : 'border-gray-100 bg-gray-50 opacity-60'
    }`}>
      <div className="mb-3">
        <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
        {step.description && (
          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
        )}
      </div>
      
      <StepRenderer step={step} />
      
      {/* 步骤状态指示器 */}
      <div className="mt-4 flex items-center text-xs">
        {stepStatus?.isCompleted && (
          <span className="flex items-center text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            已完成
          </span>
        )}
        {stepStatus?.isLoading && (
          <span className="flex items-center text-blue-600">
            <svg className="w-4 h-4 mr-1 animate-spin" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            处理中...
          </span>
        )}
        {!isEnabled && !stepStatus?.isCompleted && (
          <span className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            未满足条件
          </span>
        )}
      </div>
    </div>
  );
};


export const StepProgress = () => {
  const { task, executionState } = useTask();
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {task.map((step: TaskStep, index: number) => {
          const stepStatus = executionState.stepStatuses[step.id];
          const isCompleted = stepStatus?.isCompleted ?? false;
          const isEnabled = stepStatus?.isEnabled ?? false;
          const isCurrent = index === executionState.currentStepIndex;
          
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white'
                    : isEnabled
                    ? 'bg-gray-300 text-gray-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < task.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        {task.map((step: TaskStep) => (
          <div key={step.id} className="text-xs text-gray-600 max-w-20 text-center">
            {step.title}
          </div>
        ))}
      </div>
    </div>
  );
};


export const TaskForm = () => {
  const { task, executionState } = useTask();
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">任务流程</h2>
        <p className="text-gray-600 mt-1">
          {executionState.isCompleted 
            ? '任务已完成！' 
            : `当前进度: ${Object.values(executionState.stepStatuses).filter(s => s?.isCompleted).length} / ${task.length}`
          }
        </p>
      </div>
      
      <StepProgress />
      
      <div className="space-y-4">
        {task.map((step: TaskStep) => (
          <StepContainer key={step.id} step={step} />
        ))}
      </div>
      
      {executionState.isCompleted && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium">任务已成功完成！</span>
          </div>
        </div>
      )}
    </div>
  );
};