const widgetsContainer = document.getElementById('widgetsContainer');

const OPENWEATHER_API_KEY = 'd730abe3b5253c1a402f5b182ccec98a'; // вставьте свой API ключ

let widgetCounter = 0;

// функции для каждого типа виджета
function fetchWeather(widget) {
  const content = widget.querySelector('.widget-content');
  let input = widget.querySelector('.city-input');
  if (!input) {
    input = document.createElement('input');
    input.type='text';
    input.placeholder='Введите город';
    input.className='city-input';

    const btn = document.createElement('button');
    btn.textContent='Загрузить погоду';

    btn.onclick=()=>getWeatherData(input.value, content);
    widget.appendChild(input);
    widget.appendChild(btn);
  } else {
    getWeatherData(input.value, content);
  }
}

async function getWeatherData(city, content) {
  if (!city) {
    content.innerHTML='Пожалуйста, введите город.';
    return;
  }
  content.innerHTML='Загрузка...';
  try {
    const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=ru&appid=${OPENWEATHER_API_KEY}`);
    if (!response.ok) throw new Error('Ошибка загрузки');
    const data=await response.json();
    if (data.cod!==200) throw new Error(data.message);
    content.innerHTML=`
      <div>Город: ${data.name}</div>
      <div>Температура: ${data.main.temp}°C</div>
      <div>Описание: ${data.weather[0].description}</div>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
    `;
  } catch(e) {
    content.innerHTML='Ошибка: '+ e.message;
  }
}

function fetchCurrency(widget) {
  const content=widget.querySelector('.widget-content');
  let input=widget.querySelector('.currency-input');
  if (!input) {
    input=document.createElement('input');
    input.type='text';
    input.placeholder='Например, USD/EUR';
    input.className='currency-input';

    const btn=document.createElement('button');
    btn.textContent='Обновить курс';

    btn.onclick=()=>getCurrencyRate(input.value, content);
    widget.appendChild(input);
    widget.appendChild(btn);
  } else {
    getCurrencyRate(input.value, content);
  }
}

async function getCurrencyRate(pair, content) {
  if (!pair || !pair.includes('/')) {
    content.innerHTML='Введите корректную пару, например USD/EUR';
    return;
  }
  const [from, to]=pair.split('/').map(s=>s.trim().toUpperCase());
  content.innerHTML='Загрузка...';
  try {
    const response=await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    if (!response.ok) throw new Error('Ошибка загрузки');
    const data=await response.json();
    const rate=data.rates[to];
    if (!rate) throw new Error('Несуществующая валютная пара');
    content.innerHTML=`Курс ${from} → ${to}: 1 ${from} = ${rate} ${to}`;
  } catch(e) {
    content.innerHTML='Ошибка: '+ e.message;
  }
}

function fetchFact(widget) {
  const content=widget.querySelector('.widget-content');
  content.innerHTML='Загрузка...';
  fetch('https://uselessfacts.jsph.pl/random.json?language=ru')
    .then(res=>res.json())
    .then(data=>{
      content.innerHTML=`<div>${data.text}</div>`;
    })
    .catch(()=> {
      content.innerHTML='Не удалось загрузить факт.';
    });
}

function initTimer(widget) {
  const content=widget.querySelector('.widget-content');
  let input=widget.querySelector('.timer-input');
  if (!input) {
    input=document.createElement('input');
    input.type='number';
    input.placeholder='Время (сек)';
    input.className='timer-input';

    const btn=document.createElement('button');
    btn.textContent='Запустить';

    btn.onclick=()=>startTimer(parseInt(input.value), content);
    widget.appendChild(input);
    widget.appendChild(btn);
  }
}

function startTimer(seconds, content) {
  let remaining=seconds;
  if (isNaN(remaining) || remaining<=0) {
    content.innerHTML='Введите корректное число секунд.';
    return;
  }
  content.innerHTML=`Старт: ${remaining} сек`;
  const id=setInterval(()=>{
    remaining--;
    if (remaining<=0) {
      clearInterval(id);
      content.innerHTML='Таймер завершен!';
    } else {
      content.innerHTML=`Осталось: ${remaining} сек`;
    }
  },1000);
}

function initNotes(widget) {
  const content=widget.querySelector('.widget-content');
  let textarea=widget.querySelector('.notes-textarea');
  if (!textarea) {
    textarea=document.createElement('textarea');
    textarea.className='notes-textarea';
    textarea.rows=5;
    textarea.placeholder='Здесь ваши заметки';

    const saveKey=`notes_${widget.dataset.id}`;
    const saved=localStorage.getItem(saveKey);
    if (saved) textarea.value=saved;

    textarea.oninput = ()=> {
      localStorage.setItem(saveKey, textarea.value);
    };
    content.appendChild(textarea);
  }
}

// Функция для добавления нового виджета
function addWidget(type) {
  widgetCounter++;
  const widgetID='widget'+widgetCounter;
  const widget=document.createElement('div');
  widget.className='widget';
  widget.dataset.type=type;
  widget.dataset.id=widgetID;

  // Заголовок
  const header=document.createElement('div');
  header.className='widget-header';

  const title=document.createElement('div');
  title.className='widget-title';
  title.textContent= {
    weather: 'Погода',
    currency: 'Курс валют',
    fact: 'Факт',
    timer: 'Таймер',
    notes: 'Заметки'
  }[type] || 'Виджет';

  const deleteBtn=document.createElement('button');
  deleteBtn.className='delete-btn';
  deleteBtn.innerHTML='&times;';
  deleteBtn.title='Удалить виджет';
  deleteBtn.onclick=()=> {
    widget.remove();
    saveWidgets();
  };

  header.appendChild(title);
  header.appendChild(deleteBtn);
  widget.appendChild(header);

  // Контент
  const contentDiv=document.createElement('div');
  contentDiv.className='widget-content';
  widget.appendChild(contentDiv);

  // Инициализация по типу
  switch(type) {
    case 'weather':
      fetchWeather(widget);
      break;
    case 'currency':
      fetchCurrency(widget);
      break;
    case 'fact':
      fetchFact(widget);
      break;
    case 'timer':
      initTimer(widget);
      break;
    case 'notes':
      initNotes(widget);
      break;
  }

  // добавляем
  widgetsContainer.appendChild(widget);
  saveWidgets();
}

function saveWidgets() {
  const list=[];
  for (const widget of widgetsContainer.children) {
    list.push({
      type: widget.dataset.type,
      id: widget.dataset.id,
    });
  }
  localStorage.setItem('widgetConfig', JSON.stringify(list));
}

function loadWidgets() {
  const data=localStorage.getItem('widgetConfig');
  if (data) {
    try {
      const list=JSON.parse(data);
      list.forEach(w=>addWidget(w.type));
    } catch(e) {
      console.error('Ошибка загрузки конфигурации');
    }
  }
}

// ------------- Экспорт и импорт конфигурации ---------------

// Экспортировать конфигурацию
document.getElementById('exportConfig').onclick = () => {
  const dataStr = JSON.stringify(widgets, null, 2);
  const blob = new Blob([dataStr], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dashboard-config.json';
  a.click();
  URL.revokeObjectURL(url);
};

// Импортировать конфигурацию
const importFileInput = document.getElementById('importFile');

document.getElementById('importConfig').onclick = () => {
  importFileInput.click();
};

importFileInput.onchange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const newWidgets = JSON.parse(e.target.result);
      // Очистим текущие виджеты
      widgets = newWidgets;
      saveWidgets();
      loadWidgets();
    } catch(err) {
      alert('Ошибка при импорте файла: ' + err.message);
    }
  };
  reader.readAsText(file);
};

// -------------------------------------------------------------

// обработчики кнопок
document.getElementById('addWeather').onclick=()=>addWidget('weather');
document.getElementById('addCurrency').onclick=()=>addWidget('currency');
document.getElementById('addFact').onclick=()=>addWidget('fact');
document.getElementById('addTimer').onclick=()=>addWidget('timer');
document.getElementById('addNotes').onclick=()=>addWidget('notes');

// Инициализация
loadWidgets();