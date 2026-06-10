import { pluginCompatibility } from './compat'
import type { FeatureBlock } from './types'

export const featureBlocks: FeatureBlock[] = [
  {
    order: 1,
    slug: 'dwg-import',
    name: {
      en: 'DWG survey → Topo Mesh',
      ru: 'Импорт DWG → Topo Mesh',
    },
    tagline: {
      en: 'Turn DWG spot elevations into a ready topo Mesh in Archicad.',
      ru: 'Превращает отметки высот из DWG в готовый топографический Mesh.',
    },
    whatItDoes: {
      en: [
        'Imports DWG with contour arcs, polylines, and elevation text',
        'Matches geometry to height marks with configurable search radius',
        'Triangulates and creates a Mesh on the chosen story and layer',
        'Supports dot and comma decimals (14.200 / 14,200)',
        'Feeds ShellSet, ground landing, and other mesh-based tools',
      ],
      ru: [
        'Импорт DWG с дугами, полилиниями и текстовыми отметками',
        'Сопоставление точек с отметками (настраиваемый радиус поиска)',
        'Триангуляция и создание Mesh на выбранном этаже и слое',
        'Форматы отметок: 14.200 и 14,200',
        'Опора для ShellSet, приземления объектов и других mesh-инструментов',
      ],
    },
    solutions: ['dwg-mesh'],
    compatibility: pluginCompatibility,
    videos: [
      {
        src: '/media/dwg-mesh/preview.mp4',
        caption: {
          en: 'DWG spot elevations → topo Mesh in Archicad',
          ru: 'Отметки из DWG → топографический Mesh в Archicad',
        },
      },
    ],
  },
  {
    order: 2,
    slug: 'mesh-from-line',
    name: {
      en: 'Mesh from line',
      ru: 'Mesh из линии',
    },
    tagline: {
      en: 'Create a Mesh element from a base line, optionally draped on existing terrain.',
      ru: 'Создаёт Mesh из базовой линии с опциональной привязкой к рельефу.',
    },
    whatItDoes: {
      en: [
        'Works with spline, polyline, arc, or line as the base path',
        'Set width, step, and Z offset for the mesh strip',
        'Optionally sample heights from an existing topo Mesh',
        'Ideal for terraces, platforms, and local terrain edits',
      ],
      ru: [
        'Сплайн, полилиния, дуга или линия как базовая трасса',
        'Ширина, шаг и offset по Z',
        'Опционально — высоты с существующего Mesh рельефа',
        'Террасы, площадки и локальные изменения рельефа',
      ],
    },
    solutions: ['landscape-helper'],
    compatibility: pluginCompatibility,
    videos: [
      {
        src: '/media/mesh-from-line/preview.mp4',
        caption: {
          en: 'Create a Mesh strip from a base line, optionally draped on terrain',
          ru: 'Mesh из базовой линии с опциональной привязкой к рельефу',
        },
      },
    ],
  },
  {
    order: 3,
    slug: 'gdl-to-mesh',
    name: {
      en: 'Mesh from GDL object (by faces)',
      ru: 'Mesh из GDL-объекта (по граням)',
    },
    tagline: {
      en: 'Build separate Mesh elements from suitable faces of a placed GDL object.',
      ru: 'Строит отдельные Mesh по подходящим граням размещённого GDL-объекта.',
    },
    whatItDoes: {
      en: [
        'Reads a library Object 3D body face by face',
        'Creates Mesh per suitable face; contour projected to plan',
        'Skips steep faces — configurable max slope (default 30°)',
        'Target layer override or inherit from source object',
      ],
      ru: [
        'Анализ 3D-тела библиотечного объекта',
        'Отдельный Mesh на грань; контур — проекция на план',
        'Пропуск крутых граней (макс. наклон, по умолчанию 30°)',
        'Слой Mesh или «как у объекта»',
      ],
    },
    solutions: ['gdl-to-mesh'],
    compatibility: pluginCompatibility,
    mediaPlaceholder: {
      en: 'Content coming soon',
      ru: 'Контент будет позже',
    },
  },
  {
    order: 4,
    slug: 'parametric-dimensioning',
    name: {
      en: 'Parametric Dimensioning via Point Export (GH → Archicad)',
      ru: 'Параметрическое образмеривание через экспорт точек (GH → Archicad)',
    },
    tagline: {
      en: 'Bridge between Grasshopper and Archicad for automated dimensioning.',
      ru: 'Мост между Grasshopper и Archicad для автоматической простановки размеров.',
    },
    whatItDoes: {
      en: [
        'Grasshopper computes parametric point sets — along curves with a fixed step, from ordered 3D sequences, or anchor-to-target references',
        'Point data sent via lightweight JSON to a companion Archicad add-on',
        'Archicad add-on generates native dimension chains',
        'Update the GH definition — all connected dimensions regenerate',
        'Free; Archicad 27–29',
      ],
      ru: [
        'Grasshopper считает параметрические наборы точек — вдоль кривых с шагом, из упорядоченных 3D-последовательностей или от опорных к целевым',
        'Передача точек по JSON в add-on Archicad',
        'Построение нативных размерных цепочек в Archicad',
        'Обновил GH-определение — связанные размеры перестраиваются',
        'Бесплатно; Archicad 27–29',
      ],
    },
    solutions: ['gh-dimensioning'],
    compatibility: pluginCompatibility,
    images: [
      {
        src: '/media/gh-dimensioning/3.png',
        alt: {
          en: 'Grasshopper point export for parametric dimensioning',
          ru: 'Экспорт точек из Grasshopper для параметрического образмеривания',
        },
      },
      {
        src: '/media/gh-dimensioning/22.png',
        alt: {
          en: 'Dimension chains generated in Archicad from GH data',
          ru: 'Размерные цепочки в Archicad по данным из GH',
        },
      },
    ],
    download: {
      url: 'https://www.food4rhino.com/en/app/parametric-dimensioning-point-export-gh-archicad',
      label: {
        en: 'Download on Food4Rhino',
        ru: 'Скачать на Food4Rhino',
      },
    },
  },
  {
    order: 5,
    slug: 'shell',
    name: {
      en: 'Shell / Spline XZ',
      ru: 'Shell / Spline XZ',
    },
    tagline: {
      en: 'XZ profile splines and Shell elements along a path on topo Mesh.',
      ru: 'Spline-профили XZ и оболочки Shell по трассе на топографическом Mesh.',
    },
    whatItDoes: {
      en: [
        'XZ profile spline sampled from a reference topo Mesh',
        'Extruded Shell along path chord with terrain heights',
        'Ruled Shell between two guide rails',
        'Requires a reference Mesh (often from DWG-mesh)',
      ],
      ru: [
        'Spline XZ с сэмплированием по опорному Mesh',
        'Shell по трассе с высотами с топосъёмки',
        'Ruled Shell между двумя направляющими',
        'Нужен опорный Mesh (часто из DWG-mesh)',
      ],
    },
    solutions: ['shellset'],
    compatibility: pluginCompatibility,
    videos: [
      {
        src: '/media/shellset/preview.mp4',
        caption: {
          en: 'XZ profile splines and Shell along a path on topo Mesh',
          ru: 'Spline XZ и Shell по трассе на топографическом Mesh',
        },
      },
    ],
  },
  {
    order: 6,
    slug: 'selection-table',
    name: {
      en: 'Selection table',
      ru: 'Таблица выделения',
    },
    tagline: {
      en: 'Group selection by type, ID, and layer — filter and re-select in one click.',
      ru: 'Группировка выделения по типу, ID и слою — фильтр и повторное выделение.',
    },
    whatItDoes: {
      en: [
        'Live-updating table when selection changes',
        'Type, ID, layer, and count per group',
        'Checkbox filter and apply-selection to checked groups',
        'Choose which columns and parameters to show in the table',
        'Export the table to Excel (.xlsx)',
        'Available in TableSet palette and LandscapeHelper',
      ],
      ru: [
        'Таблица обновляется при изменении выделения',
        'Тип, ID, слой и количество в группе',
        'Фильтр чекбоксами и выделение отмеченных групп',
        'Выбор нужных столбцов и параметров для отображения',
        'Экспорт таблицы в Excel (.xlsx)',
        'В TableSet — отдельная палитра; в LandscapeHelper — часть основной',
      ],
    },
    solutions: ['tableset', 'landscape-helper'],
    compatibility: pluginCompatibility,
    videos: [
      {
        src: '/media/tableset/preview.mp4',
        caption: {
          en: 'Selection table — group, filter, and re-select by type, ID, and layer',
          ru: 'Таблица выделения — группировка, фильтр и повторное выделение',
        },
      },
    ],
  },
  {
    order: 7,
    slug: 'distribution',
    name: {
      en: 'Distribution along a curve',
      ru: 'Распределение объектов вдоль кривой',
    },
    tagline: {
      en: 'Copy objects along a path by step or count with auto-orientation.',
      ru: 'Копии объекта вдоль линии — с шагом или количеством.',
    },
    whatItDoes: {
      en: [
        'Distribution path: line, arc, or spline',
        'Step mode (fixed interval in mm) or count mode (N copies)',
        'Auto-orientation along curve tangent',
        'Multiple paths in one run',
      ],
      ru: [
        'Линия распределения: line, arc, spline',
        'Режим шага (мм) или количества (N копий на длину)',
        'Автоориентация по направлению кривой',
        'Несколько трасс за одну операцию',
      ],
    },
    solutions: ['landscape-helper'],
    compatibility: pluginCompatibility,
    videos: [
      {
        src: '/media/Distribution/Distribute-along-curve/preview.mp4',
        caption: {
          en: 'Distribute copies along a path with fixed step',
          ru: 'Распределение копий вдоль трассы с заданным шагом',
        },
      },
      {
        src: '/media/Distribution/Distribute-by-count/preview.mp4',
        caption: {
          en: 'Distribute a fixed number of copies along a path',
          ru: 'Распределение заданного количества копий вдоль трассы',
        },
      },
    ],
  },
  {
    order: 8,
    slug: 'orientation',
    name: {
      en: 'Object orientation',
      ru: 'Ориентация объектов',
    },
    tagline: {
      en: 'Rotate, align to X, random angle, or orient toward a point.',
      ru: 'Поворот, выравнивание по X, случайный угол, разворот к точке.',
    },
    whatItDoes: {
      en: [
        'Fixed angle in degrees',
        'Align all elements to global X (0°)',
        'Random 0–360° for natural planting',
        'Orient selection toward a picked point on plan',
      ],
      ru: [
        'Заданный угол (°)',
        'Выравнивание на 0° к оси X',
        'Случайный 0–360° для естественных посадок',
        'Разворот всех элементов к выбранной точке',
      ],
    },
    solutions: ['landscape-helper'],
    compatibility: pluginCompatibility,
    videos: [
      {
        src: '/media/Orientation/Rotate-by-angle/preview.mp4',
        caption: {
          en: 'Rotate selection by a fixed angle',
          ru: 'Поворот выделения на заданный угол',
        },
      },
      {
        src: '/media/Orientation/Align-to-X-axis/preview.mp4',
        caption: {
          en: 'Align all elements to global X (0°)',
          ru: 'Выравнивание элементов по оси X (0°)',
        },
      },
      {
        src: '/media/Orientation/Random-orientation/preview.mp4',
        caption: {
          en: 'Random orientation 0–360° for natural planting',
          ru: 'Случайная ориентация 0–360° для естественных посадок',
        },
      },
      {
        src: '/media/Orientation/Orient-to-point/preview.mp4',
        caption: {
          en: 'Orient selection toward a picked point',
          ru: 'Разворот элементов к выбранной точке',
        },
      },
    ],
  },
  {
    order: 9,
    slug: 'ground',
    name: {
      en: 'Ground landing',
      ru: 'Приземление на рельеф',
    },
    tagline: {
      en: 'Z offset and automatic landing of objects on a 3D terrain Mesh.',
      ru: 'Смещение по Z и посадка объектов на 3D-сетку рельефа.',
    },
    whatItDoes: {
      en: [
        'Z offset in mm for a group of elements',
        'Land on Mesh — sample surface elevation per object',
        'Works with objects, lamps, and columns',
      ],
      ru: [
        'Смещение по Z (мм) для группы элементов',
        'Посадка на Mesh — высота каждого по поверхности',
        'Объекты, светильники, колонны',
      ],
    },
    solutions: ['landscape-helper'],
    compatibility: pluginCompatibility,
    videos: [
      {
        src: '/media/Ground/Land-on-mesh/preview.mp4',
        caption: {
          en: 'Land objects on a 3D terrain Mesh',
          ru: 'Посадка объектов на 3D-сетку рельефа',
        },
      },
      {
        src: '/media/Ground/Z-offset/preview.mp4',
        caption: {
          en: 'Apply Z offset to a group of elements',
          ru: 'Смещение группы элементов по Z',
        },
      },
    ],
  },
  {
    order: 10,
    slug: 'dimensions',
    name: {
      en: 'Dimensions & markup',
      ru: 'Разметка и размеры',
    },
    tagline: {
      en: 'Automatic dimension chains along paths and between objects.',
      ru: 'Автоматическая простановка размеров по шагу и между объектами.',
    },
    whatItDoes: {
      en: [
        'Dimension chain perpendicular to a direction with step',
        'From object anchors to a reference line',
        'Between selected objects',
        'From objects to a picked point',
      ],
      ru: [
        'Цепочка размеров перпендикулярно направлению с шагом',
        'От точек привязки объектов до линии',
        'Между выбранными объектами',
        'От объектов до указанной точки',
      ],
    },
    solutions: ['landscape-helper'],
    compatibility: pluginCompatibility,
    videos: [
      {
        src: '/media/Dimensions/Dimensions-by-direction/preview.mp4',
        caption: {
          en: 'Dimension chain perpendicular to direction with step',
          ru: 'Цепочка размеров перпендикулярно направлению с шагом',
        },
      },
      {
        src: '/media/Dimensions/Dimensions-to-line/preview.mp4',
        caption: {
          en: 'Dimensions from object anchors to a reference line',
          ru: 'Размеры от точек привязки объектов до линии',
        },
      },
    ],
  },
  {
    order: 11,
    slug: 'beams',
    name: {
      en: 'Beam orientation',
      ru: 'Ориентация балок',
    },
    tagline: {
      en: 'Align beams to a 3D Mesh surface and rotate by a given angle.',
      ru: 'Выравнивание балок по 3D-сетке и поворот на заданный угол.',
    },
    whatItDoes: {
      en: [
        'Surface alignment — beams follow terrain, length preserved',
        'Angle rotation in degrees',
        'For decks, bridges, and structures on slopes',
      ],
      ru: [
        'По поверхности — балки следуют рельефу с сохранением длины',
        'Поворот на заданный угол (°)',
        'Настилы, мосты, конструкции на перепаде высот',
      ],
    },
    solutions: ['landscape-helper'],
    compatibility: pluginCompatibility,
    videos: [
      {
        src: '/media/beams/preview.mp4',
        caption: {
          en: 'Align beams to a 3D Mesh surface and rotate by angle',
          ru: 'Выравнивание балок по 3D-сетке и поворот на заданный угол',
        },
      },
    ],
  },
]

export function getBlockBySlug(slug: string): FeatureBlock | undefined {
  return featureBlocks.find((b) => b.slug === slug)
}

export function getAllBlockSlugs(): string[] {
  return featureBlocks.map((b) => b.slug)
}

/** Sorted catalog for home page */
export function getFeatureBlocks(): FeatureBlock[] {
  return [...featureBlocks].sort((a, b) => a.order - b.order)
}
