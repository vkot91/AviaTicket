const formSearch = document.querySelector(".form-search"),
  inputCitiesFrom = document.querySelector(".input__cities-from"),
  dropdownCitiesFrom = document.querySelector(".dropdown__cities-from"),
  inputCitiesTo = document.querySelector(".input__cities-to"),
  dropdownCitiesTo = document.querySelector(".dropdown__cities-to"),
  inputDateDepart = formSearch.querySelector(".input__date-depart"),
  ticketDayWrpapper = document.querySelector("#cheapest-ticket"),
  ticketsWrapper = document.querySelector("#other-cheap-tickets");
const citiesApi = "database/cities.json";
//const citiesApi = "http://api.travelpayouts.com/data/ru/cities.json";
//Прокси нужен для получения АПИ без ключей
const proxy = "https://cors-anywhere.herokuapp.com/";
const API_KEY = "00c5ec96127690840e6b6e1e79f64710";
const calendar = "http://min-prices.aviasales.ru/calendar_preload";
const MAX_COUNT = 10;

let cities = [];
const loadData = () => {
  formSearch.innerHTML = "hello world";
};
//Случай с fetch
const getData = (url, callback) => {
  try {
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(data => {
        return data;
      })
      //Колбек отдельная ф-ция что бы закинуть в начальный массив элементы
      .then(callback);
  } catch (error) {
    console.log(error);
    console.log(123);
  }
};

// const getData = (url, callback) => {
//   const request = new XMLHttpRequest();

//   request.open("GET", url);
//   //request.setRequestHeader("x-requested-with", "XMLHTTPREQUEST");
//   request.addEventListener("readystatechange", () => {
//     if (request.readyState !== 4) {
//       return;
//     }
//     //Правильный ответ,положительный
//     if (request.status === 200) {
//       callback(request.response);
//       console.log(request.response);
//     } else {
//       console.error(request.status);
//     }
//   });
//   request.send();
// };

const showCity = (input, dropdown) => {
  //Для обнуления городов при каждом поиске
  dropdown.textContent = "";
  dropdown.style.display = "block";

  //Если инпут не пустой то показывать дропдаун
  if (input.value == "") {
    return;
  }
  //Поиск города по буквам
  const filterCity = cities.filter((item, index) => {
    //Получение айтема с масиива наших городов
    item = item.name_translations.en;
    //Перевод в нижний регистр
    const fixItem = item.toLowerCase();
    //Метод includes() определяет, содержит ли массив определённый элемент
    //, возвращая в зависимости от этого true или false. Поиск по букве
    //StartsWith нужен для того что бы был поиск по первой букве
    return fixItem.startsWith(input.value.toLowerCase());
  });

  //Добавление в дропдаун меню
  filterCity.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add("dropdown__city");
    li.textContent = item.name_translations.en;
    dropdown.append(li);
  });
};

//Добавление в инпут наш город с инпута
const handlerCity = (input, dropdown, event) => {
  const target = event.target;
  if (target.tagName === "LI") {
    input.value = target.textContent;
    dropdown.textContent = "";
  }
};

//Дата в правильном формате
const getDate = date => {
  return new Date(date).toLocaleString("ua", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

//Формирование ссылки
const getLinkAvia = data => {
  let link = "https://www.aviasales.ru/search/";
  link += data.origin;
  const date = new Date(data.depart_date);
  const day = date.getDate();
  link += day < 10 ? "0" + day : day;
  const month = date.getMonth() + 1;
  link += month < 10 ? "0" + month : month;
  link += data.destination;
  link += "1";
  return link;
};
//Создание билета на странице
const createCard = data => {
  if (data) {
    const {
      value,
      gate,
      origin,
      destination,
      depart_date,
      number_of_changes
    } = data;
    let deep = "";
    deep = `
    <h3 class="agent">${gate}</h3>
<div class="ticket__wrapper">
  <div class="left-side">
    <a
      href='${getLinkAvia(data)}' 
     
      class="button button__buy"
      >Купить за ${value}₽</a
    >
  </div>
  <div class="right-side">
    <div class="block-left">
      <div class="city__from">
       Departure
        <span class="city__name">${inputCitiesFrom.value}</span>
      </div>
      <div class="date">${getDate(depart_date)}.</div>
    </div>

    <div class="block-right">
      <div class="changes"> ${
        number_of_changes === 0
          ? "No transfers"
          : number_of_changes + " transfers"
      }</div>
      <div class="city__to">
          Destination:
        <span class="city__name">${inputCitiesTo.value}</span>
      </div>
    </div>
  </div>
</div>`;

    const ticket = document.createElement("article");
    ticket.classList.add("ticket");
    ticket.insertAdjacentHTML("afterbegin", deep);
    return ticket;
  } else {
    deep = `<h3>We sorry, but we can't find tickets</h3>`;
  }
};

//Вывод Билета в ту же дату
const renderDayTickets = tickets => {
  ticketDayWrpapper.style.display = "block";
  //Очищение билетов для поиска новых
  ticketDayWrpapper.innerHTML =
    "<h2>Самый дешевый билет на выбранную дату</h2>";

  // Получение самого первого элемента в массиве
  const ticket = createCard(tickets[0]);
  ticketDayWrpapper.append(ticket);
};

//Вывод Всех остальных дат
const renderTickets = tickets => {
  ticketsWrapper.style.display = "block";
  //Очищение билетов для поиска новых
  ticketsWrapper.innerHTML = "<h2>Самые дешевые билеты на другие даты</h2>";

  //Сортировка по цене
  tickets.sort((a, b) => {
    if (a.value > b.value) {
      return 1;
    }
    if (a.value < b.value) {
      return -1;
    }
    // a должно быть равным b
    return 0;
  });
  //Перебираем весь массив и показываем только 10 фор нужен что бы закинуть индекс и было видно что показывать
  for (let i = 0; i < tickets.length && i < MAX_COUNT; i++) {
    const ticket = createCard(tickets[i]);
    ticketsWrapper.appendChild(ticket);
  }
};

//Рендер доступных авиабилетов
const renderCheap = (data, dateTime) => {
  const cheapTicket = data.best_prices;
  const cheapTicketDay = cheapTicket.filter(item => {
    //Получение билета по дате
    if (item.depart_date === dateTime) {
      return item;
    }
  });

  //Те билеты в которых дата совпадает
  renderDayTickets(cheapTicketDay);
  //Остальные билеты
  renderTickets(cheapTicket);
};

//Поле откуда
inputCitiesFrom.addEventListener("input", () => {
  showCity(inputCitiesFrom, dropdownCitiesFrom);
});
inputCitiesTo.addEventListener("input", () => {
  showCity(inputCitiesTo, dropdownCitiesTo);
});

//Куда
dropdownCitiesFrom.addEventListener("click", () => {
  handlerCity(inputCitiesFrom, dropdownCitiesFrom, event);
});
dropdownCitiesTo.addEventListener("click", () => {
  handlerCity(inputCitiesTo, dropdownCitiesTo, event);
});

//Работа с формой
formSearch.addEventListener("submit", event => {
  event.preventDefault();

  //Find находит один элемент и его возвращает после того как найдет элемент ищем код
  const cityFrom = cities.find(item => {
    return inputCitiesFrom.value === item.name_translations.en;
  });
  const cityTo = cities.find(item => {
    return inputCitiesTo.value === item.name_translations.en;
  });
  const formData = {
    from: cityFrom,
    to: cityTo,
    when: inputDateDepart.value
  };

  if (formData.from === undefined || formData.to === undefined) {
    alert("Write city correctly!");
    //Выход с функции - return
    return;
  }

  //Закрытие по клику не на дропдаун меню
  document.addEventListener("click", e => {
    const target = event.target;
    console.log(target);
    if (!target.classList.contains("dropdown__cities-from")) {
      dropdownCitiesFrom.style.display = "none";
    }
    if (!target.classList.contains("dropdown__cities-to")) {
      dropdownCitiesTo.style.display = "none";
    }
  });

  //Создание запроса на сервер API
  const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true`;
  console.log(requestData);
  getData(calendar + requestData, response => {
    renderCheap(response, formData.when);
  });
});
//Вызов функции получения городов API proxy + cities API
getData(citiesApi, data => {
  cities = data;
  //Cортировка городов по алфавиту
  cities.sort(function(a, b) {
    if (a.name_translations.en > b.name_translations.en) {
      return 1;
    }
    if (a.name_translations.en < b.name_translations.en) {
      return -1;
    }
    // a должно быть равным b
    return 0;
  });
});
