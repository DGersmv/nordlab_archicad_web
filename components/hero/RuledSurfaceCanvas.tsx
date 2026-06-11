'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const RULING_COUNT = 40
const MAX_CANVAS_PX = 2048

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

export default function RuledSurfaceCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = containerRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xfcfbf7)

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0.5, 4.2)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const canvasEl = renderer.domElement
    canvasEl.style.display = 'block'
    canvasEl.style.width = '100%'
    canvasEl.style.height = '100%'
    mount.appendChild(canvasEl)

    const railA = {
      p0: new THREE.Vector3(-1.6, -0.35, 0),
      p1: new THREE.Vector3(-0.5, 0.85, 0.2),
      p2: new THREE.Vector3(0.6, -0.55, -0.15),
      p3: new THREE.Vector3(1.6, 0.25, 0),
    }
    const railB = {
      p0: new THREE.Vector3(-1.6, -0.75, 0),
      p1: new THREE.Vector3(-0.4, 0.15, 0.1),
      p2: new THREE.Vector3(0.7, -0.95, -0.1),
      p3: new THREE.Vector3(1.6, -0.15, 0),
    }

    const railMaterial = new THREE.LineBasicMaterial({ color: 0x1b1d1f })
    const rulingMaterial = new THREE.LineBasicMaterial({
      color: 0x2547c8,
      transparent: true,
      opacity: 0.55,
    })

    const railAGeo = new THREE.BufferGeometry()
    const railBGeo = new THREE.BufferGeometry()
    const rulingsGeo = new THREE.BufferGeometry()

    const railALine = new THREE.Line(railAGeo, railMaterial)
    const railBLine = new THREE.Line(railBGeo, railMaterial)
    const rulings = new THREE.LineSegments(rulingsGeo, rulingMaterial)
    scene.add(railALine, railBLine, rulings)

    const handles: { mesh: THREE.Mesh; key: keyof typeof railA }[] = []
    const handleMat = new THREE.MeshBasicMaterial({ color: 0x2547c8 })
    ;(['p1', 'p2'] as const).forEach((key) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), handleMat)
      mesh.position.copy(railA[key])
      mesh.userData = { key, curve: 'A' as const }
      scene.add(mesh)
      handles.push({ mesh, key })
    })
    ;(['p1', 'p2'] as const).forEach((key) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), handleMat)
      mesh.position.copy(railB[key])
      mesh.userData = { key, curve: 'B' as const }
      scene.add(mesh)
      handles.push({ mesh, key })
    })

    function pointOnRail(rail: typeof railA, t: number) {
      return new THREE.Vector3(
        cubicBezier(t, rail.p0.x, rail.p1.x, rail.p2.x, rail.p3.x),
        cubicBezier(t, rail.p0.y, rail.p1.y, rail.p2.y, rail.p3.y),
        cubicBezier(t, rail.p0.z, rail.p1.z, rail.p2.z, rail.p3.z),
      )
    }

    function updateGeometry() {
      const railPointsA: number[] = []
      const railPointsB: number[] = []
      const rulingPoints: number[] = []

      for (let i = 0; i <= 64; i++) {
        const t = i / 64
        const a = pointOnRail(railA, t)
        const b = pointOnRail(railB, t)
        railPointsA.push(a.x, a.y, a.z)
        railPointsB.push(b.x, b.y, b.z)
      }

      for (let i = 0; i <= RULING_COUNT; i++) {
        const t = i / RULING_COUNT
        const a = pointOnRail(railA, t)
        const b = pointOnRail(railB, t)
        rulingPoints.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }

      railAGeo.setAttribute('position', new THREE.Float32BufferAttribute(railPointsA, 3))
      railBGeo.setAttribute('position', new THREE.Float32BufferAttribute(railPointsB, 3))
      rulingsGeo.setAttribute('position', new THREE.Float32BufferAttribute(rulingPoints, 3))

      handles.forEach(({ mesh, key }) => {
        const curve = mesh.userData.curve === 'A' ? railA : railB
        mesh.position.copy(curve[key])
      })
    }

    updateGeometry()

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let dragging: THREE.Mesh | null = null
    let idle = 0

    function resize() {
      const el = containerRef.current
      if (!el) return
      const { width, height } = el.getBoundingClientRect()
      const w = Math.min(Math.floor(width), MAX_CANVAS_PX)
      const h = Math.min(Math.floor(height), MAX_CANVAS_PX)
      if (w < 1 || h < 1) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    function onPointerDown(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(handles.map((h) => h.mesh))
      if (hits[0]) {
        dragging = hits[0].object as THREE.Mesh
        idle = 0
        renderer.domElement.setPointerCapture(e.pointerId)
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging) return
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
      const hit = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, hit)
      const key = dragging.userData.key as keyof typeof railA
      const curve = dragging.userData.curve === 'A' ? railA : railB
      curve[key].copy(hit)
      updateGeometry()
    }

    function onPointerUp(e: PointerEvent) {
      if (dragging) {
        renderer.domElement.releasePointerCapture(e.pointerId)
        dragging = null
      }
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)

    let frameId = 0
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      if (!dragging) {
        idle += 0.003
        scene.rotation.y = Math.sin(idle) * 0.15
      }
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="h-[240px] w-full overflow-hidden md:h-[320px]" />
}
