/* import axios from 'axios';
Імпорт бібліотеки Axios для виконання HTTP-запитів.
Якщо розкоментувати, перестає працювати скрипт! Тому я підключив в index.html.
 */


// Клас для обробки даних API Національного банку України
// https://bank.gov.ua/ua/open-data/api-dev
// https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json
class ExchangeRate {
  constructor(data) {
    // Ініціалізація об'єкта з даними про валюту
    this.currencyNumericCode = data.r030;  // числовий код валюти (ISO 4217)
    this.currencyNameUkr = data.txt;       // назва валюти українською мовою
    this.exchangeRate = data.rate;         // офіційний курс НБУ на вказану дату
    this.currencyAlphaCode = data.cc;      // літерний код валюти (ISO 4217)
    this.exchangeDate = data.exchangedate; // дата обміну у форматі DD.MM.YYYY
  }

  // Метод для форматування відображення курсу валюти або облікової ціни металу
  display() {
    const preciousMetalCodes = [959, 961, 962, 964]; // коди банківських металів
    // 959 (XAU - золото), 961 (XAG - срібло), 962 (XPT - платина), 964 (XPD - паладій)
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
    // https://tc39.es/ecma262/#sec-array.prototype.includes
    if (preciousMetalCodes.includes(this.currencyNumericCode)) {
      // Форматування для дорогоцінних металів (1 тройська унція ≈ 31,1034768 г)
      return `${this.currencyNameUkr} ${this.currencyAlphaCode}, 1 тр.у.:
      ${this.exchangeRate.toFixed(2)} ₴`;
    } else {
      // Форматування для звичайних валют
      return `${this.currencyNameUkr} ${this.currencyAlphaCode}:
      ${this.exchangeRate.toFixed(3)} ₴`;
    }
  }
}


// Клас для обробки даних NASA APOD (Astronomy Picture of the Day)
// https://api.nasa.gov/
// https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY
class ApodData {
  constructor(data) {
    // Ініціалізація об'єкта з даними про зображення дня
    this.imageCopyright = data.copyright;      // автор зображення або відео
    this.publicationDate = data.date;  // дата публікації у форматі YYYY-MM-DD
    this.imageDescription = data.explanation;  // короткий астрономічний опис
    this.highResImageUrl = data.hdurl;         // посилання на зображення у
    // високій роздільній здатності (якщо доступне)
    this.mediaFormat = data.media_type;     // тип медіа: image або video
    this.apiVersion = data.service_version; // версія API (на даний час – v1)
    this.imageTitle = data.title;           // заголовок зображення або відео
    this.previewUrl = data.url;          // основне посилання, яке слід показати
  }
}


// Стилізоване оповіщення
function showCustomAlert(alertMessage) {
  // Створює та відображає тимчасове сповіщення на сторінці
  const alertDiv = document.createElement('div');  // створення елемента <div>
  alertDiv.className = 'alert';         // призначення CSS-класу для стилізації
  alertDiv.textContent = alertMessage;  // запис тексту повідомлення
  document.body.appendChild(alertDiv);  // додавання елемента до тіла документа
  // Автоматичне видалення сповіщення через 5 секунд
  setTimeout(() => alertDiv.remove(), 5000);
  // https://uk.javascript.info/settimeout-setinterval
}


// Перевірка коректності дати у форматі, прийнятим для запитів до API НБУ
function isValidDate(dateString) {
  // Синтаксична перевірка: 8 цифр без роздільників
  // https://uk.javascript.info/regular-expressions
  const regex = /^\d{4}\d{2}\d{2}$/;
  // ^ — початок рядка
  // \d{4} — чотири цифри для року (YYYY)
  // \d{2} — дві цифри для місяця (MM)
  // \d{2} — дві цифри для дня (DD)
  // $ — кінець рядка
  if (!regex.test(dateString)) return false;  // якщо формат не відповідає

  // Розбиття рядку дати (YYYYMMDD) на рік, місяць і день
  const year = parseInt(dateString.slice(0, 4));
  const month = parseInt(dateString.slice(4, 6)) - 1;  // JS-місяці від 0 до 11
  const day = parseInt(dateString.slice(6, 8));
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt

  // Створення об'єкта Date для подальшої логічної перевірки
  const date = new Date(year, month, day);

  // Логічна перевірка: чи відповідає об'єкт Date введеним значенням
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return false;  // наприклад, "20250230" створить некоректну дату
  }

  // Перевірка допустимого діапазону:
  // - нижня межа: 2 вересня 1996 (дата введення гривні)
  // - верхня межа: завтрашній день (НБУ встановлює курс на завтра після 15:30)
  const hryvniaIntroDate = new Date(1996, 8, 2);  // 02.09.1996
  const tomorrow = new Date();                    // створюємо сьогоднішній день
  tomorrow.setDate(tomorrow.getDate() + 1);       // і наступний день
  tomorrow.setHours(0, 0, 0, 0); // скидає час до 00:00:00 для порівняння лише дат

  return date >= hryvniaIntroDate && date <= tomorrow;
}


// Генерація випадкового User-Agent для HTTP-запитів
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent
// https://datatracker.ietf.org/doc/html/rfc7231#section-5.5.3
function getRandomUserAgent() {
  // Масив User-Agent для популярних браузерів (Firefox, Chrome, Edge, Opera)
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 OPR/126.0.0.0',
  ];
  // Вибір одного випадкового елемента з масиву
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}


// Асинхронне отримання курсів валют та облікових цін на метали з API НБУ
// https://uk.javascript.info/async-await
async function fetchExchangeRates(date = null) {
  try {
    // Перевірка, чи задана дата, і чи вона валідна (формат YYYYMMDD,
    // логічна коректність, допустимий діапазон)
    if (date && !isValidDate(date)) {
      throw new Error('Некоректна дата!');
    }

    // Формування URL для запиту до API НБУ
    // Офіційна документація API НБУ: https://bank.gov.ua/ua/open-data/api-dev
    const url = date
      ? `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${date}&json`
      : 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
    // const url = date ? Курс на поточну дату :
    // Курс на дату, дата задається у форматі: yyyymmdd

    // Ініціалізація контролера для можливості переривання запиту (таймаут)
    // https://uk.javascript.info/fetch-abort
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);  // 10 с
    // https://developer.mozilla.org/en-US/docs/Web/API/AbortController

    // Виконання HTTP-запиту через fetch з індивідуальним User-Agent
    // https://uk.javascript.info/fetch
    const response = await fetch(url, {
      method: 'GET',
      headers: {'User-Agent': getRandomUserAgent()},
      signal: controller.signal,
    });
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

    clearTimeout(timeoutId); // скасовує таймер після успішного виконання запиту

    // Перевірка статусу відповіді HTTP
    if (!response.ok) {
      throw new Error(`HTTP помилка: ${response.status}`);
    }

    // Парсинг JSON-вмісту відповіді
    const exchange = await response.json();
    // https://developer.mozilla.org/en-US/docs/Web/API/Response/json

    // Перевірка на наявність даних
    if (!exchange || exchange.length === 0) {
      throw new Error('Дані за вибрану дату відсутні або ' +
        'API не підтримує цю дату!');
    }

    // Логування для запитів після 15:30
    const now = new Date();
    const isAfter1530 = now.getHours() >= 15 && now.getMinutes() >= 30;
    if (isAfter1530 && !date) {
      console.log('Запит після 15:30: курси НБУ для завтрашнього дня!');
    }
    /*
    https://bank.gov.ua/ua/open-data/api-dev
    Примітка: Поточного дня буде відображатися офіційний курс гривні до
    іноземних валют, встановлений НА ЗАВТРА за схемою:
    1. До 15:30* – відображається лише офіційний курс гривні до іноземних валют,
     що встановлюється 1 раз на місяць.
    2. Після 15:30* - офіційний курс, зазначений у п.1, та офіційний курс гривні
     до іноземних валют, що встановлюється щодня.
    пункт 4 Порядку встановлення офіційного курсу гривні до іноземних валют
    та розрахунку довідкового значення курсу гривні до долара США й облікової
    ціни банківських металів та їх оприлюднення від 01.03.2021 № 79-рш
    (зі змінами, внесеними рішенням Правління НБУ від 31.12.2021 № 659-рш).
    */

    // Фільтрація: залишаємо лише обрані валюти та дорогоцінні метали
    const currencies = ['EUR', 'USD', 'GBP', 'SAR', 'AED', 'RON', 'RSD', 'NOK'];
    const metals = ['XAU', 'XAG', 'XPT', 'XPD'];
    const rates = exchange
      .filter(item => currencies.includes(item.cc) || metals.includes(item.cc))
      .map(item => new ExchangeRate(item));
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map

    // Перевірка: чи є дані для обраних валют/металів
    if (rates.length === 0) {
      throw new Error('Дані для вибраних валют або металів не знайдено!');
    }

    // Відображення результатів на сторінці
    const ratesContainer = document.getElementById('exchange-rates');
    ratesContainer.innerHTML = rates.map(rate => `<div class="rate-card">
        ${rate.display()}</div>`).join('');
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
    // https://uk.javascript.info/modifying-document#innerhtml

    // Відображення дати, на яку отримано курси
    const selectedDate = document.getElementById('selected-date');
    // selectedDate.textContent = formatDate(date);
    // Закоментована функція formatDate(date) не написана в поточній версії
    selectedDate.textContent = exchange.length > 0 ?
      exchange[0].exchangedate : 'сьогодні';

  } catch (error) {
    // Обробка винятків і формування повідомлення для користувача
    let errorMessage = 'Помилка під час отримання даних від НБУ!';
    if (error.name === 'AbortError') {
      errorMessage = 'Запит перервано через таймаут. Спробуйте ще раз.';
    } else if (error.message.includes('Помилка API')) {
      errorMessage = error.message;
      if (error.message.includes('429')) {
        errorMessage = 'Перевищено ліміт запитів до API НБУ. ' +
          'Спробуйте пізніше.';
      }
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Немає відповіді від сервера. Перевірте підключення ' +
        'до мережі.';
    } else {
      errorMessage = `Помилка: ${error.message}`;
    }
    // Виведення повідомлення через стилізоване сповіщення
    showCustomAlert(errorMessage);
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
    // https://uk.javascript.info/try-catch
  }
}


// Асинхронне отримання зображення дня (APOD) з API NASA
async function fetchApodData() {
  // Конфігурація HTTP-запиту через Axios
  // https://axios-http.com/uk/docs/req_config
  const config = {
    method: 'get',
    url: 'https://api.nasa.gov/planetary/apod',
    params: {api_key: 'Ak2V0TLzdfBTa732BcUQYIzNwSEvHaxpjKEDOTF6'},
    // You can start using this key to make web service requests by
    // referring to the relevant agency's API documentation.
    // This API key is for your use and should not be shared.
    timeout: 5000,  // максимальний час очікування відповіді (мс)
    headers: {
      'Accept': 'application/json',        // очікується JSON-відповідь
      'User-Agent': getRandomUserAgent(),  // емуляція браузерного запиту
    },
    validateStatus: function (status) {
      return status >= 200 && status < 300;
    },  // вважає успішними лише HTTP-статуси 2xx
    // https://axios-http.com/uk/docs/res_schema
  };

  try {
    const response = await axios(config); // надсилає GET-запит до API NASA
    // https://uk.javascript.info/network
    // https://axios-http.com/uk/docs/intro
    const data = response.data;
    // Перевірка наявності ключових полів у відповіді
    if (!data || !data.url || !data.hdurl) {
      throw new Error('Некоректні дані від NASA API!');
    }

    // Створення об'єкта ApodData для зручного доступу до властивостей
    const apod = new ApodData(data);

    // Встановлення фонового зображення, якщо медіа — зображення
    if (apod.mediaFormat === 'image') {
      // https://uk.javascript.info/styles-and-classes
      document.body.style.backgroundImage = `url(${apod.previewUrl})`;
      // https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
    } else if (apod.mediaFormat === 'video') {
      showCustomAlert('Зображення дня є відео, фон не встановлено!');
      document.body.style.backgroundImage = 'none';
    } else {
      showCustomAlert(`Непідтримуваний формат медіа: ${apod.mediaFormat}.`);
      document.body.style.backgroundImage = 'none';
    }

    // Відображення метаданих: заголовок, автор, опис
    document.getElementById('apod-title').textContent = apod.imageTitle;
    document.getElementById('apod-copyright').textContent =
      `Автор: ${apod.imageCopyright || 'Невідомий автор'}`;
    document.getElementById('apod-explanation').textContent =
      apod.imageDescription;

    // Обробка завантаження зображення після натискання кнопки
    // https://uk.javascript.info/introduction-browser-events#dodavannya-obrobnika-z-addlistener
    document.getElementById('download-apod-btn')  // відкриває, а не завантажує
      .addEventListener('click', () => {
        if (apod.mediaFormat === 'image') {
          const link = document.createElement('a'); // створення тимчасового <a>
          link.href = apod.highResImageUrl || apod.previewUrl;  // вибір URL
          link.target = '_blank';  // відкриття в новій вкладці
          link.download =
            `Зображення дня ${new Date().toISOString().split('T')[0]}.jpg`;
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
          // https://uk.javascript.info/date#metodi
          document.body.appendChild(link);
          link.click();  // запуск завантаження
          document.body.removeChild(link);  // очищення DOM
          // https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
        } else {
          showCustomAlert('Завантаження неможливе: медіа є відео.')
        }
      }, {once: true});  // подія спрацьовує один раз, не багаторазово!
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener

  } catch (error) {
    // Обробка винятків, пов’язаних із запитом
    let errorMessage = 'Помилка під час отримання зображення від NASA';

    if (error.response) {
      // Сервер відповів з кодом помилки (4xx, 5xx)
      errorMessage = `Помилка API: ${error.response.status} -
      ${error.response.data.message || error.message}`;
      if (error.response.status === 429) {
        errorMessage = 'Перевищено ліміт запитів до NASA API. ' +
          'Спробуйте пізніше.';
      }
    } else if (error.request) {
      // Запит було надіслано, але відповіді не отримано
      errorMessage = 'Немає відповіді від сервера. Перевірте підключення ' +
        'до мережі.';
    } else {
      // Інші помилки (наприклад, помилка конфігурації)
      errorMessage = `Помилка: ${error.message}`;
    }
    // Виведення повідомлення про помилку через стилізоване сповіщення
    showCustomAlert(errorMessage);
    // https://axios-http.com/docs/handling_errors
  }
}


// Ініціалізація обробників подій для інтерактивних елементів інтерфейсу
function setupEventListeners() {
  // Обробка вибору дати у <input type="date">:
  // – перетворює формат YYYY-MM-DD → YYYYMMDD;
  // – викликає запит до API НБУ з обраною датою;
  document.getElementById('date-picker')
    .addEventListener('change', (event) => {
      const selectedDate = event.target.value.replace(/-/g, '');
      // Регулярний вираз /-/g означає:
      // /-/ — шукає символ дефіса;
      // g — глобальний прапорець, тобто замінити всі входження, а не лише перше
      fetchExchangeRates(selectedDate);
    });
  // https://uk.javascript.info/introduction-browser-events

  // Обробка згортання/розгортання контейнера:
  // – перемикає видимість блоку з класом .container;
  // - змінює текст кнопки відповідно до стану;
  document.getElementById('toggle-container-btn')
    .addEventListener('click', () => {
      const container = document.querySelector('.container');
      const btn = document.getElementById('toggle-container-btn');
      if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.textContent = 'Згорнути';
      } else {
        container.style.display = 'none';
        btn.textContent = 'Розгорнути';
      }
    });

  // Обробка кнопки відтворення аудіо:
  // – відтворює фоновий аудіофайл;
  // – у разі помилки показує стилізоване сповіщення;
  document.getElementById('play-audio-btn')
    .addEventListener('click', () => {
      const audio = document.getElementById('background-audio');
      // https://uk.javascript.info/promise-basics
      audio.play().catch(error => {
        showCustomAlert(`Помилка відтворення аудіо: ${error.message}`);
      });
    });

  // Обробка помилки завантаження аудіофайлу:
  // – виводить повідомлення, якщо файл недоступний або пошкоджений
  document.getElementById('background-audio')
    .addEventListener('error', () => {
      showCustomAlert('Помилка завантаження аудіофайлу. Спробуйте ще раз.');
    });

  // Обробка кнопки показу/приховання опису APOD:
  // – перемикає видимість блоку з поясненням зображення дня
  document.getElementById('apod-explanation-btn')
    .addEventListener('click', () => {
      const descriptionDiv = document.getElementById('apod-explanation');
      descriptionDiv.style.display =
        descriptionDiv.style.display === 'block' ? 'none' : 'block';
    });
}


// Ініціалізація логіки після повного завантаження DOM:
// https://uk.javascript.info/onload-ondomcontentloaded
document.addEventListener('DOMContentLoaded', () => {
  fetchApodData();         // Запит до NASA APOD API
  fetchExchangeRates();    // Запит до API НБУ (поточна дата)
  setupEventListeners();   // Активація всіх обробників подій
});
