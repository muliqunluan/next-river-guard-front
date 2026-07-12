/**
 * 步骤执行条件
 * 定义步骤何时可以被执行的条件规则
 */
export interface StepCondition {
  /** 依赖的步骤ID列表，只有当所有依赖步骤完成后，当前步骤才可执行 */
  dependsOn?: string[]
  /** 自定义条件函数，根据任务上下文动态判断步骤是否可执行 */
  customCondition?: (context: TaskContext) => boolean
}

/**
 * 步骤数据存储结构
 * 用于存储各个步骤收集的数据，key为步骤ID，value为对应的数据
 */
export interface StepData {
  [key: string]: any
}

/**
 * 任务执行上下文
 * 提供任务执行过程中需要的全局信息和状态数据
 */
export interface TaskContext {
  /** 当前执行任务的用户ID */
  userId?: string
  /** 全局数据，存储跨步骤共享的数据（如用户权限、系统状态等） */
  globalData?: Record<string, any>
  /** 各步骤的数据集合，用于条件判断和数据传递 */
  stepData?: Record<string, any>
}

/**
 * 步骤执行状态
 * 记录单个步骤的完整状态信息
 */
export interface StepStatus {
  /** 步骤是否已完成 */
  isCompleted: boolean
  /** 步骤当前是否可执行（满足依赖条件和自定义条件） */
  isEnabled: boolean
  /** 步骤执行后产生的数据 */
  data?: any
  /** 步骤执行过程中的错误信息 */
  error?: string
  /** 步骤是否正在执行中（如API调用等待响应） */
  isLoading?: boolean
}

/**
 * 任务步骤定义
 * 定义任务流程中单个步骤的完整配置信息
 */
export interface TaskStep {
  /** 步骤唯一标识符，用于状态管理和数据关联 */
  id: string
  /** 步骤显示标题 */
  title: string
  /** 步骤详细描述（可选） */
  description?: string
  /** 步骤类型：输入框、按钮、文件上传或自定义组件 */
  type: 'input' | 'button' | 'upload' | 'custom'
  /** 步骤执行条件配置 */
  conditions?: StepCondition
  /** 步骤功能配置 */
  config?: {
    /** 输入框占位符文本 */
    placeholder?: string
    /** 选择框选项列表 */
    options?: { label: string; value: any }[]
    /** API调用配置 */
    api?: {
      /** API接口地址 */
      url: string
      /** HTTP请求方法 */
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
      /** API请求参数 */
      params?: Record<string, any>
    }
  }
  /** UI展示配置 */
  ui?: {
    /** 表单字段标签 */
    label?: string
    /** 帮助提示文本 */
    helpText?: string
    /** 自定义CSS类名 */
    className?: string
    /** 自定义React组件 */
    customComponent?: React.ComponentType<any>
  }
}

/**
 * 任务定义类型
 * 由多个步骤组成的完整任务流程
 */
export type Task = Array<TaskStep>

/**
 * 任务执行状态
 * 管理整个任务流程的执行状态和进度
 */
export interface TaskExecutionState {
  /** 当前激活步骤的索引位置 */
  currentStepIndex: number
  /** 所有步骤的状态记录，key为步骤ID */
  stepStatuses: Record<string, StepStatus>
  /** 所有步骤收集的数据集合 */
  stepData: StepData
  /** 整个任务是否已完成 */
  isCompleted: boolean
  /** 错误信息记录，key为步骤ID */
  errors: Record<string, string>
}