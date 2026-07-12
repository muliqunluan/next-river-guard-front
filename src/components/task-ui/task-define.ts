import type { Task } from "./types"


export const studentRegistrationTask: Task = [
  {
    id: "student-info",
    title: "学生信息填写",
    type: "input",
    config: {
    }
  },
  {
    id: "student-id",
    title: "学号验证",
    type: "input",
    conditions: {
      dependsOn: ["student-info"]
    },
    config: {
    }
  },
  {
    id: "submit-registration",
    title: "提交注册",
    type: "button",
    conditions: {
      dependsOn: ["student-info", "student-id"]
    },
    config: {
      api: {
        url: "/api/student/register",
        method: "POST"
      }
    }
  }
];

export const userRegTask: Task = [
  
]

export const taskConfigs = {
  studentRegistration: {
    task: studentRegistrationTask,
    ui: {
      "student-info": {
        label: "学生姓名",
        placeholder: "请输入真实姓名",
        helpText: "请输入真实姓名，2-50个字符"
      },
      "student-id": {
        label: "学号",
        placeholder: "请输入8位学号",
        helpText: "请输入8位数字学号"
      },
      "department-select": {
        label: "院系",
        helpText: "请选择您所在的院系"
      },
      "submit-registration": {
        helpText: "确认信息无误后提交注册"
      }
    }
  }
};


export const StudentRegistration = studentRegistrationTask;