// 翻译规则定义
const translationRules = {
    // 短语规则（优先匹配）
    phrases: {
        "id tich pipo": "学生",
        "tich pipo": "老师",
        "id senie tich pipo": "高中生",
        "id shunie tich pipo":"初中生",
        "tich loc": "学校",
        "id tich": "学习"
        
    },
    
    // 词汇规则
    words: {
        "id": "被",
        "tich": "教",
        "pipo": "人",
        "loc": "地点",
        "ai": "我",
        "yu": "你",
        "ta": "ta",
        "de": "的",
        "lof": "爱",
        "Inglis": "英语",
        "bi": "是"
  
    },
    
    // 前缀规则
    prefixes: {
        
    },
    
    // 后缀规则
    suffixes: {
        "s": "们"
    },
    
    // 正则规则（用于复杂模式匹配）
    regex: [
        // 可以添加正则表达式规则
    ]
};