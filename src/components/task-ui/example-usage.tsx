import {
  TaskProvider,
  TaskForm,
  getTaskWithUI,
  type TaskContext
} from './index';


export const StudentRegistrationExample = () => {
  const handleTaskComplete = (data: any) => {
    console.log('学生注册完成:', data);
    alert('学生注册成功！');
  };

  const handleStepChange = (stepId: string, data: any) => {
    console.log(`步骤 ${stepId} 完成，数据:`, data);
  };

  
  const studentContext: TaskContext = {
    userId: 'student123',
    globalData: {
      termsAccepted: true
    }
  };

  
  const { task } = getTaskWithUI('studentRegistration');

  return (
    <TaskProvider
      task={task}
      initialContext={studentContext}
      onTaskComplete={handleTaskComplete}
      onStepChange={handleStepChange}
    >
      <TaskForm />
    </TaskProvider>
  );
};