import { pluginCompatibility } from './compat'
import type { FeatureBlock } from './types'

export const featureBlocks: FeatureBlock[] = [
  {
    order: 1,
    slug: 'meshmaster',
    price: {
      rub: 3000,
      eur: 30,
    },
    name: {
      en: 'MeshMaster',
      ru: 'MeshMaster',
    },
    tagline: {
      en: 'DWG survey import, mesh editing, mesh merging, and pattern-based column placement in one terrain workflow.',
      ru: 'Импорт топосъёмки из DWG, редактирование mesh, объединение mesh и расстановка колонн по условным обозначениям в одном terrain workflow.',
    },
    whatItDoes: {
      en: [
        'Creates a topo Mesh from DWG survey geometry and nearby elevation text',
        'Works with separate geometry/text layers, arcs, polylines, and both dot or comma decimals',
        'Lets you preview parsed elevations, tune search radius, choose story, layer, and datum offset before creation',
        'Includes 3D mesh editing tools: vertical offset plus fill-driven flat or sloped elevation changes',
        'Merges multiple meshes into one output mesh and places columns from repeated line-and-text symbols in the DWG',
      ],
      ru: [
        'Создаёт топографический Mesh по геометрии топосъёмки из DWG и ближайшим текстовым отметкам',
        'Работает с раздельными слоями геометрии и текста, дугами, полилиниями и форматами чисел с точкой или запятой',
        'Позволяет заранее проверить распознанные отметки, настроить радиус поиска, выбрать этаж, слой и базовую отметку',
        'Содержит инструменты 3D-редактирования mesh: вертикальный сдвиг и изменение отметки по штриховке, включая уклон',
        'Объединяет несколько mesh в один и расставляет колонны по повторяющимся line/text-обозначениям в DWG',
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
    download: {
      url: '/download#meshmaster',
      label: {
        en: 'Download trial',
        ru: 'Скачать trial',
      },
    },
  },
  {
    order: 2,
    slug: 'tableset',
    price: {
      rub: 3000,
      eur: 30,
    },
    name: {
      en: 'TableSet',
      ru: 'TableSet',
    },
    tagline: {
      en: 'Selection analysis, fast reselection, inline ID edits, and batch ID / layer management for live Archicad workflows.',
      ru: 'Анализ выделения, быстрое перевыделение, редактирование ID прямо в таблице и пакетная работа с ID / слоями для живых Archicad workflow.',
    },
    whatItDoes: {
      en: [
        'Shows a live selection table grouped by type, ID, and layer, with counts per group',
        'Sorts and filters groups with checkboxes, then applies the checked groups back to the Archicad selection',
        'Supports inline editing of IDs directly from the selection table palette',
        'Includes a separate ID / Layers palette for mass ID assignment and layer-based organization',
        'Creates new layer folders and layers, moves the current selection there, and can hide the created layer immediately',
      ],
      ru: [
        'Показывает живую таблицу выделения с группировкой по типу, ID и слою и количеством элементов в группе',
        'Сортирует и фильтрует группы чекбоксами, а затем применяет отмеченные группы обратно к выделению Archicad',
        'Поддерживает редактирование ID прямо внутри палитры таблицы выделения',
        'Имеет отдельную палитру ID / Layers для массового назначения ID и организации элементов по слоям',
        'Создаёт новые папки слоёв и слои, переносит туда текущее выделение и при необходимости сразу скрывает новый слой',
      ],
    },
    solutions: ['tableset'],
    compatibility: pluginCompatibility,
    videos: [
      {
        src: '/media/tableset/preview.mp4',
        caption: {
          en: 'Selection table, reselection, inline ID edit, and layer workflows in TableSet',
          ru: 'Таблица выделения, перевыделение, редактирование ID и работа со слоями в TableSet',
        },
      },
    ],
    download: {
      url: '/download#tableset',
      label: {
        en: 'Download trial',
        ru: 'Скачать trial',
      },
    },
  },
  {
    order: 3,
    slug: 'openingmaster',
    price: {
      rub: 3000,
      eur: 30,
    },
    name: {
      en: 'OpeningMaster',
      ru: 'OpeningMaster',
    },
    tagline: {
      en: 'Propagates openings from core walls into glued finish walls and keeps them in sync through a live control palette.',
      ru: 'Пропагирует проёмы из core-стен в примыкающие отделочные стены и держит их в синхронизации через live-палитру управления.',
    },
    whatItDoes: {
      en: [
        'Analyzes the current wall selection and detects core walls, finish targets, and already propagated openings',
        'Propagates openings from parent walls into adjacent glued finish walls rather than simple one-to-one copying',
        'Provides palette actions for update, propagate, refresh sync, and delete propagated openings',
        'Automatically re-syncs propagated openings when the parent opening changes and removes children when the parent is deleted',
        'Tracks propagated children with classification and attached user data, and shows grouped wall/opening status in the palette',
      ],
      ru: [
        'Анализирует текущее выделение стен и определяет core-стены, целевые отделочные стены и уже созданные propagated openings',
        'Пропагирует проёмы из родительских стен в примыкающие glued finish walls, а не просто копирует один к одному',
        'Даёт в палитре действия update, propagate, refresh sync и delete propagated openings',
        'Автоматически пересинхронизирует propagated openings при изменении родительского проёма и удаляет дочерние при удалении родителя',
        'Хранит propagated children через classification и user data и показывает сгруппированное состояние стен и проёмов в палитре',
      ],
    },
    solutions: ['opening-master'],
    compatibility: pluginCompatibility,
    mediaPlaceholder: {
      en: 'Opening propagation palette preview coming soon',
      ru: 'Превью палитры пропагации проёмов будет добавлено позже',
    },
    download: {
      url: '/download#openingmaster',
      label: {
        en: 'Download trial',
        ru: 'Скачать trial',
      },
    },
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
