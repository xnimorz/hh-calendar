//Календарь
var calendar;
//Перечисление месяцев
var months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

/**
 * Закрывает все открытые поп апы
 */
function closePopUps()
{
	$(".b-pop-up").filter(".show").removeClass("show").addClass("hide");
	$(".b-event-clickable").addClass("b-event-hide");
	$(".event-form .b-page-textbox").removeClass("b-event-hide").attr("value","");
	$("#event-description").val("");
	$("#quick-event-text").attr("value","");
}

/**
 * парс строки с датой
 * @param {String} date - например: 5 марта 2013
 * @returns {{day: {Number} число, month: {Number} номер месяца, начиная с 0, year: {Number} - год}}
 */
function parseDate(date)
{
	var day,month,year;
	for (var i = 0; i < date.length; i++)
	{
		if (+date[i])
		{
			if (day && date[i] >=1 && date[i] <= 12)
			{
				month = date[i] -1;
			} else
			if (date[i] >= 1 && date[i] <= 31)
				day = date[i];

			if (date[i] >= 1500 && date[i] <= 3000)
				year = date[i];
		}
		for (var j = 0; j < months.length; j++)
		{
			if (date[i] == months[j])
			{
				month = j;
			}
		}
	}
	var res = {
		day:day,
		month: month,
		year:year
	};
	return res;

}

/**
 * Обновление данных, закрытие поп апов
 */
function update()
{
   calendar.update();
   closePopUps();

}

/**
 * Завершение ввода в textBox, отображение кликабельной строки
 * @param {event} e
 */
function textboxInputOver(e)
{
	var t = $(this);
	e = e || window.event;
	$("#i-"+ e.target.id).removeClass("b-event-hide").filter(".b-event__text-holder").html(t.attr("value"));
	if (e.target.id == "event-part-info")
	{
		$("#i-"+ e.target.id).children(".b-event__text-holder").html(t.attr("value"));
	}
	t.addClass("b-event-hide");
}

/**
 * создает событие посредством кнопки добавить. Парсит строку, выделяет дату и событие
 */
function createQuickEvent()
{
	var day, month, year, time, event;
	var text = $("#quick-event-text").attr("value");
	var items = text.split(/[\s,\.]/);

	//Обрабатываем полученную строку
	for (var i = 0 ; i < items.length; i++)
	{
		if (items[i] != "")
			//Если очерендной элемент число (год\дата) (проверяем с помощью унарного +
			if (+items[i])
			{
				//день
				if (day && items[i] >= 1 && items[i] <= 12 )
				{
					month = items[i] - 1;
				}   else
				if (items[i] >= 1 && items[i] <= 31)
				{
					day = items[i];
				}
				else
				{
					//год
					if (items[i] >= 1500 && items[i] <= 3000)
					{
						year = items[i];
					}
				}
			}
			else
			{
				//Обработка времени
				if (items[i].indexOf(":") > 0)
				{
					var temp = items[i].split(":");
					if (temp[0] && (parseInt(temp[0],10) == temp[0]) && (parseInt(temp[1],10) == temp[1]))
					{
						time = items[i];
					}
				}
				else
				{
					//поиск месяца
					var isMonth = false
					for (var j = 0; j < months.length && !month; j++)
					{
						if (months[j] == items[i])
						{
							isMonth = true;
							month = j;
						}
					}
					//Собственно, событие
					if (!isMonth)
					{
						if (event)
							event += " "+items[i]
						else
							event = items[i];
					}
				}
			}
	}

	//Корректировка  и запись
	if (day && event)
	{
		var tempDate = new Date();
		month = month || tempDate.getMonth();
		year = year || tempDate.getFullYear();
		console.log(time);
		calendar.addEvents(
			{
				title:event,
				part:"",
				descr: time?"Начало: "+time: ""
			}, new Date(year,month,day)
		);
	}
	closePopUps();
}

/**
 * Отображение поп апа c детальным редактированием\созданием события
 * Вычисление позиций.
 * @param {event} e
 */
function showDayEventDialog(e)
{
	$(".b-event").removeClass("hide").addClass("show").css(
		{
			left: (e.pageX + 25) + "px",
			top: (e.pageY - 36) + "px"
		});
	$(".b-event__arrow").css(
		{
			top: "25px",
			left:"-13px",
			"background-position": "-121px -18px"
		}
	)

	if (e.pageY > 500)
	{
		$(".b-event").css({
			top: (e.pageY - 300) + "px"
		});
		$(".b-event__arrow").css(
			{
				top:"290px"
			}
		)
	}

	if (e.pageX > window.screen.width/2)
	{
		$(".b-event").css({
			left: (e.pageX - 325) + "px"
		});
		$(".b-event__arrow").css(
			{
				left:"302px",
				"background-position": "-140px -18px"
			}
		)
	}
}

/**
 * Отображение поп апа c детальным редактированием\созданием события
 * @param {event} e
 */
function newEventDialogShow(e)
{
	closePopUps();
	e = e || window.event;
	if (e.target.id == "new-event")
	{
		$(".b-quick-event").removeClass("hide").addClass("show").css(
		  {
			  left:$("#new-event").offset().left+"px"
		  }
		);
		calendar.clear();
		return;
	}

	if ((!$(this).hasClass("ui-calendar-month-control")) && calendar.event)
	{


		if (calendar.getSelectedDates().length > 0)
		{
			showDayEventDialog(e);
		}

	}

}

/**
 * Начальная инициализация, создание обработчиков событий
 */
function init()
{
	calendar = new UICalendar(".b-page-calendar",false,"date",true);

	//Если первый запуск, либо событий нет - создадим 3 "искуственных" события
	if (!calendar.eventsInit)
	{
		calendar.addEvents({title:"Напиться!",part:"Витя Костин, Петр Михайлов"},new Date(2013,8,9));
		calendar.addEvents({title:"ДР!",part:"Дима Молодцов"},new Date(2013,8,22));
		calendar.addEvents({title:"День рождение!",part:"Егор"},new Date(2014,0,10));
	}

	//Создание нового события
	$("#new-event").bind("click keypress", newEventDialogShow);
	//Обновление
	$("#update").bind("click keypress", update);

	//Кнопка крестика - закрывает все поп апы, удаляет выбранные даты в календаре
	$(".b-close").bind("click keypress",function()
	{
		closePopUps();
		$(".ui-calendar-select").removeClass("ui-calendar-select");
	});
	//переход по месяцам\годам - закрывает поп-апы
	$(".ui-calendar-daterange, .ui-calendar-move, .ui-calendar-today__button").bind("click keypress", closePopUps);
	//Выбор даты в календаре - диалог добавления события
	$(".ui-calendar-selectable").live("click keypress",newEventDialogShow);
	//Создание события
	$("#create-quick-event").bind("click keypress",createQuickEvent );
	//Завершение ввода в текст бокс, отображение в виде строки
	$("#event-info, #event-date-info, #event-part-info").bind("change",textboxInputOver);

	//Нажатие на введенную строку в добавлении событии - переход к редактированию строки.
	$("#i-event-info, #i-event-date-info, #i-event-part-info").bind("click keypress",function(e)
	{
		var t = $(this);
		e = e || window.event;
		var textBoxId = e.target.id.substr(2, e.target.id.length-2) || "event-part-info";

		$("#"+textBoxId).removeClass("b-event-hide");
		t.addClass("b-event-hide");
	});

	//добавление\редактирование события.
	$("#create-event").bind("click keypress", function()
	{
	   var event = $("#event-info").attr("value"),
		   date = $("#event-date-info").attr("value"),
		   part = $("#event-part-info").attr("value"),
		   descr = $("#event-description").val();


		date = date.split((/[\s,\.]/));
		var parsedDate = parseDate(date);
		date = new Date
		(
			parsedDate.year || calendar.getSelectedDates()[0].getFullYear(),
			parsedDate.month || calendar.getSelectedDates()[0].getMonth(),
			parsedDate.day || calendar.getSelectedDates()[0].getDate()
		);
		calendar.addEvents(
			{
				title:event? event : "Без названия",
				part: part,
				descr: descr
			},
			date
		);
	    closePopUps();
	});

	//Кнопка удалить событие - удаление событие из календаря и обновление данных
	$("#delete-event").bind("click keypress",function()
	{

	   calendar.deleteEvents(calendar.getSelectedDates()[0]);
		update();
	});

	//Если нажатие по кнопке в календаре, на которой уже было событие - получение данных о событии и отображение их.
	$(".ui-calendar-events").live("click keypress",function()
	{
	    var selectedDate = calendar.getSelectedDates()[0];
		if (!selectedDate) return;
	    var event = calendar.getEvents(selectedDate)[0];

	    $("#event-info").attr("value",event.title);
		$("#i-event-info").html(event.title);

	    $("#event-date-info").attr("value",selectedDate.getDate() + " " + months[selectedDate.getMonth()] + " " + selectedDate.getFullYear());
		$("#i-event-date-info").html(selectedDate.getDate() + " " + months[selectedDate.getMonth()] + " " + selectedDate.getFullYear());

	    $("#event-part-info").attr("value",event.part);
		$("#i-event-part-info .b-event__text-holder").html(event.part);

	    $("#event-description").val(event.descr);
		$(".event-form").children("input").addClass("b-event-hide").end().children("div").removeClass("b-event-hide");
	});

	//Отображение белого текста и подсветка дня в поиске
	$(".b-search-form__result").live("mouseover",function()
	{
	  var t = $(this).children(".b-search-form__result-date").css(
		   {
			   color:'#fff'
		   }
	   );
	 if (calendar.firstMonthDate.getMonth() == t.attr("month") && calendar.firstMonthDate.getFullYear() == t.attr("year") )
	 {
		 var startIndex = calendar.firstMonthDate.getDay() - 1;
		 if (startIndex < 0) startIndex = 6;
		 startIndex +=  Number(t.attr('day'));
		 $(".ui-calendar-list-item").eq(startIndex-1).addClass("ui-calendar-search");

	 }
	   //Анигиляция подсветки и белого текста в поиске
	}).live("mouseleave",function()
		{
			$(this).children(".b-search-form__result-date").css(
				{
					color:'#666'
				});
			$(".ui-calendar-search").removeClass("ui-calendar-search");
			//Переход к выбранной дате по клику в поиске
		}).live("click keypress",function()
		{
			var t = $(this).children(".b-search-form__result-date");
			calendar.toDate(new Date(t.attr("year"), t.attr("month"), t.attr("day")));
			closePopUps();
		})

	 //Редактирование данных в поиске, отображение результатов
	$("#b-search").bind("click keypress keyup",function()
	{
		closePopUps();
		var resultArray = [];

		var text = $("#b-search").attr("value");
		$(".b-search-box").removeClass("hide").css(
			{
				left:$("#b-search").offset().left + "px"
			}
		).addClass("show");

		var checkDate = text.split(" ");
		var date = parseDate(checkDate);

		var eventArray = calendar.getAllEvents();
		var textFinder = new RegExp(text,"ig");
		for (var i in eventArray)
		{
			for (var j in eventArray[i])
			{
				var temp = eventArray[i][j];
				var isGood = false;
				if (date.day || date.month || date.year)
				{
				    isGood = true;
					if (date.day && temp.day != date.day) isGood = false;
					if (date.month != undefined && temp.month != date.month) isGood = false;
					if (date.year && temp.year != date.year) isGood = false;
				}
				if (isGood || (temp.title && temp.title.match(textFinder)) || (temp.part && temp.part.match(textFinder)) || (temp.descr && temp.descr.match(textFinder)))
				{
					resultArray.push(temp);
				}
			}

		}
		if  (resultArray.length > 8)
		{
			console.log(1);
			$(".b-search-form").css(
				{
					"overflow-y": "scroll"
				}
			);
		}
		else
			$(".b-search-form").css(
				{
					"overflow-y": "hidden"
				}
			);

	     var template =
			"<div class=b-search-form__result>\
		        <div class=b-search-form__result-title>{0}</div>\
		        <div class=b-search-form__result-date year={1} month={2} day={3}>{4}</div>\
		    </div>\
		    ",
	    templateLine = "<div class=b-search-form__line></div>"
		var target = $(".b-search-form");
		target.html("");
		for (var i = 0; i < resultArray.length; i++)
		{
			var t = resultArray[i];
			var copy = template.replace('{1}', t.year)
								.replace('{2}', t.month)
								.replace('{3}', t.day)
								.replace('{4}', t.day + "   " + months[t.month])
								.replace('{0}', t.title);
			if (i > 0)
			{
				target.append($(templateLine));
			}
			target.append($(copy));
		}
	});

}

window.onload = init;