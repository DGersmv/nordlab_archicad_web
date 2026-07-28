import type { ChangelogEntry, SolutionId } from './types'

export interface SolutionMeta {
  id: SolutionId
  name: string
  changelog: Omit<ChangelogEntry, 'pluginSlug'>[]
}

export const solutions: Record<SolutionId, SolutionMeta> = {
  'dwg-mesh': {
    id: 'dwg-mesh',
    name: 'MeshMaster',
    changelog: [
      {
        date: '2025-11-12',
        version: '1.2.0',
        text: {
          en: 'Improved text mark parsing for mixed-layer DWG imports.',
          ru: 'Улучшен разбор текстовых отметок при импорте DWG со смешанными слоями.',
        },
      },
    ],
  },
  'opening-master': {
    id: 'opening-master',
    name: 'OpeningMaster',
    changelog: [
      {
        date: '2026-07-28',
        version: '2.0.3',
        text: {
          en:
            'Arch opening propagation fix (AC 27/28/29): finish-wall holes keep the parent arch contour (omPoly arcs and lunette geometry) instead of degrading to a rectangle; corrected mirror and wall-side orientation on finish segments; improved GS arch/quarter-circle detection and ParamTransfer omPoly verification.',
          ru:
            'Исправлена пропагация арочных проёмов (AC 27/28/29): на отделочных стенах сохраняется контур родителя (дуги omPoly, lunette) без деградации в прямоугольник; исправлены зеркалирование и ориентация относительно стороны стены; улучшено распознавание арок/четвертей GS и верификация omPoly при переносе параметров.',
        },
      },
      {
        date: '2026-07-14',
        version: '2.0.2',
        text: {
          en:
            'Propagation policy and palette fix (AC 27/28/29): finish holes keep the full parent opening size (no width/height shrink); glue/cluster detection tightened for selected layer walls; auto-sync on parent edit disabled (Propagate manually — delete still purges children); quieter release logging; closed palette no longer reopens after Archicad restart.',
          ru:
            'Политика пропагации и фикс палитры (AC 27/28/29): на отделочных стенах сохраняется полный размер родительского проёма (без ужатия по ширине/высоте); ужесточён glue/cluster для выбранных слоёв; автосинхронизация при правке родителя отключена (Propagate вручную — при удалении родителя дети по-прежнему чистятся); тише логи в релизе; закрытая палитра больше не открывается после перезапуска Archicad.',
        },
      },
      {
        date: '2026-07-14',
        version: '2.0.1',
        text: {
          en:
            'Propagation and sync polish (AC 27/28/29): vertical clip and junction anchors on partial finish segments, glued-layer cluster detection regardless of wall draw direction, deferred parent sync with GUID remap, purge of stale children on re-propagate, and refined NL Universal Opening 2D/3D GDL (WALLHOLE2 arcs and polygon stretch).',
          ru:
            'Доработка пропагации и синхронизации (AC 27/28/29): вертикальный клип и якоря на стыках при частичном перекрытии отделочных сегментов, поиск glued-кластера слоёв независимо от направления стены, отложенная синхронизация родителя с remapping GUID, очистка устаревших дочерних проёмов при повторной пропагации и уточнённый GDL NL Universal Opening (WALLHOLE2, дуги и stretch полигона).',
        },
      },
      {
        date: '2026-07-13',
        version: '2.0.0',
        text: {
          en:
            'Major rework: custom NL Universal Opening GDL (polygon up to 20 vertices, arc edges, niches, plan/3D hotspots); convert GS windows by transferring real shape from library addPars (iWindowShape, arch, shoulder, ellipse, custom contour) instead of a silent rectangle; in-place ParamTransfer plus ShapeExtractor fallback; IFC Pset Nordlab_OpeningMaster; palette convert / propagate / refresh / delete with unified undo.',
          ru:
            'Крупная переработка: собственный GDL NL Universal Opening (полигон до 20 вершин, дуги, ниши, хотспоты на плане и в 3D); конвертация окон GS с переносом реальной формы из addPars библиотеки (iWindowShape, арка, бровка, эллипс, произвольный контур) вместо молчаливого прямоугольника; ParamTransfer на месте и fallback ShapeExtractor; IFC Pset Nordlab_OpeningMaster; палитра convert / propagate / refresh / delete с единым undo.',
        },
      },
      {
        date: '2026-07-07',
        version: '1.5.0',
        text: {
          en:
            'Earlier propagation core: glued finish-wall detection in core coordinates, full layer clusters in the palette, propagated delete via classification, and batched propagate/delete/refresh undo steps. Removed Teamwork auto-reservation and the internal test menu.',
          ru:
            'База пропагации до 2.0: детект glued finish-стен в координатах core, полный кластер слоёв в палитре, удаление propagated через классификацию и объединённый undo для propagate/delete/refresh. Убраны авторезервация Teamwork и внутренний test-menu.',
        },
      },
    ],
  },
  'gdl-to-mesh': {
    id: 'gdl-to-mesh',
    name: 'GDL to Mesh',
    changelog: [],
  },
  shellset: {
    id: 'shellset',
    name: 'ShellSet',
    changelog: [
      {
        date: '2025-09-03',
        version: '2.0.1',
        text: {
          en: 'Fixed ruled shell closure on open spline paths.',
          ru: 'Исправлено замыкание ruled shell на открытых сплайнах.',
        },
      },
    ],
  },
  tableset: {
    id: 'tableset',
    name: 'TableSet',
    changelog: [
      {
        date: '2026-07-14',
        version: '1.1.0',
        text: {
          en:
            'Selection table and layers polish (AC 27/28/29): classification column with element-type fallback when no class is set; bulk ID assigns the same ID to all selected elements (no -01/-02 suffixes); resizable columns and grouping; multilingual ID/Layers UI; trial and activation from the launcher palette.',
          ru:
            'Доработка таблицы выделения и слоёв (AC 27/28/29): колонка классификации с fallback на тип элемента (Стена/Окно…); массовое назначение одного ID без суффиксов -01/-02; изменяемая ширина колонок и группировка; мультиязычный UI ID/Слои; trial и активация из launcher-палитры.',
        },
      },
    ],
  },
  'landscape-helper': {
    id: 'landscape-helper',
    name: 'LandscapeHelper',
    changelog: [
      {
        date: '2025-10-20',
        version: '3.1.0',
        text: {
          en: 'Distribution: multiple paths in one run.',
          ru: 'Распределение: несколько трасс за одну операцию.',
        },
      },
    ],
  },
  'gh-dimensioning': {
    id: 'gh-dimensioning',
    name: 'GH Point Export',
    changelog: [],
  },
}

export function getSolution(id: SolutionId): SolutionMeta {
  return solutions[id]
}
