// 日历组件
export class Calendar {
    constructor(container, onDateSelect) {
        this.container = container;
        this.onDateSelect = onDateSelect;
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.isVisible = false;
        this.render();
    }

    // 获取月份的天数
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    // 获取月份的第一天是星期几
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }

    // 格式化日期
    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // 渲染日历
    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const daysInMonth = this.getDaysInMonth(year, month);
        const firstDayOfMonth = this.getFirstDayOfMonth(year, month);

        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

        let html = `
            <div class="calendar-header">
                <button class="calendar-nav prev">&lt;</button>
                <span class="calendar-title">${year}年 ${monthNames[month]}</span>
                <button class="calendar-nav next">&gt;</button>
            </div>
            <div class="calendar-body">
                <div class="calendar-weekdays">
                    ${weekDays.map(day => `<div class="weekday">${day}</div>`).join('')}
                </div>
                <div class="calendar-days">`;

        // 添加空白天数
        for (let i = 0; i < firstDayOfMonth; i++) {
            html += '<div class="day empty"></div>';
        }

        // 添加月份天数
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isToday(date);
            const isSelected = this.isSameDate(date, this.selectedDate);
            html += `
                <div class="day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${this.formatDate(date)}">
                    ${day}
                </div>`;
        }

        html += '</div></div>';
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    // 判断是否是今天
    isToday(date) {
        const today = new Date();
        return this.isSameDate(date, today);
    }

    // 判断是否是同一天
    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    // 添加事件监听
    attachEventListeners() {
        // 上一月/下一月按钮
        this.container.querySelector('.prev').addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        this.container.querySelector('.next').addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });

        // 日期选择
        const days = this.container.querySelectorAll('.day:not(.empty)');
        days.forEach(day => {
            day.addEventListener('click', () => {
                const dateStr = day.dataset.date;
                this.selectedDate = new Date(dateStr);
                this.onDateSelect(dateStr);
                this.hide();
            });
        });
    }

    // 显示日历
    show() {
        this.container.style.display = 'block';
        this.isVisible = true;
        this.render();
    }

    // 隐藏日历
    hide() {
        this.container.style.display = 'none';
        this.isVisible = false;
    }

    // 切换日历显示状态
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}