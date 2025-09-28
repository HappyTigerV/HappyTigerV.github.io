// 翻译器核心功能
class LisTranslator {
    constructor() {
        this.rules = translationRules;
        this.lisInput = document.getElementById('lis-input');
        this.chineseInput = document.getElementById('chinese-input');
        this.translating = false; // 防止循环触发
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Lis输入变化时翻译成中文
        this.lisInput.addEventListener('input', () => {
            if (this.translating) return;
            
            this.translating = true;
            const lisText = this.lisInput.value;
            const chineseText = this.translateLisToChinese(lisText);
            this.chineseInput.value = chineseText;
            this.translating = false;
        });
        
        // 中文输入变化时翻译成Lis
        this.chineseInput.addEventListener('input', () => {
            if (this.translating) return;
            
            this.translating = true;
            const chineseText = this.chineseInput.value;
            const lisText = this.translateChineseToLis(chineseText);
            this.lisInput.value = lisText;
            this.translating = false;
        });
    }
    
    // 将Lis翻译成中文
    translateLisToChinese(lisText) {
        if (!lisText.trim()) return '';
        
        // 按空格分割成词汇
        const words = lisText.split(' ');
        
        // 第一步：识别所有可能的短语（从长到短）
        let processed = [];
        let i = 0;
        
        while (i < words.length) {
            let foundPhrase = false;
            
            // 尝试匹配最长可能的短语（最多4个词）
            for (let length = Math.min(4, words.length - i); length >= 2; length--) {
                const potentialPhrase = words.slice(i, i + length).join(' ');
                
                if (this.rules.phrases[potentialPhrase]) {
                    // 找到短语，检查前后是否有前缀或后缀
                    let phraseTranslation = this.rules.phrases[potentialPhrase];
                    
                    // 检查短语前的单词是否是前缀
                    if (i > 0) {
                        const prevWord = words[i-1];
                        for (const prefix in this.rules.prefixes) {
                            if (prevWord === prefix) {
                                phraseTranslation = this.rules.prefixes[prefix] + phraseTranslation;
                                // 移除已处理的前缀
                                processed.pop();
                                break;
                            }
                        }
                    }
                    
                    // 检查短语后的单词是否是后缀
                    if (i + length < words.length) {
                        const nextWord = words[i + length];
                        for (const suffix in this.rules.suffixes) {
                            if (nextWord === suffix) {
                                phraseTranslation = phraseTranslation + this.rules.suffixes[suffix];
                                // 跳过这个后缀
                                i++;
                                break;
                            }
                        }
                    }
                    
                    processed.push(phraseTranslation);
                    i += length;
                    foundPhrase = true;
                    break;
                }
            }
            
            if (!foundPhrase) {
                // 处理单个单词
                const word = words[i];
                let wordTranslation = this.translateWord(word);
                
                // 检查前面是否有前缀
                if (i > 0) {
                    const prevWord = words[i-1];
                    for (const prefix in this.rules.prefixes) {
                        if (prevWord === prefix) {
                            wordTranslation = this.rules.prefixes[prefix] + wordTranslation;
                            // 移除已处理的前缀
                            processed.pop();
                            break;
                        }
                    }
                }
                
                // 检查后面是否有后缀
                if (i + 1 < words.length) {
                    const nextWord = words[i+1];
                    for (const suffix in this.rules.suffixes) {
                        if (nextWord === suffix) {
                            wordTranslation = wordTranslation + this.rules.suffixes[suffix];
                            // 跳过这个后缀
                            i++;
                            break;
                        }
                    }
                }
                
                processed.push(wordTranslation);
                i++;
            }
        }
        
        // 将结果连接成无空格的中文字符串
        return processed.join('');
    }
    
    // 翻译单个Lis词汇
    translateWord(word) {
        // 先检查完整词汇映射
        if (this.rules.words[word]) {
            return this.rules.words[word];
        }
        
        // 尝试前缀+词根匹配
        for (const prefix in this.rules.prefixes) {
            if (word.startsWith(prefix)) {
                const root = word.substring(prefix.length);
                if (this.rules.words[root]) {
                    return this.rules.prefixes[prefix] + this.rules.words[root];
                }
            }
        }
        
        // 尝试词根+后缀匹配
        for (const suffix in this.rules.suffixes) {
            if (word.endsWith(suffix)) {
                const root = word.substring(0, word.length - suffix.length);
                if (this.rules.words[root]) {
                    return this.rules.words[root] + this.rules.suffixes[suffix];
                }
            }
        }
        
        // 尝试前缀+词根+后缀匹配
        for (const prefix in this.rules.prefixes) {
            for (const suffix in this.rules.suffixes) {
                if (word.startsWith(prefix) && word.endsWith(suffix)) {
                    const root = word.substring(prefix.length, word.length - suffix.length);
                    if (this.rules.words[root]) {
                        return this.rules.prefixes[prefix] + this.rules.words[root] + this.rules.suffixes[suffix];
                    }
                }
            }
        }
        
        // 无法翻译，返回原词
        return word;
    }
    
    // 将中文翻译成Lis
    translateChineseToLis(chineseText) {
        if (!chineseText.trim()) return '';
        
        // 创建反向映射表
        const reversePhrases = {};
        for (const key in this.rules.phrases) {
            reversePhrases[this.rules.phrases[key]] = key;
        }
        
        const reverseWords = {};
        for (const key in this.rules.words) {
            reverseWords[this.rules.words[key]] = key;
        }
        
        const reversePrefixes = {};
        for (const key in this.rules.prefixes) {
            reversePrefixes[this.rules.prefixes[key]] = key;
        }
        
        const reverseSuffixes = {};
        for (const key in this.rules.suffixes) {
            reverseSuffixes[this.rules.suffixes[key]] = key;
        }
        
        // 先尝试匹配短语（从长到短）
        let result = [];
        let i = 0;
        
        while (i < chineseText.length) {
            let foundPhrase = false;
            
            // 尝试匹配最长可能的短语（最多4个字符）
            for (let length = Math.min(4, chineseText.length - i); length >= 2; length--) {
                const potentialPhrase = chineseText.substring(i, i + length);
                
                if (reversePhrases[potentialPhrase]) {
                    result.push(reversePhrases[potentialPhrase]);
                    i += length;
                    foundPhrase = true;
                    break;
                }
            }
            
            if (!foundPhrase) {
                // 处理单个字符
                const char = chineseText[i];
                let found = false;
                
                // 检查是否是前缀
                for (const prefix in reversePrefixes) {
                    if (char === prefix) {
                        result.push(reversePrefixes[prefix]);
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    // 检查是否是后缀
                    for (const suffix in reverseSuffixes) {
                        if (char === suffix) {
                            result.push(reverseSuffixes[suffix]);
                            found = true;
                            break;
                        }
                    }
                }
                
                if (!found) {
                    // 检查是否是词汇
                    if (reverseWords[char]) {
                        result.push(reverseWords[char]);
                    } else {
                        // 无法翻译的字符保留原样
                        result.push(char);
                    }
                }
                
                i++;
            }
        }
        
        return result.join(' ');
    }
}

// 初始化翻译器
document.addEventListener('DOMContentLoaded', () => {
    new LisTranslator();
});