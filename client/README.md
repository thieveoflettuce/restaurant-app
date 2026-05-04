Preloader для React-сайта
Анимация написания логотипа «Прованс» как splash-экран. Прячется когда сайт загружен — но не раньше окончания анимации.

Файлы
Скопируйте эти файлы в ваш проект (например, в src/components/preloader/):

ProvansPreloader.jsx
Сам React-компонент. Управляет анимацией и fade-out.
strokes-array.js
Данные путей кисти (33 штриха). Подключается перед компонентом.
provans-cropped.png
Логотип без подписи «restaurant de la». Положите в public/ или импортируйте через bundler.
Шаг 1 — Подключение
Поскольку ProvansPreloader.jsx в текущем виде расчитан на загрузку через <script>-теги, в React-проекте с bundler'ом (Vite, CRA, Next) нужно слегка адаптировать. Вариант А (рекомендую) — переписать в ESM:

// src/components/ProvansPreloader.jsx
import { useEffect, useRef, useState } from 'react';
import { STROKE_PATHS } from './strokes'; // см. шаг 2
import logoUrl from './provans-cropped.png';

export default function ProvansPreloader({
  siteReady = false,
  onFinished,
  duration = 2800,
  minDisplay,
  fadeOut = 600,
  background = 'cream',
  tagline = 'restaurant de la',
  strokeWidth = 130,
}) {
  /* ... тело компонента из ProvansPreloader.jsx ... */
  /* замените src на logoUrl */
}
Шаг 2 — Подготовка путей
Файл strokes-array.js сейчас определяет глобальную const STROKE_PATHS. Для bundler'а конвертируйте в ESM-экспорт:

// src/components/strokes.js
export const STROKE_PATHS = [
  "M 971.4 252.7 L 965.7 ...",
  "M 1052.9 225.7 L 1050.0 ...",
  // ... остальные штрихи (всего 33)
];
Просто оберните содержимое strokes-array.js в export const STROKE_PATHS = [...] вместо const.

Шаг 3 — Использование в App
// src/App.jsx
import { useEffect, useState } from 'react';
import ProvansPreloader from './components/ProvansPreloader';

export default function App() {
  const [siteReady, setSiteReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (document.readyState === 'complete') {
      setSiteReady(true);
    } else {
      const onLoad = () => setSiteReady(true);
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  return (
    <>
      {!hidden && (
        <ProvansPreloader
          siteReady={siteReady}
          onFinished={() => setHidden(true)}
        />
      )}
      <YourSiteRoot />
    </>
  );
}
Почему так: компонент сам ждёт двух условий — окончание анимации и готовность сайта (siteReady=true). Только когда оба выполнены, начинается fade-out, и onFinished вызывается уже после полного исчезновения. Тогда вы безопасно размонтируете preloader через setHidden(true).
Шаг 4 — Дополнительные ресурсы (на случай долгой загрузки данных)
Событие window.load срабатывает когда загружены DOM, изображения и скрипты. Если вы дополнительно дожидаетесь данных (например, fetch к API), объедините оба условия:

const [domReady, setDomReady] = useState(false);
const [dataReady, setDataReady] = useState(false);
const siteReady = domReady && dataReady;

useEffect(() => {
  // 1) DOM + assets
  if (document.readyState === 'complete') setDomReady(true);
  else window.addEventListener('load', () => setDomReady(true), { once: true });

  // 2) ваши данные
  fetch('/api/menu').then(() => setDataReady(true));
}, []);
Props
Prop	Тип	По умолчанию	Описание
siteReady	boolean	false	Когда true и анимация закончилась — preloader делает fade-out.
onFinished	() ⇒ void	—	Вызывается после fade-out. Используйте для размонтирования.
duration	number (ms)	2800	Длительность написания.
minDisplay	number (ms)	duration + 400	Минимум сколько preloader виден (даже если сайт уже готов).
fadeOut	number (ms)	600	Длительность исчезновения.
background	'cream' | 'paper' | 'white' | 'ink'	'cream'	Цвет фона.
tagline	string | null	'restaurant de la'	Подпись под логотипом. null — без подписи.
strokeWidth	number	130	Толщина пера в единицах SVG (viewBox 3491×1187).
logoSrc	string (url)	—	Если передан, используется вместо встроенного.







Как использовать в React
Скачайте strokes-array.js и положите рядом с компонентом
В index.html подключите его перед React-бандлом, ИЛИ конвертируйте в ESM (export const STROKE_PATHS = [...])
Передайте ваши настройки как props в <ProvansPreloader>:
<ProvansPreloader
  siteReady={siteReady}
  onFinished={() => setHidden(true)}
  duration={2800}
  strokeWidth={130}
  background="cream"
  tagline="restaurant de la"
/>ЛРЬ