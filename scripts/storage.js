// 数据存储模块
export class TodoStorage {
    constructor() {
        this.storageKey = 'todo_items';
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 获取指定日期的待办事项
    async getTodos(date) {
        const key = `${this.storageKey}_${date}`;
        const result = await chrome.storage.local.get(key);
        return result[key] || [];
    }

    // 保存待办事项
    async saveTodos(date, todos) {
        const key = `${this.storageKey}_${date}`;
        await chrome.storage.local.set({ [key]: todos });
    }

    // 添加待办事项
    async addTodo(date, content) {
        const todos = await this.getTodos(date);
        const newTodo = {
            id: this.generateId(),
            content,
            completed: false,
            createdAt: Date.now()
        };
        todos.push(newTodo);
        await this.saveTodos(date, todos);
        return newTodo;
    }

    // 更新待办事项
    async updateTodo(date, id, updates) {
        const todos = await this.getTodos(date);
        const index = todos.findIndex(todo => todo.id === id);
        if (index !== -1) {
            todos[index] = { ...todos[index], ...updates };
            await this.saveTodos(date, todos);
            return todos[index];
        }
        return null;
    }

    // 删除待办事项
    async deleteTodo(date, id) {
        const todos = await this.getTodos(date);
        const filteredTodos = todos.filter(todo => todo.id !== id);
        await this.saveTodos(date, filteredTodos);
    }

    // 切换待办事项完成状态
    async toggleTodo(date, id) {
        const todos = await this.getTodos(date);
        const todo = todos.find(todo => todo.id === id);
        if (todo) {
            return await this.updateTodo(date, id, { completed: !todo.completed });
        }
        return null;
    }

    // 继承前一天未完成的待办事项
    async inheritTodosFromPreviousDay(currentDate) {
        // 计算前一天的日期
        const previousDate = new Date(currentDate);
        previousDate.setDate(previousDate.getDate() - 1);
        const previousDateStr = previousDate.toISOString().split('T')[0];

        // 获取前一天的待办事项
        const previousTodos = await this.getTodos(previousDateStr);
        
        // 筛选出未完成的待办事项
        const uncompletedTodos = previousTodos.filter(todo => !todo.completed);
        
        // 如果有未完成的待办事项，则添加到当前日期
        if (uncompletedTodos.length > 0) {
            const currentTodos = await this.getTodos(currentDate);
            
            // 为每个未完成的待办事项创建新的条目
            const newTodos = uncompletedTodos.map(todo => ({
                id: this.generateId(),
                content: todo.content,
                completed: false,
                createdAt: Date.now(),
                inheritedFrom: previousDateStr
            }));
            
            // 将新的待办事项添加到当前日期的列表中
            await this.saveTodos(currentDate, [...currentTodos, ...newTodos]);
            return newTodos;
        }
        
        return [];
    }
}