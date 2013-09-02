/**
 * Доступность localStorage
 */
function localStorageAccess() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null && localStorage != undefined;
	} catch (e) {
		console.log("localStorage недоступен");
		return false;
	}
}

/**
 * Создает экземпляр нового виджета календарь
 * @param {String} jquerySelector - css селектор DOM элемента, внутри которого расположится календарь
 * @param multipleSelect - разрешение на мультивыборку (по умолчанию запрешена)
 * @param startYear - год отображения
 * @param startMonth - месяц отображения
 * @constructor
 * @attribute target - целевой JQuery объект
 * @attribute targetSelector - заданный селектор
 * @attribute events - ассоциативный массив событий
 * @attribute ctrlKey - multi select возможность
 * @attribute firstMonthDate - отображаемая дата (год\месяц)
 * @attribute dateRange - выбранные даты
 * @attribute calendar - текущий календарь (месяцев,годов, дат)
 */
function UICalendar(jquerySelector, multipleSelect, calendarType, autoSwitch, startYear, startMonth) {
    this.target = $(jquerySelector);
    this.targetSelector = jquerySelector;
	this.events = [];
    this.ctrlKey = multipleSelect;
	this.mounth = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
	this.calendar;
	this.daysDiv = $('<div class="ui-calendar-margin ui-calendar-padding"></div>');
	this.firstMonthDate = new Date();
	this.firstMonthDate.setDate(1);
	this.autoSwitch = autoSwitch;
	this.calendarListDiv = $("<div></div>");
	this.dateRange;
	this.init();
    switch (calendarType)
    {
	    case "month": this.calendar = new UICalendarMonthProvider(this);
		        break;
	    case "year": this.calendar = new UICalendarYearProvider(this);
		    break;
	    default ://"date"
		    this.calendar = new UICalendarDateProvider(this);
		    break;
    }

    if (startYear)
    {
        this.firstMonthDate.setYear(startYear);
    }
    if (startMonth)
    {
        this.firstMonthDate.setMonth(startMonth);
    }

    this.initEventsFromLocalStorage();
    this.calendar.initValues();
    this.selectedDates = [];

}


/**
 * Возвращает выбранные даты
 * @returns {Array}
 */
UICalendar.prototype.getSelectedDates = function () {
	return this.selectedDates;
};

/**
 * Перевод календаря к выбранной дате
 * @param {Date} date - выбранная дата
 */
UICalendar.prototype.toDate = function(date)
{
	this.firstMonthDate = date;
	this.firstMonthDate.setDate(1);
	this.calendar = new UICalendarDateProvider(this);
	this.calendar.initValues();
}

/**
 * Возврашает массив событий определенного дня
 * @param {Date} date - выбранный день
 * @returns {Array} массив со всеми событиями выбранного дня
 */
UICalendar.prototype.getEvents = function(date)
{
	if (!date) return null;

	var index = date.getFullYear()+"/"+date.getMonth()+"/"+date.getDate();

	if (this.events[index])
		return this.events[index];
	else
		return null;
}

/**
 * Удаление событий в выбранной дате
 * @param {Date} date - выбранная дата
 */
UICalendar.prototype.deleteEvents = function(date)
{

	var index = date.getFullYear()+"/"+date.getMonth()+"/"+date.getDate();

	if (this.events[index])
		delete this.events[index];

	if (localStorageAccess())
	{

		localStorage.removeItem(index);
	}
}

/**
 * Обновление данных
 */
UICalendar.prototype.update = function()
{
	this.calendar.initValues();
}

/**
 * Инициализация данных из localStorage
 */
UICalendar.prototype.initEventsFromLocalStorage = function()
{
   if (localStorageAccess())
   {
	   for (var i in localStorage)
	   {
		   //Выбираем только "свои"
		   if (i.match(/[0-9]+\/[0-9]+\/[0-9]+/))
		   {
			   var event = JSON.parse(localStorage[i]);
			   this.addEvents(event,new Date(event.year,event.month,event.day));
			   //Уведомим флаг, что события загружены
			   this.eventsInit = true;
		   }
	   }
   }
}

/**
 * Получить массив всех событий
 * @returns {Array} Events - события, записанные в календаре
 */
UICalendar.prototype.getAllEvents = function()
{
	return this.events;
}

/**
 * Добавляет события для выбранного (либо выделенных) дня\дней
 * @param eventDescription - событие
 * @param concreteDates - выбранный день
 */
UICalendar.prototype.addEvents = function(eventDescription, concreteDates)
{
	/**
	 * Сохранение события в localStorage
	 * @param event - событие
	 */
	var saveEventToLocalStorage = function(event)
	{
		if (localStorageAccess())
		{
			var index = event.year+"/"+event.month+"/"+event.day;
			localStorage.setItem(index,JSON.stringify(event));
		}
	}

	/**
	 * Добавление события в массив событий
	 * @param eventArray - массив событий
	 * @param eventDescription - добавляемое событие
	 * @param date - дата события
	 */
	var addEvent = function(eventArray,eventDescription,date)
	{
		var index = date.getFullYear()+"/"+date.getMonth()+"/"+date.getDate();
		if (eventArray[index])
		{
			eventArray[index].push(eventDescription);
		}
		else
		{
			eventArray[index] = [eventDescription];

		}
		eventArray[index][eventArray[index].length-1].day = date.getDate();
		eventArray[index][eventArray[index].length-1].month = date.getMonth();
		eventArray[index][eventArray[index].length-1].year = date.getFullYear();
		saveEventToLocalStorage(eventArray[index][eventArray[index].length-1]);
	};

	var dates =  concreteDates || this.selectedDates;
	if (dates instanceof Array)
	{
		for(var i in dates)
			addEvent(this.events,eventDescription,dates[i]);
	}
	else
	{
		this.deleteEvents(dates);
		addEvent(this.events,eventDescription,dates);
	}

	this.calendar.initValues();

};

/**
 * Очищение календаря
 */
UICalendar.prototype.clear = function()
{
  	$(".ui-calendar-select").removeClass('ui-calendar-select');
	this.selectedDates = [];
}

/**
 * Общая реакция для всех классов реакция на клик по дате\месяцу\году
 * @param currentObject - календарь
 * @param selectedDate - выбранная дата
 * @param e - параметры клика
 */
UICalendar.prototype.dateClick = function(currentObject,selectedDate,e)
{
	//item уже был выбран
	if ($(this).hasClass('ui-calendar-select'))
	{
		$(this).removeClass('ui-calendar-select');
		for (var i = 0 ; i < currentObject.selectedDates.length; i++)
		{
			//удаляем его из массива выбранных
			if (currentObject.selectedDates[i].toString() == selectedDate.toString())
			{
				currentObject.selectedDates.splice(i,1);
			}

		}
	}
	else
	{   //Если не мульти-селект, затираем предыдущие значения
		if (!e.ctrlKey || !currentObject.ctrlKey)
		{
			$(currentObject.targetSelector +" .ui-calendar-select").removeClass('ui-calendar-select');
			currentObject.selectedDates = [];
		}
		//Добаляем новое
		$(this).addClass('ui-calendar-select');
		currentObject.selectedDates.push(selectedDate);
	}
}

/**
 * Инициализация блока календаря (верхняя полоса, блоки)
 */
UICalendar.prototype.init = function ()
{
	//Верхний блок
	var calendar = $("<div class='ui-calendar-font ui-calendar-div'></div>");
	var calendarHead = $("<div class='ui-calendar-head ui-calendar-margin'></div>");
	var leftSpan = $("<div class='ui-calendar-cursor ui-calendar-move ui-calendar-move__left left-side'></div>");
	var rightSpan = $("<div class='ui-calendar-cursor ui-calendar-move ui-calendar-move__right left-side'></div>");
	this.dateRange = this.autoSwitch?$("<div class='ui-calendar-daterange ui-calendar-daterange-clickable left-side'></div>"):$("<div class='ui-calendar-daterange left-side'></div>");
	var today =   $("<div class='ui-calendar-cursor ui-calendar-today__button left-side'>Сегодня</div>");


	calendarHead.append(leftSpan, this.dateRange, rightSpan, today,$("<div class=ui-calendar-clear></div>"));

	calendar.append(calendarHead);
	this.target.append(calendar);

	var currentObject = this;

	//Реакция на переключение (влево вправо)
	leftSpan.bind("click", function () {

		currentObject.calendar.move(-1);
	});
	rightSpan.bind("click", function () {
		currentObject.calendar.move(1);
	});


	this.daysDiv.append(this.calendarListDiv);
	calendar.append(this.daysDiv);

	var thisObject = this;
	today.bind("click keypress",function()
	{
		thisObject.firstMonthDate = new Date();
		thisObject.firstMonthDate.setDate(1);
		thisObject.calendar = new UICalendarDateProvider(thisObject);

		thisObject.calendar.initValues();
	});

};

/**
 * Задает месяц для отображения
 * @param month - месяц, необходимый для отображения
 */
UICalendar.prototype.setMonth = function(month)
{
	this.firstMonthDate.setMonth(month);
	this.calendar.initValues();
};

/**
 * Задает год для отображения
 * @param year
 */
UICalendar.prototype.setYear = function(year)
{
	this.firstMonthDate.setYear(year);
	this.calendar.initValues();
} ;

/**
 * Расширение даты - получает количество дней в месяце
 * @returns {number}
 */
Date.prototype.getDaysInMonth = function () {
	return (new Date(this.getFullYear(), this.getMonth() + 1, 0)).getDate();
};



/**
 * класс, определяющий методы для смены дат в календаре.
 *
 * определяет
 *
 * 1)Метод смены интервала выборки (move)
 *
 * 2) Инициализацию выбранных вариантов
 *
 * @constructor
 */
function UICalendarProvider()
{
	this.move = function(direction){};
	this.initValues = function(){};
};



/**
 * Работа с интервалом в 30 лет
 * @param UICalendarItem - основной класс
 * @constructor
 */
function UICalendarYearProvider(UICalendarItem)
{
	this.UICalendarItem = UICalendarItem;
	this.UICalendarItem.daysDiv.html("");
	this.UICalendarItem.daysDiv.append(this.UICalendarItem.calendarListDiv);

	/**
	 * Переход на другие 30 лет
	 * @param {Number} direction - направление переход (-1 - предыдущий, 1 - следующий)
	 */
	this.move = function(direction)
	{
		this.UICalendarItem.selectedDates = [];
		this.UICalendarItem.firstMonthDate.setYear(this.UICalendarItem.firstMonthDate.getFullYear()+direction*30);
		this.initValues();
	};

	/**
	 * Представление 30 лет, инициализация реакции нажатия на кнопку
	 */
	this.initValues = function()
	{
		this.UICalendarItem.calendarListDiv.html("");
		var daysList = '<ol class="ui-calendar-list-mounth ui-calendar-list ui-calendar-list-up ui-calendar-font-white-color ui-calendar-text-left-side">';

		this.UICalendarItem.dateRange.html(this.UICalendarItem.firstMonthDate.getFullYear() + "-" + (this.UICalendarItem.firstMonthDate.getFullYear() + 30) );

		for (var i = 0; i < 30 ; i++) {
			daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable'>"+(this.UICalendarItem.firstMonthDate.getFullYear()+i)+"</li>";
		}
		daysList += '</ol><div class=ui-calendar-clear></div>';
		this.UICalendarItem.calendarListDiv.append($(daysList));

		var currentObject = this.UICalendarItem;

		/**
		 * Реакция на выбор даты. (выбор даты, сброс значений) Формирование массива выбранных дат
		 */
		$(this.UICalendarItem.targetSelector + " .ui-calendar-list-mounth li").bind("click",function(e)
		{
			currentObject.event = 0;

			var selectedDate = new Date($(this).html(),0,1);
			if (currentObject.autoSwitch)
			{
				currentObject.firstMonthDate.setFullYear($(this).html());
				currentObject.calendar = new UICalendarMonthProvider(currentObject);
				currentObject.calendar.initValues();
				return;
			}
			currentObject.dateClick.call(this,currentObject,selectedDate,e);
		});
	}
}

UICalendarYearProvider.prototype = new UICalendar();
UICalendarYearProvider.prototype.constructor = UICalendarYearProvider;

/**
 * Работа с интервалом в год (выбор месяца)
 * @param UICalendarItem - основной класс
 * @constructor
 */
function UICalendarMonthProvider(UICalendarItem)
{
	this.UICalendarItem = UICalendarItem;
	this.UICalendarItem.daysDiv.html("");
	this.UICalendarItem.daysDiv.append(this.UICalendarItem.calendarListDiv);

	var currentObject = UICalendarItem;
	/**
	 * При нажатии на верхний интервал - переход в выборке более объемной (с даты на месяц, с месяца на год)
	 */
	$(".ui-calendar-daterange-clickable").bind("click keypress",function()
	{
		currentObject.calendar = new UICalendarYearProvider(currentObject);
		currentObject.calendar.initValues();
	});
	/**
	 * Переход на другой год
	 * @param {Number} direction - направление переход (-1 - предыдущий, 1 - следующий)
	 */
	this.move = function(direction)
	{
		this.UICalendarItem.selectedDates = [];
		this.UICalendarItem.firstMonthDate.setYear(this.UICalendarItem.firstMonthDate.getFullYear()+direction);
		this.initValues();
	}
	/**
	 * Вывод месяцев в году. Возможность выбора
	 */
	this.initValues = function()
	{
		this.UICalendarItem.calendarListDiv.html("");
		var daysList = '<ol class="ui-calendar-list-mounth ui-calendar-list ui-calendar-list-up ui-calendar-font-white-color ui-calendar-text-left-side">';
		var startMounthDay = this.UICalendarItem.firstMonthDate;
		this.UICalendarItem.dateRange.html(this.UICalendarItem.firstMonthDate.getFullYear());

		//Инициализация месяцев в году. Вычисляем нужный месяц по аттрибуту index
		for (var i = 0; i < this.UICalendarItem.mounth.length ; i++) {
			daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable' index="+i+">"+this.UICalendarItem.mounth[i]+"</li>";
		}
		daysList += '</ol><div class=ui-calendar-clear></div>';
		this.UICalendarItem.calendarListDiv.append($(daysList));

		var currentObject = this.UICalendarItem;

		/**
		 * Реакция на выбор даты. (выбор даты, сброс значений) Формирование массива выбранных дат
		 */
		$(this.UICalendarItem.targetSelector + " .ui-calendar-list-mounth li").bind("click",function(e)
		{
			currentObject.event = 0;

			var selectedDate = new Date(currentObject.firstMonthDate.getFullYear(),$(this).attr("index"),1);
			if (currentObject.autoSwitch)
			{
				currentObject.firstMonthDate.setMonth($(this).attr("index"));
				currentObject.calendar = new UICalendarDateProvider(currentObject);
				currentObject.calendar.initValues();
				return;
			}
			currentObject.dateClick.call(this,currentObject,selectedDate,e);
		});
	}
}

UICalendarMonthProvider.prototype = new UICalendarProvider();
UICalendarMonthProvider.prototype.constructor = UICalendarMonthProvider;

/**
 * Выбор даты (интервал в месяц)
 * @param UICalendarItem - экземпляр календаря
 * @constructor
 */
function UICalendarDateProvider(UICalendarItem)
{
	this.UICalendarItem = UICalendarItem;

	this.UICalendarItem.daysDiv.html("");
	this.UICalendarItem.daysDiv.append(this.UICalendarItem.weekDescription);
	this.UICalendarItem.daysDiv.append(this.UICalendarItem.calendarListDiv);

	var currentObject = UICalendarItem;
	/**
	 * При нажатии на верхний интервал - переход в выборке более объемной (с даты на месяц, с месяца на год)
	 * при включенном autoSwitch
	 */
	$(".ui-calendar-daterange-clickable").bind("click keypress",function()
	{
		currentObject.selectedDates = [];
		currentObject.calendar = new UICalendarMonthProvider(currentObject);
		currentObject.calendar.initValues();
	});

	/**
	 * Переход на другой месяц
	 * @param {Number} direction - направление переход (-1 - предыдущий, 1 - следующий)
	 */
	this.move = function(direction)
	{
		this.UICalendarItem.selectedDates = [];
		this.UICalendarItem.firstMonthDate.setMonth(this.UICalendarItem.firstMonthDate.getMonth()+direction);
		this.initValues()
	}

	/**
	 * Инициализация месяца. Установка отображения чисел и названия месяца
	 */
	this.initValues = function()
	{

		this.UICalendarItem.calendarListDiv.html("");
		var daysList = '<ol class="ui-calendar-list-mounth ui-calendar-list ui-calendar-list-up ui-calendar-font-white-color ui-calendar-text-left-side">';
		var startMonthDay = this.UICalendarItem.firstMonthDate;
		this.UICalendarItem.dateRange.html(this.UICalendarItem.mounth[this.UICalendarItem.firstMonthDate.getMonth()] + ' ' + this.UICalendarItem.firstMonthDate.getFullYear());

		//Вычисляем день недели = началу месяца
		var startIndex = startMonthDay.getDay() - 1;
		if (startIndex < 0) startIndex = 6;

		//Количество дней в предыдущем месяце
		var monthBefore = new Date(startMonthDay.getFullYear(),startMonthDay.getMonth(),startMonthDay.getDate());
		monthBefore.setMonth(monthBefore.getMonth()-1);
		var dayInMonthBefore = monthBefore.getDaysInMonth();

		var weekDescriptions = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"]
		var weekIndex = 0;
		//Предыдущий месяц
		for (var i = 0; i < startIndex; i++) {
			daysList += "<li class='left-side ui-calendar-list-item ui-calendar-list-item-width ui-calendar-cursor ui-calendar-selectable ui-calendar-month-control ui-calendar-prev-month'>"+weekDescriptions[weekIndex++]+", "+(dayInMonthBefore-startIndex+i+1)+"</li>";
		}
		//Текущий месяц
		var today = new Date();
		for (var i = 0; i < startMonthDay.getDaysInMonth() ; i++) {
			var currentEvents = this.UICalendarItem.getEvents(new Date(startMonthDay.getFullYear(),startMonthDay.getMonth(),i+1));
			var str = (weekIndex<7?(weekDescriptions[weekIndex++]+", "):"")+(i+1);


				if (currentEvents)
				{    //Событие и день = сегодня
					if (today.getFullYear() == startMonthDay.getFullYear() && today.getMonth() == startMonthDay.getMonth() && today.getDate() == i+1)
						daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable ui-calendar-list-item-width ui-calendar-events ui-calendar-today'>"+str+"" +
							"<div class='ui-calendar-event__text'><div class='ui-calendar-event__title'>"+currentEvents[0].title+"</div>"+currentEvents[0].part+"</div></li>";
					else  //просто событие
						daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable ui-calendar-list-item-width ui-calendar-events'>"+str+"" +
							"<div class='ui-calendar-event__text'><div class='ui-calendar-event__title'>"+currentEvents[0].title+"</div>"+currentEvents[0].part+"</div></li>";
				}
				else //Сегодня
					if (today.getFullYear() == startMonthDay.getFullYear() && today.getMonth() == startMonthDay.getMonth() && today.getDate() == i+1)
					{
						daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable ui-calendar-list-item-width ui-calendar-today'>"+str+"</li>";
					} else  //самый обычный день
						daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable ui-calendar-list-item-width'>"+str+"</li>";

		}
		//Заполним окончание недели следующим месяцем
		var lastsDaysInWeek = 7 - (startMonthDay.getDaysInMonth() - (7- startIndex))%7;

		if (lastsDaysInWeek < 7)
			for (var i = 0; i < lastsDaysInWeek ; i++) {
					daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable ui-calendar-list-item-width ui-calendar-month-control ui-calendar-next-month'>"+(i+1)+"</li>";
			}
		daysList += '</ol><div class=ui-calendar-clear></div>';
		this.UICalendarItem.calendarListDiv.append($(daysList));

		//замыкание - ссылку на себя
		var currentObject = this.UICalendarItem;
		/**
		 * Реакция на выбор даты. (выбор даты, сброс значений) Формирование массива выбранных дат
		 */
		$(this.UICalendarItem.targetSelector + " .ui-calendar-list-mounth li").bind("click",function(e)
		{
			currentObject.event = 1;

			if ($(this).hasClass("ui-calendar-month-control"))
			{
				if ($(this).hasClass("ui-calendar-prev-month"))
				{
					currentObject.calendar.move(-1);

				}
				else
					currentObject.calendar.move(1);
				return;
			}


			var selectedDate = new Date(currentObject.firstMonthDate.getFullYear(),currentObject.firstMonthDate.getMonth(), parseInt($(this).html()));

			currentObject.dateClick.call(this,currentObject,selectedDate,e);


		});
	}
}

UICalendarDateProvider.prototype = new UICalendarProvider();
UICalendarDateProvider.prototype.constructor = UICalendarDateProvider;