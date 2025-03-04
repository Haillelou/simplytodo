import { TodoStorage } from './storage.js';
import { Calendar } from './calendar.js';

class TodoApp {
    constructor() {
        this.storage = new TodoStorage();
        this.currentDate = new Date();
        this.initializeElements();
        this.initializeCalendar();
        this.setupEventListeners();
        this.loadTodos();
        this.startDateCheck();
    }

    // 初始化DOM元素
    initializeElements() {
        this.dateTitle = document.getElementById('dateTitle');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.addTodoButton = document.getElementById('addTodoButton');
        this.calendarButton = document.getElementById('calendarButton');
        this.calendarContainer = document.getElementById('calendar');
        this.updateDateTitle();
    }

    // 初始化日历组件
    initializeCalendar() {
        this.calendar = new Calendar(this.calendarContainer, (date) => {
            this.currentDate = new Date(date);
            this.updateDateTitle();
            this.loadTodos();
        });
    }

    // 设置事件监听
    setupEventListeners() {
        this.addTodoButton.addEventListener('click', () => this.addTodo());
        this.calendarButton.addEventListener('click', () => this.calendar.toggle());
        document.addEventListener('click', (e) => {
            if (!this.calendarContainer.contains(e.target) && 
                !this.calendarButton.contains(e.target) && 
                this.calendar.isVisible) {
                this.calendar.hide();
            }
        });
    }

    // 更新日期标题
    updateDateTitle() {
        const month = this.currentDate.getMonth() + 1;
        const date = this.currentDate.getDate();
        this.dateTitle.textContent = `${month}月${date}日`;
    }

    // 格式化日期
    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // 加载待办事项
    async loadTodos() {
        const dateStr = this.formatDate(this.currentDate);
        const todos = await this.storage.getTodos(dateStr);
        this.renderTodos(todos);
    }

    // 渲染待办事项列表
    renderTodos(todos) {
        this.todoList.innerHTML = '';
        this.emptyState.classList.toggle('visible', todos.length === 0);

        // 对待办事项进行排序：未完成的在前，已完成的在后
        const sortedTodos = [...todos].sort((a, b) => {
            if (a.completed === b.completed) {
                return b.createdAt - a.createdAt;
            }
            return a.completed ? 1 : -1;
        });

        sortedTodos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-content" contenteditable="true">${todo.content}</div>
                <button class="todo-delete" aria-label="删除">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            `;

            const checkbox = todoItem.querySelector('.todo-checkbox');
            const content = todoItem.querySelector('.todo-content');
            const deleteButton = todoItem.querySelector('.todo-delete');

            // 切换完成状态
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

            // 编辑内容
            let originalContent = todo.content;
            content.addEventListener('focus', () => {
                originalContent = content.textContent;
            });

            content.addEventListener('blur', () => {
                const newContent = content.textContent.trim();
                if (newContent && newContent !== originalContent) {
                    this.updateTodo(todo.id, newContent);
                } else if (!newContent) {
                    content.textContent = originalContent;
                }
            });

            content.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    content.blur();
                }
            });

            // 删除待办
            deleteButton.addEventListener('click', () => this.deleteTodo(todo.id));

            this.todoList.appendChild(todoItem);
        });
    }

    // 添加待办事项
    async addTodo() {
        const dateStr = this.formatDate(this.currentDate);
        const todo = await this.storage.addTodo(dateStr, '新待办事项');
        await this.loadTodos();

        // 自动聚焦到新添加的待办事项
        const newTodoItem = this.todoList.firstChild;
        if (newTodoItem) {
            const content = newTodoItem.querySelector('.todo-content');
            content.focus();
            // 选中全部文本
            const range = document.createRange();
            range.selectNodeContents(content);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    // 更新待办事项
    async updateTodo(id, content) {
        const dateStr = this.formatDate(this.currentDate);
        await this.storage.updateTodo(dateStr, id, { content });
        await this.loadTodos();
    }

    // 删除待办事项
    async deleteTodo(id) {
        const dateStr = this.formatDate(this.currentDate);
        await this.storage.deleteTodo(dateStr, id);
        await this.loadTodos();
    }

    // 切换待办事项状态
    async toggleTodo(id) {
        const dateStr = this.formatDate(this.currentDate);
        await this.storage.toggleTodo(dateStr, id);
        await this.loadTodos();
    }

    // 开始日期检查
    startDateCheck() {
        const checkDate = () => {
            const now = new Date();
            if (!this.isSameDate(now, this.currentDate)) {
                this.currentDate = now;
                this.updateDateTitle();
                this.loadTodos();
            }
        };

        // 每分钟检查一次日期
        setInterval(checkDate, 60000);
    }

    // 判断是否是同一天
    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});